import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import TourStepper from '../components/TourStepper'
import MapView from '../components/MapView'
import ItineraryList from '../components/ItineraryList'
import TripPlanLogo from '../components/TripPlanLogo'
import ConfirmDialog from '../components/ConfirmDialog'
import Footer from '../components/Footer'

export default function TourPlanner() {
  const router = useRouter()
  const { currentStep, rutaGenerada, loading, error, rutaAprobada } = useSelector(state => state.tour)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300)
  }, [])

  useEffect(() => {
    if (loading) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) return prev // Se detiene en 85% hasta recibir respuesta
          const newProgress = prev + Math.random() * 4 + 1 // Entre 1-5% por intervalo
          return Math.min(newProgress, 85) // Máximo 85% durante simulación
        })
      }, 2500) // Cada 2.5 segundos
      
      return () => clearInterval(interval)
    } else if (rutaGenerada) {
      // Cuando se recibe la respuesta real, completar rápidamente
      const completeProgress = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(completeProgress)
            return 100
          }
          return prev + 5
        })
      }, 100)
    }
  }, [loading, rutaGenerada])

  const handleBack = () => {
    if (currentStep > 1) {
      router.push('/city-selector')
    } else {
      router.push('/')
    }
  }

  const getProgressMessage = () => {
    // if (progress < 30) return 'Analizando tus preferencias...'
    // if (progress < 60) return 'Buscando lugares ...'
    // if (progress < 90) return 'Optimizando tu ruta...'
    // return 'Finalizando tu tour personalizado...'

    if (progress < 30) return 'Analizando tus preferencias de viaje...'
    if (progress < 60) return 'Explorando destinos para ti...'
    if (progress < 90) return 'Diseñando tu itinerario...'
    return '¡Ya está casi listo!'

  }

  const getProgressSteps = () => {
    return [
      // { text: 'Analizando preferencias', completed: progress > 20 },
      // { text: 'Buscando lugares', completed: progress > 45 },
      // { text: 'Optimizando ruta', completed: progress > 70 },
      // { text: 'Finalizando tour', completed: progress >= 100 }

       { text: 'Analizando preferencias', completed: progress > 20 },
       { text: 'Explorando destinos', completed: progress > 45 },
       { text: 'Diseñando itinerario', completed: progress > 70 },
       { text: 'Finalizando ruta', completed: progress >= 100 }

    ]
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '10px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Header */}
      {(currentStep <= 3 || loading) && (
        <div style={{
          maxWidth: loading ? '500px' : '1000px',
          margin: '0 auto',
          marginBottom: '10px',
          width: '100%'
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
      )}

      {/* Stepper section */}
      {currentStep <= 3 && (
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <TourStepper />
        </div>
      )}

      {/* Loading section with progress */}
      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              marginBottom: '1.5rem',
              animation: 'bounce 2s infinite'
            }}>
              <img 
                src="/RobotEmo.png"
                alt="Robot"
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'contain'
                }}
              />
            </div>
            
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#2c3e50',
              marginBottom: '1rem',
              letterSpacing: '-0.02em'
            }}>Creando tu ruta turística personalizada</h2>
            
            <p style={{
              color: '#64748b',
              fontSize: '1.1rem',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              {getProgressMessage()}
            </p>
            
            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '4px',
                transition: 'width 0.8s ease-out'
              }}></div>
            </div>
            
            <div style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#667eea'
            }}>
              {Math.round(Math.min(progress, 100))}%
            </div>
            
            {/* Progress steps with checkmarks */}
            <div style={{
              marginTop: '2rem',
              marginBottom: '1rem'
            }}>
              {getProgressSteps().map((step, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.8rem',
                  fontSize: '0.95rem',
                  color: step.completed ? '#10b981' : '#94a3b8',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: step.completed ? '#10b981' : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    transition: 'all 0.3s ease',
                    fontSize: '12px'
                  }}>
                    {step.completed ? '✓' : ''}
                  </div>
                  {step.text}
                </div>
              ))}
            </div>
            
            <p style={{
              color: '#94a3b8',
              fontSize: '0.9rem',
              marginTop: '1.5rem',
              fontStyle: 'italic'
            }}>
              Esto puede tomar entre 1-3 minutos. ¡Vale la pena la espera!
            </p>
          </div>
        </div>
      )}

      {/* Error section */}
      {error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>❌</div>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#dc2626',
              marginBottom: '1rem'
            }}>Error al generar la ruta</h2>
            <p style={{
              color: '#64748b',
              fontSize: '1rem',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)'
                e.target.style.boxShadow = '0 12px 35px rgba(220, 38, 38, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)'
                e.target.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.3)'
              }}
            >
              🔄 Intentar de nuevo
            </button>
          </div>
        </div>
      )}

      {/* Results section */}
      {rutaGenerada && !loading && (
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {rutaAprobada && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                // padding: '1.5rem',

                padding: '0px',

                boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <ItineraryList />
              </div>
            )}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              // padding: '1.5rem',

              boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <MapView />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @media (max-width: 768px) {
          .results-grid {
            grid-template-columns: 1fr !important;
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