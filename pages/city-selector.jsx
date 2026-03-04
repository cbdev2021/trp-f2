import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { selectCity, setSelectedCoordinates } from '../store/tourSlice'
import ClickableMap from '../components/ClickableMap'
import TripPlanLogo from '../components/TripPlanLogo'
import ConfirmDialog from '../components/ConfirmDialog'
import Footer from '../components/Footer'

export default function CitySelector() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { detectedCity, selectedCity, stepE } = useSelector(state => state.tour)
  const [loadingGeocode, setLoadingGeocode] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    if (!detectedCity) {
      router.push('/')
      return
    }
    setTimeout(() => setIsVisible(true), 300)
  }, [detectedCity, router])

  const handleBack = () => {
    router.push('/')
  }

  const getMapCity = () => {
    return selectedCity || detectedCity
  }

  const handleContinue = () => {
    router.push('/tour-planner')
  }

  const getContinueButtonText = () => {
    if (stepE.coordenadasSeleccionadas && stepE.ciudadSeleccionada) {
      const address = stepE.ciudadSeleccionada
      
      const ciudadesChilenas = ['Santiago', 'Valparaíso', 'Viña del Mar', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Iquique', 'Copiapó', 'Valdivia', 'Puerto Montt', 'Punta Arenas', 'Calama', 'Chillán', 'Los Ángeles', 'Osorno', 'Quillota', 'Melipilla', 'Curicó', 'Linares', 'Ovalle']
      
      for (const ciudad of ciudadesChilenas) {
        if (address.toLowerCase().includes(ciudad.toLowerCase())) {
          return `Continuar en ${ciudad}`
        }
      }
      
      const parts = address.split(', ')
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim()
        if (!/^\d+$/.test(part) && 
            !part.toLowerCase().includes('chile') && 
            !part.toLowerCase().includes('región') &&
            !part.toLowerCase().includes('provincia') &&
            part.length > 2) {
          if (part.includes('Av.') || part.includes('Calle') || part.includes('Pasaje')) {
            continue
          }
          return `Continuar en ${part}`
        }
      }
      
      const cityFromPoint = parts.find(part => part.trim().length > 2) || parts[0]
      return `Continuar en ${cityFromPoint}`
    }
    
    if (selectedCity) {
      return `Continuar en ${selectedCity.name}`
    }
    
    return `Continuar en ${detectedCity.city}`
  }

  if (!detectedCity) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <p>Redirigiendo...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '10px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '10px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '1rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <TripPlanLogo 
            size="medium" 
            onClick={() => setShowConfirmDialog(true)}
          />
        </div>
      </div>
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '10px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '1rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
            fontWeight: '600',
            color: '#2c3e50',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            {/* 🌍 Selecciona tu punto de inicio */}
            🌍 Selecciona tu área de exploración

          </h2>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '10px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          // padding: '2rem',

          // padding: '10px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{
              fontSize: '1.4rem',
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              📍 {selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : `${detectedCity.city}, ${detectedCity.country}`}
            </h2>
            <p style={{
              color: '#64748b',
              fontSize: '1rem',
              margin: 0,
              fontWeight: '400'
            }}>
              {/* Haz clic en el mapa para seleccionar tu punto de inicio */}
              <span><span style={{color: '#2c3e50', fontWeight: '500'}}>Haz clic en cualquier ciudad del mundo</span> para seleccionar tu zona de interés</span>
            </p>
          </div>

          <div style={{
            // borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <ClickableMap 
              center={getMapCity()}
              onMapClick={async (coords) => {
                setLoadingGeocode(true)
                try {
                  const response = await fetch('/api/geocode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lat: coords.lat, lon: coords.lng })
                  })
                  const data = await response.json()
                  const address = data.city || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                  const startingPointTitle = data.specificLocation || (address.split(', ')[0]) || address
                  
                  // Extraer ciudad de la dirección completa
                  const parts = address.split(', ')
                  let cityFromAddress = data.cityName || 'Ciudad'
                  let countryFromAddress = data.countryName || 'País'
                  
                  // Si no viene del API, extraer manualmente
                  if (!data.cityName || /^\d+$/.test(data.cityName)) {
                    for (let i = parts.length - 1; i >= 0; i--) {
                      const part = parts[i].trim()
                      if (/^\d+$/.test(part) || /^\d{2}-\d{3}$/.test(part)) continue
                      if (part.includes('Región') || part.includes('Região') || part.includes('Provincia') || part.includes('Metropolitana') || part.includes('Imediata') || part.includes('Intermediária') || part.includes('Geográfica')) continue
                      if (countryFromAddress === 'País' || countryFromAddress === data.countryName) {
                        countryFromAddress = part
                        continue
                      }
                      cityFromAddress = part
                      break
                    }
                  }
                  
                  const cityFromPoint = {
                    city: cityFromAddress,
                    name: cityFromAddress,
                    country: countryFromAddress,
                    lat: coords.lat,
                    lon: coords.lng
                  }
                  
                  console.log('🏙️ CIUDAD EXTRAÍDA DEL PUNTO:', cityFromPoint)
                  dispatch(selectCity(cityFromPoint))
                  
                  dispatch(setSelectedCoordinates({
                    coordinates: { lat: coords.lat, lon: coords.lng },
                    city: address,
                    specificLocation: data.specificLocation || '',
                    startingPointTitle
                  }))
                } catch (error) {
                  const address = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                  
                  const genericCity = {
                    city: 'Ubicación seleccionada',
                    name: 'Ubicación seleccionada', 
                    country: 'País',
                    lat: coords.lat,
                    lon: coords.lng
                  }
                  
                  console.log('🏙️ CIUDAD GENÉRICA:', genericCity)
                  dispatch(selectCity(genericCity))
                  
                  dispatch(setSelectedCoordinates({
                    coordinates: { lat: coords.lat, lon: coords.lng },
                    city: address,
                    specificLocation: '',
                    startingPointTitle: address
                  }))
                } finally {
                  setLoadingGeocode(false)
                }
              }}
            />
          </div>
          
          {loadingGeocode && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1.5rem', 
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
              borderRadius: '16px',
              border: '1px solid rgba(33, 150, 243, 0.2)',
              textAlign: 'center',
              animation: 'pulse 2s infinite'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ 
                  fontSize: '1.5rem',
                  animation: 'spin 1s linear infinite'
                }}>🔄</div>
                <p style={{ 
                  margin: '0', 
                  color: '#1976d2', 
                  fontWeight: '500',
                  fontSize: '1.1rem'
                }}>
                  Obteniendo información de la ubicación...
                </p>
              </div>
            </div>
          )}

          {!loadingGeocode && stepE.coordenadasSeleccionadas && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(40, 167, 69, 0.2)',
              animation: 'slideInUp 0.5s ease-out'
            }}>
              <h4 style={{
                color: '#155724',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ✅ Punto de partida seleccionado
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#2c3e50'
                }}>
                  {stepE.specificLocation || 'Ubicación seleccionada'}
                </div>
                <div style={{
                  fontSize: '0.95rem',
                  color: '#64748b'
                }}>
                  {stepE.ciudadSeleccionada}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  fontFamily: 'monospace'
                }}>
                  {stepE.coordenadasSeleccionadas.lat.toFixed(6)}, {stepE.coordenadasSeleccionadas.lon.toFixed(6)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem'
        }}>
          {!stepE.coordenadasSeleccionadas ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '20px',
              border: '2px dashed rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
              <p style={{
                color: '#64748b',
                fontSize: '1.1rem',
                margin: 0,
                fontWeight: '500'
              }}>
                Selecciona un punto en el mapa para continuar
              </p>
            </div>
          ) : (
            <button 
              onClick={handleContinue}
              style={{
                padding: '16px 32px',
                fontSize: '1.1rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                animation: 'slideInUp 0.6s ease-out'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)'
                e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
              }}
            >
              {getContinueButtonText()}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
      
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="¿Deseas regresar al inicio?"
        message="Se perderá todo el progreso realizado."
        onConfirm={() => {
          window.location.href = '/'
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />
      
      <Footer />
    </div>
  )
}