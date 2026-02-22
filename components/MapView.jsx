import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import { eliminarPunto, setSelectedPoint, aprobarRuta, resetTour } from '../store/tourSlice'

export default function MapView() {
  const { rutaGenerada, rutaAprobada, stepE, selectedPoint } = useSelector(state => state.tour)
  const dispatch = useDispatch()
  
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
  
  const mapRef = useRef(null)
  const [selectedDay, setSelectedDay] = useState(1)

  if (!rutaGenerada) return null
  
  const isMultiCiudades = rutaGenerada.tipo_tour === 'multi_ciudades'
  
  // Obtener todos los puntos según el tipo de tour (excluyendo punto_inicio)
  const getAllPoints = () => {
    if (isMultiCiudades && rutaGenerada.dias) {
      return rutaGenerada.dias.flatMap(dia => 
        dia.ruta?.filter(punto => punto.tipo !== 'punto_inicio').map(punto => ({ ...punto, dia: dia.dia, ciudad: dia.ciudad })) || []
      )
    }
    return rutaGenerada.ruta?.filter(punto => punto.tipo !== 'punto_inicio') || []
  }
  
  const allPoints = getAllPoints()

  // Generar URL de Google Maps con la ruta para caminar
  const generateMapsUrl = () => {
    if (allPoints.length === 0) return ''
    
    const ciudad = userData.selectedCity?.city || userData.detectedCity?.city || 'Santiago'
    const origin = encodeURIComponent(`${allPoints[0].nombre}, ${ciudad}`)
    const destination = encodeURIComponent(`${allPoints[allPoints.length - 1].nombre}, ${ciudad}`)
    
    let url = `https://www.google.com/maps/dir/${origin}/${destination}`
    
    // Agregar waypoints intermedios si hay más de 2 puntos
    if (allPoints.length > 2) {
      const waypoints = allPoints.slice(1, -1).map(punto => 
        encodeURIComponent(`${punto.nombre}, ${ciudad}`)
      ).join('/')
      url = `https://www.google.com/maps/dir/${origin}/${waypoints}/${destination}`
    }
    
    // Agregar parámetro para modo caminata
    url += '?dirflg=w'
    
    return url
  }

  const generateEmbedUrl = (pointIndex = null) => {
    if (allPoints.length === 0) return ''
    
    if (pointIndex !== null && allPoints[pointIndex]) {
      const point = allPoints[pointIndex]
      const ciudad = userData.selectedCity || userData.detectedCity
      const ciudadNombre = ciudad?.city || ciudad?.name || 'Santiago'
      
      // Usar lugar_fisico si existe, sino usar nombre
      const lugarBusqueda = point.lugar_fisico || point.nombre
      const searchQuery = `${lugarBusqueda}, ${ciudadNombre}`
      return `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&hl=es&z=15&t=k&output=embed`
    }
    
    // Vista general usando el nombre de la ciudad
    const ciudad = userData.selectedCity || userData.detectedCity
    if (ciudad) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(ciudad.city || ciudad.name)}&hl=es&z=12&t=k&output=embed`
    }
    
    return ''
  }

  const handlePointClick = (index) => {
    dispatch(setSelectedPoint(index))
  }

  // Acceso a userData para la vista general
  const userData = useSelector(state => state.tour)

  return (
    <div className="map-view">
      <h3>Vista Satelital</h3>
      
      {!rutaAprobada ? (
        <div className="map-placeholder">
          <div className="map-info">
            📍 Vista Previa de la Ruta
            <p>Aprueba la ruta para ver el mapa interactivo con navegación</p>
            {isMultiCiudades && (
              <p>🌍 Tour de {rutaGenerada.duracion_dias} días</p>
            )}
          </div>
          
          <div className="map-points">
            {allPoints.map((punto, index) => (
              <div key={`${punto.dia || 1}-${punto.orden}`} className="map-point">
                <div className="point-marker">
                  <span className="point-number">{index + 1}</span>
                </div>
                <div className="point-info">
                  <h4>{getPointTitle(punto) || cleanUndefinedText(punto.nombre || punto.name) || 'Punto de interés'}</h4>
                  {punto.dia && <p className="point-day">Día {punto.dia} - {punto.ciudad}</p>}
                  <p className="point-type">{punto.tipo}</p>
                  <p className="point-coords">
                    📍 {punto.coordenadas?.lat}, {punto.coordenadas?.lon}
                  </p>
                  <button 
                    onClick={() => dispatch(eliminarPunto(punto.orden))}
                    className="remove-point-btn"
                  >
                    ❌ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="map-header">
            <h4>📍 Área de Referencia</h4>
          </div>
          <iframe
            key={selectedPoint} 
            src={generateEmbedUrl(selectedPoint)}
            width="100%"
            height="600"
            style={{ border: 'none' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa de referencia de ubicación"
          />
          {/* <div className="route-points">
            {rutaGenerada.dias_totales > 1 ? (
              <>
                <div className="day-carousel-header">
                  <h5>📍 Puntos por día:</h5>
                  <div className="day-selector">
                    {Array.from({ length: rutaGenerada.dias_totales }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setSelectedDay(i + 1)}
                        className={`day-btn ${selectedDay === i + 1 ? 'active' : ''}`}
                      >
                        Día {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="day-points-container">
                  {(() => {
                    const actividadesPorDia = rutaGenerada.actividades_por_dia || 5
                    const inicioIndice = (selectedDay - 1) * actividadesPorDia
                    const finIndice = Math.min(selectedDay * actividadesPorDia, allPoints.length)
                    const puntosDelDia = allPoints.slice(inicioIndice, finIndice)
                    
                    return (
                      <div className="points-carousel">
                        {puntosDelDia.map((punto, index) => {
                          const globalIndex = inicioIndice + index
                          return (
                            <div 
                              key={punto.orden} 
                              className={`route-point-card ${selectedPoint === globalIndex ? 'active' : ''}`}
                              onClick={() => handlePointClick(globalIndex)}
                            >
                              <span className="point-number">{punto.orden}</span>
                              <div className="point-details">
                                <strong>{getPointTitle(punto) || cleanUndefinedText(punto.nombre || punto.name) || 'Punto de interés'}</strong>
                                <small>{punto.tipo}</small>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()} 
                </div>
              </>
            ) : (
              <>
                <h5>📍 Puntos de tu ruta:</h5>
                <div className="points-carousel">
                  {allPoints.map((punto, index) => (
                    <div 
                      key={punto.orden} 
                      className={`route-point-card ${selectedPoint === index ? 'active' : ''}`}
                      onClick={() => handlePointClick(index)}
                    >
                      <span className="point-number">{punto.orden}</span>
                      <div className="point-details">
                        <strong>{getPointTitle(punto) || cleanUndefinedText(punto.nombre || punto.name) || 'Punto de interés'}</strong>
                        <small>{punto.tipo}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div> */}
          <div className="map-controls">
            <button 
              onClick={() => window.open(generateMapsUrl(), '_blank')}
              className="open-in-maps-btn"
            >
              🗺️ Abrir Ruta en Google Maps
            </button>
          </div>
        </>
      )}

      <div className="itinerary-actions">
        {!rutaAprobada ? (
          <>
            <button 
              onClick={() => dispatch(aprobarRuta())}
              className="approve-btn"
            >
              ✅ Aprobar Ruta
            </button>
            <button 
              onClick={() => dispatch(resetTour())}
              className="modify-btn"
            >
              🔄 Nueva Ruta
            </button>
          </>
        ) : (
          <>
            {/* <button 
              onClick={() => alert('¡Comenzando tu recorrido! 🚀')}
              className="start-route-btn"
            >
              🚀 Comenzar Recorrido
            </button>
            <button 
              onClick={() => dispatch(resetTour())}
              className="new-tour-btn"
            >
              ➕ Nuevo Tour
            </button> */}
          </>
        )}
      </div>
    </div>
  )
}