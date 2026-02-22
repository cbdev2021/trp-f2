import { useState, useEffect } from 'react'

export const useWeather = (coordinates, placeName) => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!coordinates?.lat || !coordinates?.lon) return

    const fetchWeather = async () => {
      setLoading(true)
      
      try {
        const params = new URLSearchParams({
          lat: coordinates.lat,
          lon: coordinates.lon,
          place: placeName || ''
        })
        
        const response = await fetch(`/api/weather?${params}`)
        const data = await response.json()
        
        if (!data.error) {
          setWeather(data)
        }
      } catch (err) {
        console.error('Error fetching weather:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [coordinates?.lat, coordinates?.lon, placeName])

  return { weather, loading }
}