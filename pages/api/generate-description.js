export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { placeName, placeType, userPreferences, city, country } = req.body

    const prompt = `Genera una descripción profesional y atractiva para un lugar turístico EN ESPAÑOL.

DETALLES DEL LUGAR:
- Nombre: ${placeName}
- Tipo: ${placeType}
- Ciudad: ${city}, ${country}
- Tipo de Experiencia del Usuario: ${userPreferences}

REQUISITOS:
- 150-200 palabras
- Tono profesional pero entusiasta
- Conectar con las preferencias ${userPreferences} del usuario
- Incluir contexto histórico y significado cultural
- Explicar por qué este lugar encaja con su estilo de viaje
- Invitar a realizar actividades relacionadas con ${placeType}
- Hacer que sea atractivo e informativo
- RESPONDER ÚNICAMENTE EN ESPAÑOL

Genera SOLO el texto de la descripción, sin JSON ni formato adicional.`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    
    // const response = await fetch('http://localhost:10000/chat', {
    const response = await fetch('http://groq-backend-blond.vercel.app/chat', {
      
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        sessionId: `desc-${Date.now()}`
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    const aiResponse = data.output || data.data?.text || 'Lugar de interés turístico con gran valor histórico y cultural.'
    
    res.status(200).json({ 
      description: aiResponse
    })
    
  } catch (error) {
    console.error('Description generation error:', error)
    res.status(500).json({ 
      description: 'Lugar de interés turístico con gran valor histórico y cultural.'
    })
  }
}