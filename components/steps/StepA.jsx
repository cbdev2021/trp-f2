import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { updateStepA, nextStep } from '../../store/tourSlice'

export default function StepA() {
  const dispatch = useDispatch()
  const { stepA, detectedCity } = useSelector(state => state.tour)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300)
    
    if (!stepA.inicioTour) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      dispatch(updateStepA({ inicioTour: tomorrow.toISOString().slice(0, 16) }))
    }
    if (!stepA.finTour) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(18, 0, 0, 0)
      dispatch(updateStepA({ finTour: tomorrow.toISOString().slice(0, 16) }))
    }
  }, [])

  const calculateDuration = () => {
    if (!stepA.inicioTour || !stepA.finTour) return 0
    const start = new Date(stepA.inicioTour)
    const end = new Date(stepA.finTour)
    return Math.floor((end - start) / (1000 * 60))
  }

  const duration = calculateDuration()
  const isValidDuration = duration >= 120

  const handleNext = () => {
    const requiredFields = stepA.inicioTour && stepA.finTour && isValidDuration
    if (requiredFields) {
      dispatch(nextStep())
    }
  }

  return (
    <div style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '24px',
      // padding: '2.5rem',
      padding: '10px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#2c3e50',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>📅 Periodo</h2>
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          margin: 0
        }}>
          {/* Define rango de fechas de inicio y fin  */}
          Define el rango de fechas y horarios
        
        </p>
      </div>

      {detectedCity && (
        <div style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid rgba(33, 150, 243, 0.2)',
          animation: 'slideInUp 0.6s ease-out'
        }}>
          <p style={{
            color: '#1976d2',
            fontSize: '1rem',
            margin: 0,
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            🌍 Detectamos que estás en <strong>{detectedCity.city}, {detectedCity.country}</strong>. 
            Puedes crear tu ruta turística aquí o en cualquier ciudad del mundo.
          </p>
        </div>
      )}

      <div className="date-grid" style={{
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <label style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🚀 Inicio
          </label>
          <input
            type="datetime-local"
            value={stepA.inicioTour || ''}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => dispatch(updateStepA({ inicioTour: e.target.value }))}
            style={{
              padding: '12px 16px',
              fontSize: '1rem',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea'
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <label style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🏁 Fin
          </label>
          <input
            type="datetime-local"
            value={stepA.finTour || ''}
            min={stepA.inicioTour || new Date().toISOString().slice(0, 16)}
            onChange={(e) => dispatch(updateStepA({ finTour: e.target.value }))}
            style={{
              padding: '12px 16px',
              fontSize: '1rem',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#667eea'
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
      </div>

      {duration > 0 && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center',
          background: duration >= 120 
            ? 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)' 
            : 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
          border: `1px solid ${duration >= 120 ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.3)'}`,
          color: duration >= 120 ? '#155724' : '#856404'
        }}>
          {duration >= 120 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span>✅</span>
              <span style={{ fontWeight: '600' }}>
                Duracións: {Math.floor(duration/60)}h {duration%60}m
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span>⚠️</span>
              <span style={{ fontWeight: '600' }}>
                Mínimo 2 horas requeridas (actual: {Math.floor(duration/60)}h {duration%60}m)
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'space-between'
      }}>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            background: 'rgba(255, 255, 255, 0.8)',
            color: '#374151',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.02)'
            e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)'
            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
        >
          Anterior
        </button>
        
        <button 
          onClick={handleNext}
          disabled={!stepA.inicioTour || !stepA.finTour || !isValidDuration}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            background: (!stepA.inicioTour || !stepA.finTour || !isValidDuration) 
              ? 'rgba(0, 0, 0, 0.1)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: (!stepA.inicioTour || !stepA.finTour || !isValidDuration) ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: (!stepA.inicioTour || !stepA.finTour || !isValidDuration) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: (!stepA.inicioTour || !stepA.finTour || !isValidDuration) 
              ? 'none' 
              : '0 10px 30px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(-2px) scale(1.02)'
              e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)'
            }
          }}
        >
          Continuar con preferencias
        </button>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .date-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        @media (max-width: 600px) {
          .date-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}