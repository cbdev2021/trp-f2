export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { place, city, country, wikipedia_url } = req.query

  if (!place) {
    return res.status(400).json({ error: 'Place parameter required' })
  }

  // Si tenemos URL de Wikipedia, extraer el título del artículo
  let directTitle = null
  if (wikipedia_url) {
    try {
      const url = new URL(wikipedia_url)
      const pathParts = url.pathname.split('/')
      directTitle = decodeURIComponent(pathParts[pathParts.length - 1])
    } catch (error) {
      console.error('Error parsing Wikipedia URL:', error)
    }
  }

  let articleData = null
  let successfulSearch = null
  let images = []

  // INTENTO 1: Nombre original + variaciones
  const attempt1Variations = [place, `Termas ${place}`, `${place} termas`]
  
  for (const variation of attempt1Variations) {
    try {
      const searchUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(variation)}`
      const searchResponse = await fetch(searchUrl)
    
      if (searchResponse.ok) {
        articleData = await searchResponse.json()
        successfulSearch = variation
        
        // Intentar obtener imágenes
        const imagesUrl = `https://es.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(variation)}`
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
          
          for (const imageFile of imageFiles.slice(0, 6)) {
            try {
              const imageInfoUrl = `https://commons.wikimedia.org/api/rest_v1/file/${encodeURIComponent(imageFile.title)}`
              const imageInfoResponse = await fetch(imageInfoUrl)
              
              if (imageInfoResponse.ok) {
                const imageInfo = await imageInfoResponse.json()
                images.push({
                  title: imageFile.title.replace('File:', ''),
                  url: imageInfo.original?.source || '',
                  thumbnail: imageInfo.thumbnail?.source || imageInfo.original?.source || '',
                  source: 'Wikipedia Commons'
                })
              }
            } catch (error) {
              continue;
            }
          }
          
          // Si no hay imágenes pero hay thumbnail en el artículo
          if (images.length === 0 && articleData.thumbnail) {
            images.push({
              title: articleData.title,
              url: articleData.originalimage?.source || articleData.thumbnail.source,
              thumbnail: articleData.thumbnail.source,
              source: 'Wikipedia'
            })
          }
          
          // Si encontró imágenes, terminar aquí
          if (images.length > 0) {
            return res.status(200).json({
              place: articleData.title,
              description: articleData.extract,
              searchTerm: successfulSearch,
              originalPlace: place,
              images: images.filter(img => img.url)
            })
          }
        }
      }
    } catch (error) {
      continue;
    }
  }

  // Si llegamos aquí del intento 1 sin imágenes, continuar con intento 2

  // INTENTO 2: Con ciudad
  if (city && images.length === 0) {
    try {
      const searchTerm = `${place} (${city})`
      const searchUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`
      const searchResponse = await fetch(searchUrl)
      
      if (searchResponse.ok) {
        articleData = await searchResponse.json()
        successfulSearch = searchTerm
        
        // Repetir proceso de imágenes
        const imagesUrl = `https://es.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(searchTerm)}`
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
          
          for (const imageFile of imageFiles.slice(0, 6)) {
            try {
              const imageInfoUrl = `https://commons.wikimedia.org/api/rest_v1/file/${encodeURIComponent(imageFile.title)}`
              const imageInfoResponse = await fetch(imageInfoUrl)
              
              if (imageInfoResponse.ok) {
                const imageInfo = await imageInfoResponse.json()
                images.push({
                  title: imageFile.title.replace('File:', ''),
                  url: imageInfo.original?.source || '',
                  thumbnail: imageInfo.thumbnail?.source || imageInfo.original?.source || '',
                  source: 'Wikipedia Commons'
                })
              }
            } catch (error) {
              continue
            }
          }
          
          if (images.length === 0 && articleData.thumbnail) {
            images.push({
              title: articleData.title,
              url: articleData.originalimage?.source || articleData.thumbnail.source,
              thumbnail: articleData.thumbnail.source,
              source: 'Wikipedia'
            })
          }
          
          if (images.length > 0) {
            return res.status(200).json({
              place: articleData.title,
              description: articleData.extract,
              searchTerm: successfulSearch,
              originalPlace: place,
              images: images.filter(img => img.url)
            })
          }
        }
      }
    } catch (error) {
      // Continuar al siguiente intento
    }
  }

  // INTENTO 3: Con país
  if (country && images.length === 0) {
    try {
      const searchTerm = `${place} (${country})`
      const searchUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`
      const searchResponse = await fetch(searchUrl)
      
      if (searchResponse.ok) {
        articleData = await searchResponse.json()
        successfulSearch = searchTerm
        
        // Repetir proceso de imágenes
        const imagesUrl = `https://es.wikipedia.org/api/rest_v1/page/media-list/${encodeURIComponent(searchTerm)}`
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
          
          for (const imageFile of imageFiles.slice(0, 6)) {
            try {
              const imageInfoUrl = `https://commons.wikimedia.org/api/rest_v1/file/${encodeURIComponent(imageFile.title)}`
              const imageInfoResponse = await fetch(imageInfoUrl)
              
              if (imageInfoResponse.ok) {
                const imageInfo = await imageInfoResponse.json()
                images.push({
                  title: imageFile.title.replace('File:', ''),
                  url: imageInfo.original?.source || '',
                  thumbnail: imageInfo.thumbnail?.source || imageInfo.original?.source || '',
                  source: 'Wikipedia Commons'
                })
              }
            } catch (error) {
              continue
            }
          }
          
          if (images.length === 0 && articleData.thumbnail) {
            images.push({
              title: articleData.title,
              url: articleData.originalimage?.source || articleData.thumbnail.source,
              thumbnail: articleData.thumbnail.source,
              source: 'Wikipedia'
            })
          }
        }
      }
    } catch (error) {
      // Último intento falló
    }
  }

  // Si llegamos aquí, devolver lo que tengamos
  return res.status(200).json({
    place: articleData?.title || place,
    description: articleData?.extract || 'No description available',
    searchTerm: successfulSearch || place,
    originalPlace: place,
    images: images.filter(img => img.url)
  })
}