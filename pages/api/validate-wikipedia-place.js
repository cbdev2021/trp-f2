export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { places } = req.body

  if (!places || !Array.isArray(places)) {
    return res.status(400).json({ error: 'Places array required' })
  }

  const validatedPlaces = []

  for (const place of places) {
    try {
      // Buscar artículo de Wikipedia
      const searchUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(place)}`
      const searchResponse = await fetch(searchUrl)
      
      if (!searchResponse.ok) {
        continue // Skip si no existe artículo
      }

      const articleData = await searchResponse.json()
      
      // Verificar si tiene imágenes
      let hasImages = false
      
      // Verificar imagen principal del artículo
      if (articleData.thumbnail || articleData.originalimage) {
        hasImages = true
      } else {
        // Verificar imágenes en media-list
        const imagesUrl = `https://es.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(place)}`
        const imagesResponse = await fetch(imagesUrl)
        
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json()
          const imageFiles = imagesData.items?.filter(item => 
            item.type === 'image' && 
            !item.title.toLowerCase().includes('commons-logo') &&
            !item.title.toLowerCase().includes('wikimedia') &&
            (item.title.toLowerCase().includes('.jpg') || 
             item.title.toLowerCase().includes('.jpeg') || 
             item.title.toLowerCase().includes('.png'))
          ) || []
          
          hasImages = imageFiles.length > 0
        }
      }

      if (hasImages) {
        validatedPlaces.push({
          name: place,
          wikipediaTitle: articleData.title,
          hasArticle: true,
          hasImages: true,
          description: articleData.extract?.substring(0, 200) + '...' || ''
        })
      }

    } catch (error) {
      console.error(`Error validating ${place}:`, error)
      continue
    }
  }

  res.status(200).json({
    validatedPlaces,
    totalValidated: validatedPlaces.length,
    totalRequested: places.length
  })
}