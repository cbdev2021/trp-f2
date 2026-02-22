import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { detectCity } from '../store/tourSlice'
import TripPlanLogo from '../components/TripPlanLogo'
import Footer from '../components/Footer'

export default function Home() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { detectedCity, cityLoading } = useSelector(state => state.tour)
  const [showCards, setShowCards] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    dispatch(detectCity())
  }, [dispatch])

  useEffect(() => {
    if (detectedCity && !cityLoading) {
      setTimeout(() => setShowCards(true), 800)
      setTimeout(() => setShowButton(true), 2500)
    }
  }, [detectedCity, cityLoading])

  const handleContinue = () => {
    router.push('/city-selector')
  }

  const getCityMessage = () => {
    if (cityLoading) return 'Detectando tu ubicación...'
    if (!detectedCity) return 'Preparando tu experiencia...'
    
    const { city, country } = detectedCity
    return `Descubre ${city}, ${country}`
  }

  const features = [
    // {
    //   icon: '🎯',
    //   title: 'Rutas Específicas',
    //   description: 'Rutas únicas basadas en tus preferencias e intereses específicos'
    // },
    // {
    //   icon: <img src="/RobotEmo.png" alt="Robot" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />,
    //   title: 'IA Personalizada',
    //   description: 'Algoritmos IA que crean rutas optimizadas y experiencias'
    // },
    // {
    //   icon: '🌍',
    //   title: 'Global',
    //   description: 'Busca lugares en cualquier ciudad del mundo con descripciones, fotografías y referencias en mapas'
    // },


    // {
    //   icon: '📱',
    //   title: 'Intuitivo',
    //   description: 'Solo 3 pasos simples para crear tu tour perfecto sin complicaciones'
    // }


     {
    icon: <img src="/RobotEmo.png" alt="Robot" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />,
    title: 'IA Personalizada',
    description: (<span><span style={{color: '#ffffff', fontWeight: '500'}}>Crea automáticamente rutas turísticas</span> <span style={{color: 'rgba(255,255,255,0.75)'}}>únicas basados en tus preferencias y tiempo disponible</span></span>)
    },
    {
      icon: '🌍',
      title: 'Cobertura Global',
      description: (<span><span style={{color: '#ffffff', fontWeight: '500'}}>Busca lugares en cualquier ciudad del mundo</span> <span style={{color: 'rgba(255,255,255,0.75)'}}>con descripciones, fotografías y referencias geográficas</span></span>)
    },
    {
      icon: '🎯',
      title: 'Proceso Guiado',
      // description: 'Interfaz simple de 3 pasos que convierte la planificación compleja en decisiones fáciles'
      description: (<span><span style={{color: '#ffffff', fontWeight: '500'}}>Simplifica una planificación extensa</span> <span style={{color: 'rgba(255,255,255,0.75)'}}>de rutas en un simple proceso guiado de tres pasos</span></span>)
    }
  ]

  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '10px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        opacity: cityLoading ? 0.7 : 1,
        transition: 'opacity 0.5s ease'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <TripPlanLogo 
            size="large" 
            color="white" 
            subtitleColor="rgba(255,255,255,0.9)" 
          />
        </div>
        <p style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
          opacity: 0.9,
          fontWeight: '300'
        }}>
          {getCityMessage()}
        </p>
      </div>

      <div className="cards-grid" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.5rem',
        maxWidth: '1000px',
        width: '100%',
        marginBottom: '3rem',
        justifyContent: 'center',
        opacity: showCards ? 1 : 0,
        transform: showCards ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-card"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transform: 'translateY(0) scale(1)',
              animationDelay: `${index * 0.2}s`,
              animation: showCards ? 'slideInUp 0.6s ease-out forwards' : 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '48px'
            }}>
              {typeof feature.icon === 'string' ? feature.icon : feature.icon}
            </div>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '0.8rem',
              letterSpacing: '-0.01em',
              color: 'rgba(255,255,255,0.65)'
            }}>
              {feature.title}
            </h3>
            <p style={{
              fontSize: '0.95rem',
              opacity: 0.85,
              lineHeight: '1.5',
              fontWeight: '300'
            }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {showButton && (
        <button 
          onClick={handleContinue}
          style={{
            padding: '16px 32px',
            fontSize: '1.1rem',
            fontWeight: '500',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(20px)',
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0)' : 'translateY(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.25)'
            e.target.style.transform = 'translateY(-2px) scale(1.05)'
            e.target.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.15)'
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          Crear ruta turística personalizada
        </button>
      )}

      <Footer />
      
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
        
        .feature-card {
          width: 280px;
          flex: 0 0 280px;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
          text-decoration: none !important;
        }
        
        .feature-card:focus {
          outline: none !important;
          text-decoration: none !important;
        }
        
        .feature-card:active {
          outline: none !important;
          text-decoration: none !important;
        }
        
        .feature-card * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        @media (max-width: 320px) {
          .feature-card {
            width: 260px;
            flex: 0 0 260px;
          }
        }
      `}</style>
    </div>
  )
}