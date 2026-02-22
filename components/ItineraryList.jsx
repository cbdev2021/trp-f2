import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { aprobarRuta, resetTour, setSelectedPoint } from '../store/tourSlice'
import { useState, useEffect } from 'react'
import TripPlanLogo from './TripPlanLogo'
import ConfirmDialog from './ConfirmDialog'
import jsPDF from 'jspdf'
import { useWeather } from '../hooks/useWeather'

export default function ItineraryList() {
  const { rutaGenerada, rutaAprobada, selectedCity, detectedCity, stepC, stepA, stepE, selectedPoint } = useSelector(state => state.tour)
  const dispatch = useDispatch()
  const router = useRouter()
  
  const cleanUndefinedText = (text) => {
    if (!text) return null
    return text.replace(/undefined\s*/gi, '').trim() || null
  }
  
  const getPointTitle = (punto) => {
    if (punto.orden === 1 && stepE.startingPointTitle) {
      return cleanUndefinedText(stepE.startingPointTitle) || stepE.startingPointTitle
    }
    const title = punto.nombre || punto.name || null
    return cleanUndefinedText(title) || title
  }
  
  const targetCity = selectedCity || detectedCity
  const isMultiCiudades = rutaGenerada?.tipo_tour === 'multi_ciudades'

  if (!rutaGenerada) return null
  
  const getTransportIcon = (transporte) => {
    const icons = {
      caminata: '🚶',
      bicicleta: '🚴', 
      transporte_publico: '🚌',
      vehiculo_propio: '🚗',
      taxi_uber: '🚕'
    }
    return icons[transporte] || '🚶'
  }
  
  // Cálculos según tipo de tour
  const getCalculos = () => {
    if (isMultiCiudades) {
      const totalDias = rutaGenerada.duracion_dias || 1
      const costoTotal = rutaGenerada.costo_total_estimado?.replace(/[^\d]/g, '') || '0'
      return {
        tiempoVisitas: 0, // Se calcula por día
        tiempoTraslados: 0,
        tiempoTotalCalculado: totalDias * 8 * 60, // 8h por día
        costoTotal: parseInt(costoTotal),
        totalDias
      }
    } else {
      const tiempoVisitas = rutaGenerada.ruta?.reduce((acc, punto) => acc + punto.duracion_min, 0) || 0
      const tiempoTraslados = rutaGenerada.transporte_total_min || 0
      const costoTotal = rutaGenerada.costo_total_estimado?.replace(/[^\d]/g, '') || '0'
      return {
        tiempoVisitas,
        tiempoTraslados,
        tiempoTotalCalculado: tiempoVisitas + tiempoTraslados,
        costoTotal: parseInt(costoTotal),
        totalDias: 1
      }
    }
  }
  
  const { tiempoVisitas, tiempoTraslados, tiempoTotalCalculado, costoTotal, totalDias } = getCalculos()

  // Obtener todos los puntos para el selectedPoint (excluyendo punto_inicio)
  const getAllPoints = () => {
    if (isMultiCiudades && rutaGenerada.dias) {
      return rutaGenerada.dias.flatMap(dia => 
        dia.ruta?.filter(punto => punto.tipo !== 'punto_inicio').map(punto => ({ ...punto, dia: dia.dia, ciudad: dia.ciudad })) || []
      )
    }
    return rutaGenerada.ruta?.filter(punto => punto.tipo !== 'punto_inicio') || []
  }

  const allPoints = getAllPoints()
  const selectedPointData = selectedPoint !== null && selectedPoint !== undefined ? allPoints[selectedPoint] : null

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = 25
      
      // Título principal
      pdf.setFontSize(22)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Ruta Turística', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += 20
      
      // Información general
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      if (rutaGenerada.ciudad) {
        pdf.text(`Ciudad: ${rutaGenerada.ciudad}`, margin, yPosition)
        yPosition += 10
      }
      
      // Línea separadora
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 15
      
      // Puntos del recorrido
      for (let i = 0; i < allPoints.length; i++) {
        const punto = allPoints[i]
        const startYPosition = yPosition
        
        // Verificar espacio en página
        if (yPosition > pageHeight - 70) {
          pdf.addPage()
          yPosition = 25
        }
        
        // Título del punto con mejor formato
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        const title = getPointTitle(punto) || cleanUndefinedText(punto.nombre || punto.name) || 'Punto de interés'
        pdf.text(`${i + 1}. ${title}`, margin, yPosition)
        yPosition += 10
        
        // Tipo de lugar
        if (punto.tipo) {
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'italic')
          pdf.setTextColor(100, 100, 100)
          pdf.text(`${punto.tipo}`, margin, yPosition)
          pdf.setTextColor(0, 0, 0)
          yPosition += 6
        }
        
        yPosition += 2
        
        // Descripción con mejor formato
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        let description = ''
        
        const cacheKey = `${punto.lugar_fisico}-${punto.tipo}`
        if (descriptionCache[cacheKey]) {
          description = descriptionCache[cacheKey]
        } else if (punto.descripcion || punto.description) {
          description = cleanUndefinedText(punto.descripcion || punto.description)
        } else {
          description = `${title} es un lugar de interés turístico que vale la pena visitar durante tu recorrido.`
        }
        
        if (description.length > 250) {
          description = description.substring(0, 250) + '...'
        }
        
        const textWidth = pageWidth - margin * 2 - 60 // Espacio para imagen
        const lines = pdf.splitTextToSize(description, textWidth)
        pdf.text(lines, margin, yPosition)
        
        // Calcular altura del texto
        const textHeight = lines.length * 4
        
        // Agregar imagen si existe (solo si fue clickeada antes)
        const imageUrl = imageCache[cacheKey]?.[0]?.thumbnail || imageCache[cacheKey]?.[0]?.url
        if (imageUrl) {
          try {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            
            await new Promise((resolve) => {
              img.onload = () => {
                try {
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  
                  const maxWidth = 45
                  const maxHeight = 35
                  let { width, height } = img
                  
                  if (width > height) {
                    if (width > maxWidth) {
                      height = (height * maxWidth) / width
                      width = maxWidth
                    }
                  } else {
                    if (height > maxHeight) {
                      width = (width * maxHeight) / height
                      height = maxHeight
                    }
                  }
                  
                  canvas.width = width
                  canvas.height = height
                  ctx.drawImage(img, 0, 0, width, height)
                  
                  const imgData = canvas.toDataURL('image/jpeg', 0.8)
                  pdf.addImage(imgData, 'JPEG', pageWidth - margin - width, yPosition - 2, width, height)
                } catch (error) {
                  // Continuar sin imagen
                }
                resolve()
              }
              img.onerror = () => resolve()
              img.src = imageUrl
            })
          } catch (error) {
            // Continuar sin imagen
          }
        }
        
        yPosition += Math.max(textHeight, 25) + 4
        
        // Información práctica compacta
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(80, 80, 80)
        
        const infoItems = []
        if (punto.direccion_completa) infoItems.push(`📍 ${punto.direccion_completa}`)
        if (punto.horarios) infoItems.push(`🕒 ${punto.horarios}`)
        if (punto.duracion_min) infoItems.push(`Tiempo recomendado: ${punto.duracion_min} min`)
        
        infoItems.forEach((item, index) => {
          pdf.text(item, margin, yPosition)
          yPosition += 4
        })
        
        // Link individual de Google Maps para cada punto
        const coords = punto.coordenadas
        let googleMapsUrl = ''
        if (coords && coords.lat && coords.lng) {
          googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
        } else {
          const placeName = getPointTitle(punto) || punto.nombre || punto.name || 'Punto de interés'
          googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`
        }
        
        pdf.setFontSize(9)
        pdf.setTextColor(0, 0, 255)
        pdf.textWithLink('Ver ubicación en Google Maps', margin, yPosition, { url: googleMapsUrl })
        yPosition += 4
        
        // Link de imágenes de Google
        const placeName = getPointTitle(punto) || punto.nombre || punto.name || 'Punto de interés'
        const googleImagesUrl = `https://www.google.com/search?q=${encodeURIComponent(placeName)}&tbm=isch`
        pdf.textWithLink('Ver más imágenes en Google', margin, yPosition, { url: googleImagesUrl })
        pdf.setTextColor(80, 80, 80)
        yPosition += 6
        
        pdf.setTextColor(0, 0, 0)
        
        // Separador entre puntos
        yPosition += 6
        if (i < allPoints.length - 1) {
          pdf.setLineWidth(0.2)
          pdf.setDrawColor(200, 200, 200)
          pdf.line(margin, yPosition, pageWidth - margin, yPosition)
          yPosition += 8
        }
      }
      
      pdf.save('ruta-turistica.pdf')
      
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Inténtalo de nuevo.')
    }
  }

  const handleNewTour = () => {
    dispatch(resetTour())
    router.push('/')
  }

  const [selectedDay, setSelectedDay] = useState(1)
  const [wikipediaImages, setWikipediaImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [wikipediaDescription, setWikipediaDescription] = useState('')
  const [loadingDescription, setLoadingDescription] = useState(false)
  const [aiDescription, setAiDescription] = useState('')
  const [loadingAiDescription, setLoadingAiDescription] = useState(false)
  const [descriptionCache, setDescriptionCache] = useState({})
  const [imageCache, setImageCache] = useState({})
  const [animateDescription, setAnimateDescription] = useState(false)
  const [animateImage, setAnimateImage] = useState(false)
  const [carouselOffset, setCarouselOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startOffset, setStartOffset] = useState(0)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [modalImageSrc, setModalImageSrc] = useState('')
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)

  // Verificar soporte de Web Speech API
  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window)
  }, [])

  const handleReadText = () => {
    if (!speechSupported) {
      alert('Tu navegador no soporta la función de lectura de texto')
      return
    }

    if (isReading) {
      window.speechSynthesis.cancel()
      setIsReading(false)
      return
    }

    const textToRead = aiDescription || wikipediaDescription || 
      cleanUndefinedText(selectedPointData?.descripcion || selectedPointData?.description) || 
      'No hay descripción disponible'

    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.lang = 'es-CL'
    utterance.rate = 0.9
    utterance.pitch = 1
    
    utterance.onstart = () => setIsReading(true)
    utterance.onend = () => setIsReading(false)
    utterance.onerror = () => setIsReading(false)
    
    window.speechSynthesis.speak(utterance)
  }
  
  const handlePointClick = (index) => {
    if (!isDragging) {
      dispatch(setSelectedPoint(index))
    }
  }

  const handleDragStart = (e) => {
    setIsDragging(true)
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
    setStartX(clientX)
    setStartOffset(carouselOffset)
  }

  const handleDragMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
    const deltaX = clientX - startX
    setCarouselOffset(startOffset + deltaX)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    
    const cardWidth = window.innerWidth <= 480 ? 200 : window.innerWidth <= 768 ? 240 : 280
    const gap = 12
    const moveDistance = cardWidth + gap
    const maxOffset = -(allPoints.length - 1) * moveDistance
    
    // Snap to nearest position
    const nearestPosition = Math.round(carouselOffset / moveDistance) * moveDistance
    const clampedOffset = Math.max(Math.min(nearestPosition, 0), maxOffset)
    setCarouselOffset(clampedOffset)
  }

  const handleCarouselNav = (direction) => {
    const cardWidth = window.innerWidth <= 480 ? 200 : window.innerWidth <= 768 ? 240 : 280
    const gap = 12
    const moveDistance = cardWidth + gap
    
    if (direction === 'prev') {
      setCarouselOffset(prev => Math.min(prev + moveDistance, 0))
    } else {
      const maxOffset = -(allPoints.length - 1) * moveDistance
      setCarouselOffset(prev => Math.max(prev - moveDistance, maxOffset))
    }
  }

  const handleImageClick = (imageSrc) => {
    setModalImageSrc(imageSrc)
    setImageModalOpen(true)
  }

  const closeImageModal = () => {
    setImageModalOpen(false)
    setModalImageSrc('')
    setImageZoom(1)
    setImagePosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setImageZoom(prev => {
      const newZoom = Math.max(prev - 0.25, 1)
      if (newZoom === 1) {
        setImagePosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }

  const handleImageWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setImageZoom(prev => {
      const newZoom = Math.max(Math.min(prev + delta, 3), 1)
      if (newZoom === 1) {
        setImagePosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }

  const handleImagePanStart = (e) => {
    if (imageZoom > 1) {
      setIsPanning(true)
      const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
      const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY
      setPanStart({ x: clientX - imagePosition.x, y: clientY - imagePosition.y })
    }
  }

  const handleImagePanMove = (e) => {
    if (isPanning && imageZoom > 1) {
      e.preventDefault()
      const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
      const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY
      setImagePosition({
        x: clientX - panStart.x,
        y: clientY - panStart.y
      })
    }
  }

  const handleImagePanEnd = () => {
    setIsPanning(false)
  }

  // Mover carousel al primer elemento cuando cambia el día
  useEffect(() => {
    if (rutaGenerada.dias_totales > 1) {
      setCarouselOffset(0)
    }
  }, [selectedDay])

  // Cargar imágenes, descripción de Wikipedia y descripción IA cuando cambia el punto seleccionado
  useEffect(() => {
    if (selectedPointData && selectedPointData.lugar_fisico) {
      setLoadingDescription(true)
      setWikipediaDescription('')
      
      const cacheKey = `${selectedPointData.lugar_fisico}-${selectedPointData.tipo}`
      const params = new URLSearchParams({
        place: selectedPointData.lugar_fisico,
        city: 'Santiago',
        country: 'Chile'
      })
      
      // Manejo de caché para imágenes
      if (imageCache[cacheKey]) {
        // Usar imágenes cacheadas inmediatamente
        setWikipediaImages(imageCache[cacheKey])
        setLoadingImages(false)
        // Activar animación para imágenes cacheadas
        setAnimateImage(true)
        setTimeout(() => setAnimateImage(false), 300)
      } else {
        // Cargar nuevas imágenes
        setLoadingImages(true)
        setWikipediaImages([])
        
        fetch(`/api/wikipedia-images?${params.toString()}`)
          .then(res => res.json())
          .then(data => {
            if (data.images && data.images.length > 0) {
              setWikipediaImages(data.images)
              // Guardar en caché
              setImageCache(prev => ({
                ...prev,
                [cacheKey]: data.images
              }))
              // Activar animación para imágenes nuevas
              setAnimateImage(true)
              setTimeout(() => setAnimateImage(false), 300)
            }
          })
          .catch(error => {
            console.error('Error loading Wikipedia images:', error)
          })
          .finally(() => {
            setLoadingImages(false)
          })
      }
      
      // Solo mostrar loading si no hay cache para descripción
      if (!descriptionCache[cacheKey]) {
        setLoadingAiDescription(true)
        setAiDescription('')
      }
      
      // Cargar descripción larga
      fetch(`/api/wikipedia-extract?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (data.longDescription) {
            setWikipediaDescription(data.longDescription)
          }
        })
        .catch(error => {
          console.error('Error loading Wikipedia description:', error)
        })
        .finally(() => {
          setLoadingDescription(false)
        })
      
      // Cargar descripción IA contextualizada (con cache)
      if (descriptionCache[cacheKey]) {
        // Usar descripción cacheada inmediatamente
        setAiDescription(descriptionCache[cacheKey])
        setLoadingAiDescription(false)
      } else {
        // Generar nueva descripción
        fetch('/api/generate-description', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            placeName: selectedPointData.lugar_fisico,
            placeType: selectedPointData.tipo,
            userPreferences: stepC.interesesEspecificos?.join(', ') || 'turismo general',
            city: targetCity?.city || targetCity?.name || 'Ciudad',
            country: targetCity?.country || 'País'
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.description) {
              setAiDescription(data.description)
              // Guardar en cache
              setDescriptionCache(prev => ({
                ...prev,
                [cacheKey]: data.description
              }))
            }
          })
          .catch(error => {
            console.error('Error loading AI description:', error)
          })
          .finally(() => {
            setLoadingAiDescription(false)
          })
      }
    }
  }, [selectedPointData])

  const WeatherWidget = ({ coordinates, placeName }) => {
    const { weather, loading } = useWeather(coordinates, placeName)
    
    return (
      <div className="weather-widget">
        {loading ? (
          <div className="weather-loading">⏳</div>
        ) : weather ? (
          <>
            <div className="weather-icon">{weather.icon}</div>
            <span className="weather-temp">{weather.temperature}°</span>
            <span className="weather-time">{weather.time}</span>
          </>
        ) : (
          <>
            <div className="weather-icon">🌡️</div>
            <span className="weather-temp">N/A</span>
            <span className="weather-time">--:--</span>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '1rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center',
        marginBottom: '10px'
      }}>
        <TripPlanLogo 
          size="medium" 
          onClick={() => setShowConfirmDialog(true)}
        />
      </div>
      
      <div className="itinerary-list">
        <div className="itinerary-header">
          <h2>🗺️ Ruta Turística - {selectedCity?.name || selectedCity?.city || detectedCity?.city || rutaGenerada.ciudad || 'Ciudad'}</h2>
          <div className="tour-stats">
            <span>📍 {allPoints.length} puntos</span>
            {/* <span>⏱️ {Math.round(tiempoTotalCalculado/60)}h</span>
            {totalDias > 1 && <span>📅 {totalDias} días</span>} */}
          </div>
        </div>
      
      {/* Navegación de puntos al inicio */}
      {rutaAprobada && (
        <div className="route-points">
          {rutaGenerada.dias_totales > 1 ? (
            <>
              <div className="day-carousel-header">
                <h5>📍 Puntos por día:</h5>
                <div className="day-selector">
                  {Array.from({ length: rutaGenerada.dias_totales }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => {
                        setSelectedDay(i + 1)
                        // Seleccionar automáticamente el primer punto del día
                        const actividadesPorDia = rutaGenerada.actividades_por_dia || 5
                        const primerPuntoDelDia = i * actividadesPorDia
                        if (primerPuntoDelDia < allPoints.length) {
                          dispatch(setSelectedPoint(primerPuntoDelDia))
                        }
                      }}
                      className={`day-btn ${selectedDay === i + 1 ? 'active' : ''}`}
                    >
                      Día {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="day-points-container-1">
                {(() => {
                  const actividadesPorDia = rutaGenerada.actividades_por_dia || 5
                  const inicioIndice = (selectedDay - 1) * actividadesPorDia
                  const finIndice = Math.min(selectedDay * actividadesPorDia, allPoints.length)
                  const puntosDelDia = allPoints.slice(inicioIndice, finIndice)
                  
                  return (
                    <div className="points-carousel-container">
                      <button 
                        className="carousel-nav-btn carousel-prev"
                        onClick={() => handleCarouselNav('prev')}
                        disabled={carouselOffset >= 0}
                      >
                        ‹
                      </button>
                      <div 
                        className="points-carousel" 
                        style={{ transform: `translateX(${carouselOffset}px)` }}
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDragMove}
                        onTouchEnd={handleDragEnd}
                      >
                        {puntosDelDia.map((punto, index) => {
                          const globalIndex = inicioIndice + index
                          return (
                            <div 
                              key={punto.orden} 
                              className={`route-point-card ${selectedPoint === globalIndex ? 'active' : ''}`}
                              onClick={() => handlePointClick(globalIndex)}
                            >
                              <div className="point-details">
                                <div className="point-header">
                                  <span className="point-number">{globalIndex + 1}</span>
                                  <strong>{getPointTitle(punto) || cleanUndefinedText(punto.nombre || punto.name) || 'Punto de interés'}</strong>
                                </div>
                                <div className="point-category">
                                  <small>{punto.tipo}</small>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <button 
                        className="carousel-nav-btn carousel-next"
                        onClick={() => handleCarouselNav('next')}
                        disabled={carouselOffset <= -(puntosDelDia.length - 1) * (window.innerWidth <= 480 ? 212 : window.innerWidth <= 768 ? 252 : 292)}
                      >
                        ›
                      </button>
                    </div>
                  )
                })()} 
              </div>
            </>
          ) : (
            <>
              <h5>📍 Puntos de tu ruta:</h5>
              <div className="points-carousel-container">
                <button 
                  className="carousel-nav-btn carousel-prev"
                  onClick={() => handleCarouselNav('prev')}
                  disabled={carouselOffset >= 0}
                >
                  ‹
                </button>
                <div 
                  className="points-carousel" 
                  style={{ transform: `translateX(${carouselOffset}px)` }}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  {allPoints.map((punto, index) => (
                    <div 
                      key={punto.orden} 
                      className={`route-point-card ${selectedPoint === index ? 'active' : ''}`}
                      onClick={() => handlePointClick(index)}
                    >
                      <div className="point-details">
                        <div className="point-header">
                          <span className="point-number">{index + 1}</span>
                          <strong>{getPointTitle(punto) || cleanUndefinedText(punto.nombre || punto.name) || 'Punto de interés'}</strong>
                        </div>
                        <div className="point-category">
                          <small>{punto.tipo}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  className="carousel-nav-btn carousel-next"
                  onClick={() => handleCarouselNav('next')}
                  disabled={carouselOffset <= -(allPoints.length - 1) * (window.innerWidth <= 480 ? 212 : window.innerWidth <= 768 ? 252 : 292)}
                >
                  ›
                </button>
              </div>
            </>
          )}
        </div>
      )}
 
      <div className="itinerary-items">
        {selectedPointData ? (
          <div className="selected-point-detail">
            <div className="professional-point-card">
              <div className="point-info-half">
                <div className="point-content-with-weather">
                  <div className="point-content">
                    <div className="title-with-number">
                      <div className="point-number-compact">
                        <span>{selectedPoint + 1}</span>
                      </div>
                      <h3 className="point-title">{getPointTitle(selectedPointData) || cleanUndefinedText(selectedPointData.nombre || selectedPointData.name) || 'Punto de interés'}</h3>
                      <WeatherWidget 
                        coordinates={selectedPointData.coordenadas}
                        placeName={selectedPointData.lugar_fisico || selectedPointData.nombre || selectedPointData.name}
                      />
                    </div>
                    
                    <div 
                      className="wikipedia-extract animate-in"
                      key={`desc-${selectedPoint}`}
                    >
                      <div className="description-header">
                        {speechSupported && !loadingAiDescription && !loadingDescription && (aiDescription || wikipediaDescription || selectedPointData?.descripcion) && (
                          <button 
                            className={`read-text-btn ${isReading ? 'reading' : ''}`}
                            onClick={handleReadText}
                            title={isReading ? 'Detener lectura' : 'Leer descripción'}
                          >
                            {isReading ? '⏸️' : '🔊'} {isReading ? 'Detener' : 'Leer'}
                          </button>
                        )}
                      </div>
                      {aiDescription ? (
                        <p>{aiDescription}</p>
                      ) : loadingAiDescription ? (
                        <div className="ai-loading-container">
                          <img src="/RobotEmo.png" alt="Robot" className="bouncing-robot" />
                          <p>Generando descripción personalizada...</p>
                        </div>
                      ) : loadingDescription ? (
                        <p>🔍 Cargando información detallada...</p>
                      ) : wikipediaDescription ? (
                        wikipediaDescription.split('\n\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))
                      ) : (
                        <p>{cleanUndefinedText(selectedPointData.descripcion || selectedPointData.description) || 'Información del lugar turístico.'}</p>
                      )}
                    </div>
                    
                    <div className="point-metadata">
                      {selectedPointData.dia && <span className="metadata-item">📅 Día {selectedPointData.dia}</span>}
                      {selectedPointData.ciudad && <span className="metadata-item">🌍 {selectedPointData.ciudad}</span>}
                    </div>
                    
                    {selectedPointData.direccion_completa && (
                      <div className="point-address">
                        📍 {selectedPointData.direccion_completa}
                      </div>
                    )}
                    {selectedPointData.horarios && (
                      <div className="point-hours">
                        🕒 {selectedPointData.horarios}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="point-image-half">
                <button 
                  className="google-search-btn-top"
                  onClick={() => {
                    const placeName = selectedPointData.lugar_fisico || selectedPointData.nombre || selectedPointData.name
                    if (placeName) {
                      const searchQuery = encodeURIComponent(placeName)
                      window.open(`https://www.google.com/search?q=${searchQuery}&tbm=isch`, '_blank')
                    }
                  }}
                >
                  🔍 Ver más imágenes
                </button>
                
                {loadingImages ? (
                  <div className="ai-loading-container">
                    <img src="/RobotEmo.png" alt="Robot" className="bouncing-robot" />
                    <p>Cargando ...</p>
                  </div>
                ) : wikipediaImages.length > 0 ? (
                  <div 
                    className={`image-wrapper ${animateImage ? 'animate-in' : ''}`}
                    key={`img-${selectedPoint}`}
                  >
                    <img 
                      src={wikipediaImages[0].thumbnail || wikipediaImages[0].url}
                      alt={wikipediaImages[0].title}
                      onClick={() => handleImageClick(wikipediaImages[0].url || wikipediaImages[0].thumbnail)}
                      style={{ cursor: 'pointer' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                ) : null}
              </div>
              


            </div>
          </div>
        ) : (
          <div className="navigation-prompt">
            <p>Usa la navegación "Puntos por día" arriba para explorar tu ruta</p>
          </div>
        )}
      </div>

      {rutaGenerada.sugerencias_alternativas && rutaGenerada.sugerencias_alternativas.length > 0 && (
        <div className="alternatives-section">
          <h4>💡 Alternativas sugeridas:</h4>
          <div className="alternatives-list">
            {rutaGenerada.sugerencias_alternativas.map((alt, index) => (
              <div key={index} className="alternative-item">
                <span>{alt.nombre} ({alt.tipo})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="itinerary-actions">
        {!rutaAprobada ? (
          <>
            <button 
              onClick={() => {
                dispatch(aprobarRuta())
                dispatch(setSelectedPoint(0))
              }}
              className="approve-btn"
            >
              ✅ Aprobar Ruta
            </button>
            <button 
              onClick={handleNewTour}
              className="modify-btn"
            >
              🔄 Nueva Ruta
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={generatePDF}
              className="start-route-btn"
            >
              📄 Descargar Ruta PDF
            </button>
            <button 
              onClick={handleNewTour}
              className="new-tour-btn"
            >
              ➕ Nueva Ruta
            </button>
          </>
        )}
      </div>


      {/* Modal de imagen */}
      {imageModalOpen && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>×</button>
            
            {/* Controles de zoom */}
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={handleZoomOut} disabled={imageZoom <= 1}>-</button>
              <span className="zoom-level">{Math.round(imageZoom * 100)}%</span>
              <button className="zoom-btn" onClick={handleZoomIn} disabled={imageZoom >= 3}>+</button>
            </div>
            
            <div 
              className="image-container"
              onWheel={handleImageWheel}
              onMouseDown={handleImagePanStart}
              onMouseMove={handleImagePanMove}
              onMouseUp={handleImagePanEnd}
              onMouseLeave={handleImagePanEnd}
              onTouchStart={handleImagePanStart}
              onTouchMove={handleImagePanMove}
              onTouchEnd={handleImagePanEnd}
            >
              <img 
                src={modalImageSrc} 
                alt="Imagen ampliada" 
                className="image-modal-img"
                style={{
                  transform: `scale(${imageZoom}) translate(${imagePosition.x / imageZoom}px, ${imagePosition.y / imageZoom}px)`,
                  cursor: imageZoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default'
                }}
              />
            </div>
            
            <div className="image-modal-caption">
              <h4>{getPointTitle(selectedPointData) || 'Punto de interés'}</h4>
              <p>Usa +/- para zoom, scroll o pellizca para ampliar</p>
            </div>
          </div>
        </div>
      )}

      </div>
      
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="¿Deseas regresar al inicio?"
        message="Se perderá todo el progreso realizado."
        onConfirm={() => {
          dispatch(resetTour())
          router.push('/')
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  )
}