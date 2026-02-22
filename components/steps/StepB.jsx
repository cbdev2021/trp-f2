import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { updateStepB, nextStep, prevStep } from '../../store/tourSlice'

export default function StepB() {
  const dispatch = useDispatch()
  const { stepB, stepA } = useSelector(state => state.tour)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300)
  }, [])

  const getAvailableHoursPerDay = () => {
    if (!stepA.inicioTour || !stepA.finTour) return null
    
    const inicio = new Date(stepA.inicioTour)
    const fin = new Date(stepA.finTour)
    const diffMs = fin - inicio
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = diffMs / (1000 * 60 * 60)
    
    return diffDays > 0 ? diffHours / diffDays : diffHours
  }

  const horasPorDia = getAvailableHoursPerDay()

  const isOptionAvailable = (option) => {
    if (!horasPorDia || option.value === 'flexible') return true
    
    const ranges = {
      '2-3h': { min: 2, max: 3 },
      '4-5h': { min: 4, max: 5 },
      '6-7h': { min: 6, max: 7 },
      '8-10h': { min: 8, max: 10 }
    }
    
    const range = ranges[option.value]
    return range ? horasPorDia >= range.min : true
  }

  const tipoExperienciaOptions = [
    { value: 'cultural', emoji: '🏛️', label: 'Cultural' },
    { value: 'naturaleza', emoji: '🌿', label: 'Naturaleza' },
    { value: 'historica', emoji: '🏰', label: 'Histórica' },
    { value: 'artistica', emoji: '🎨', label: 'Artística' },
    { value: 'religiosa', emoji: '⛪', label: 'Religiosa' },
    { value: 'educativa', emoji: '📚', label: 'Educativa' },
    { value: 'familiar', emoji: '👨‍👩‍👧‍👦', label: 'Familiar' },
    { value: 'fotografica', emoji: '📸', label: 'Fotográfica' },
    { value: 'musical', emoji: '🎵', label: 'Musical' },
    { value: 'aventura', emoji: '🏔️', label: 'Aventura' },
    { value: 'relajacion', emoji: '🧘', label: 'Relajación' },
    { value: 'arquitectonica', emoji: '🏗️', label: 'Arquitectónica' },
    { value: 'nocturna', emoji: '🌙', label: 'Nocturna' },
    { value: 'gastronomica', emoji: '🍽️', label: 'Gastronómica' },
    { value: 'compras', emoji: '🛍️', label: 'Compras' },
    { value: 'wellness', emoji: '💆', label: 'Wellness' },
    { value: 'deportiva', emoji: '⚽', label: 'Deportiva' }
  ]

  const duracionOptions = [
    { value: '2-3h', label: '2-3 Horas', emoji: '⏰' },
    { value: '4-5h', label: '4-5 Horas', emoji: '🕐' },
    { value: '6-7h', label: '6-7 Horas', emoji: '🕕' },
    { value: '8-10h', label: '8-10 Horas', emoji: '🕘' },
    { value: 'flexible', label: 'Flexible (IA optimiza)', emoji: <img src="/RobotEmo.png" alt="Robot" style={{ width: '24px', height: '24px', objectFit: 'contain' }} /> }
  ]

  const handleExperienciaChange = (experiencia) => {
    const newExperiencias = stepB.tipoExperiencia?.includes(experiencia)
      ? []
      : [experiencia]
    
    dispatch(updateStepB({ tipoExperiencia: newExperiencias }))
  }

  const handleNext = () => {
    if (stepB.tipoExperiencia?.length > 0 && stepB.duracionPreferida) {
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
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '2.5rem'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#2c3e50',
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>🎯 
            {/* Tu experiencia ideal */}
            Preferencias

        
        </h2>
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          margin: 0
        }}>
          {/* Selecciona el tipo de aventura que más te emociona */}
          Selecciona tu enfoque principal y duración preferida
        
        </p>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <label style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '1rem',
          display: 'block'
        }}>
          {/* Tipo de experiencia principal: */}
          Interés principal:
        </label>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {tipoExperienciaOptions.map(experiencia => {
            const isSelected = stepB.tipoExperiencia?.includes(experiencia.value)
            const hasSelection = stepB.tipoExperiencia?.length > 0
            const isDisabled = hasSelection && !isSelected
            
            return (
              <button
                key={experiencia.value}
                onClick={() => !isDisabled && handleExperienciaChange(experiencia.value)}
                disabled={isDisabled}
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  border: isSelected 
                    ? '2px solid #667eea' 
                    : '2px solid rgba(0, 0, 0, 0.1)',
                  background: isSelected 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : isDisabled 
                      ? 'rgba(0, 0, 0, 0.05)' 
                      : 'rgba(255, 255, 255, 0.8)',
                  color: isSelected ? 'white' : isDisabled ? '#9ca3af' : '#374151',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'center',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  opacity: isDisabled ? 0.5 : 1,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected 
                    ? '0 8px 25px rgba(102, 126, 234, 0.3)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled && !isSelected) {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)'
                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled && !isSelected) {
                    e.target.style.transform = 'translateY(0) scale(1)'
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {experiencia.emoji}
                </div>
                <div>{experiencia.label}</div>
              </button>
            )
          })}
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
          borderRadius: '12px',
          padding: '1rem',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          color: '#856404'
        }}>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
            <strong>💡 Consejo:</strong> Selecciona solo UNA experiencia principal para obtener rutas más coherentes y enfocadas. 
            En el siguiente paso podrás especificar intereses detallados.
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <label style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '1rem',
          display: 'block'
        }}>
          Duración diaria de actividades:
        </label>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          {duracionOptions.map(option => {
            const available = isOptionAvailable(option)
            const isSelected = stepB.duracionPreferida === option.value
            
            return (
              <button
                key={option.value}
                onClick={() => available && dispatch(updateStepB({ duracionPreferida: option.value }))}
                disabled={!available}
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  border: isSelected 
                    ? '2px solid #10b981' 
                    : '2px solid rgba(0, 0, 0, 0.1)',
                  background: isSelected 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : !available 
                      ? 'rgba(0, 0, 0, 0.05)' 
                      : 'rgba(255, 255, 255, 0.8)',
                  color: isSelected ? 'white' : !available ? '#9ca3af' : '#374151',
                  cursor: !available ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'center',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  opacity: !available ? 0.5 : 1,
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected 
                    ? '0 8px 25px rgba(16, 185, 129, 0.3)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (available && !isSelected) {
                    e.target.style.transform = 'translateY(-2px) scale(1.02)'
                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (available && !isSelected) {
                    e.target.style.transform = 'translateY(0) scale(1)'
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '24px' }}>
                  {typeof option.emoji === 'string' ? option.emoji : option.emoji}
                </div>
                <div>{option.label}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '1rem',
        justifyContent: 'space-between'
      }}>
        <button 
          onClick={() => dispatch(prevStep())}
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
          disabled={!stepB.tipoExperiencia?.length || !stepB.duracionPreferida}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '600',
            background: (!stepB.tipoExperiencia?.length || !stepB.duracionPreferida) 
              ? 'rgba(0, 0, 0, 0.1)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: (!stepB.tipoExperiencia?.length || !stepB.duracionPreferida) ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: (!stepB.tipoExperiencia?.length || !stepB.duracionPreferida) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: (!stepB.tipoExperiencia?.length || !stepB.duracionPreferida) 
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
          Continuar con intereses
        </button>
      </div>
    </div>
  )
}