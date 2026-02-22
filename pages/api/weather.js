const apiKeys = [
  'v1gpjd491yzlgwhfqzcb5nxekrdlk6lnkcy47b6q',
  't60knc4gkrco5ut7rw0tr632qjxyqksnyc82yxuz',
  'm2zk2berhx2mn7vz3advvo5nupfss9cj3gy89cm2',
  'j2qu3eoua6czv12ocxxz2zzb0fcqhlighwt0t9ei'
]

let currentKeyIndex = 0

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  
  const { lat, lon, place } = req.query
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Coordinates required' })
  }

  // Try each API key until one works
  for (let attempt = 0; attempt < apiKeys.length; attempt++) {
    const apiKey = apiKeys[currentKeyIndex]
    
    try {
      const response = await fetch(
        `https://www.meteosource.com/api/v1/free/point?sections=current&lat=${lat}&lon=${lon}&language=en&units=auto&key=${apiKey}`,
        {
          headers: {
            'accept': 'application/json',
            'Cookie': 'HCLBSTICKY=b2649158ba9efc6f9b7d3455005dd927|Zlbaj|ZlbZt; HCLBSTICKY=b2649158ba9efc6f9b7d3455005dd927|aN4h8|aN4h7'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        
        if (data.current && data.current.temperature !== undefined) {
          const temp = Math.round(data.current.temperature)
          const condition = data.current.summary || 'Clear'
          
          return res.json({
            temperature: temp,
            icon: getWeatherIcon(condition),
            time: new Date().toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          })
        }
      }
      
    } catch (error) {
      // Continue to next key
    }
    
    // Rotate to next key
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length
  }
  
  // Fallback
  return res.json({
    temperature: 18,
    icon: '🌤️',
    time: new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  })
}

function getWeatherIcon(condition) {
  const desc = condition.toLowerCase()
  
  if (desc.includes('sunny') || desc.includes('clear')) return '☀️'
  if (desc.includes('cloud')) return '☁️'
  if (desc.includes('rain')) return '🌧️'
  if (desc.includes('snow')) return '❄️'
  
  return '🌤️'
}