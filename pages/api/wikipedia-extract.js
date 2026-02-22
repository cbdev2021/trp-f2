export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { place, city, country } = req.query

  if (!place) {
    return res.status(400).json({ error: 'Place parameter required' })
  }

  const searchVariations = [
    place,
    city ? `${place} (${city})` : null,
    country ? `${place} (${country})` : null,
    `${place} Chile`,
    `${place} turismo`
  ].filter(Boolean)

  for (const searchTerm of searchVariations) {
    try {
      // Buscar el artículo completo
      const searchUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`
      const searchResponse = await fetch(searchUrl)
      
      if (searchResponse.ok) {
        const summaryData = await searchResponse.json()
        
        // Obtener contenido completo del artículo
        const contentUrl = `https://es.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(searchTerm)}&prop=extracts&exintro=0&explaintext=1&exsectionformat=plain&exchars=2000`
        const contentResponse = await fetch(contentUrl)
        
        if (contentResponse.ok) {
          const contentData = await contentResponse.json()
          const pages = contentData.query?.pages
          
          if (pages) {
            const pageId = Object.keys(pages)[0]
            const page = pages[pageId]
            
            if (page && page.extract && page.extract.length > 100) {
              // Limpiar y formatear el texto
              let extract = page.extract
                .replace(/\n\n+/g, '\n\n')
                .replace(/==.*?==/g, '')
                .trim()
              
              // Dividir en párrafos y tomar los primeros 3-4
              const paragraphs = extract.split('\n\n').filter(p => p.trim().length > 50)
              const longDescription = paragraphs.slice(0, 4).join('\n\n')
              
              return res.status(200).json({
                place: summaryData.title || searchTerm,
                shortDescription: summaryData.extract || '',
                longDescription: longDescription || summaryData.extract || '',
                searchTerm: searchTerm,
                originalPlace: place,
                success: true
              })
            }
          }
        }
        
        // Si no hay contenido largo, usar el resumen
        if (summaryData.extract) {
          return res.status(200).json({
            place: summaryData.title || searchTerm,
            shortDescription: summaryData.extract,
            longDescription: summaryData.extract,
            searchTerm: searchTerm,
            originalPlace: place,
            success: true
          })
        }
      }
    } catch (error) {
      console.error(`Error searching for ${searchTerm}:`, error)
      continue
    }
  }

  // Si no se encontró nada
  return res.status(200).json({
    place: place,
    shortDescription: 'Lugar de interés turístico.',
    longDescription: 'Este es un lugar de interés turístico que vale la pena visitar. Ofrece una experiencia única para los visitantes y forma parte del patrimonio cultural y natural de la región.',
    searchTerm: place,
    originalPlace: place,
    success: false
  })
}