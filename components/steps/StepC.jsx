import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { updateStepC, prevStep, generateTourFromCurrentState } from '../../store/tourSlice'

export default function StepC() {
  const dispatch = useDispatch()
  const { stepC, stepB } = useSelector(state => state.tour)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300)
  }, [])

  const selectedExperience = stepB.tipoExperiencia?.[0]

  const interesesCategorizados = {
    cultural: [
      { value: 'museos', emoji: '🏛️', label: 'Museos' },
      { value: 'sitios_arqueologicos', emoji: '🏺', label: 'Sitios Arqueológicos' },
      { value: 'centros_culturales', emoji: '🎭', label: 'Centros Culturales' },
      { value: 'bibliotecas', emoji: '📚', label: 'Bibliotecas' },
      { value: 'teatros', emoji: '🎪', label: 'Teatros' },
      { value: 'monumentos', emoji: '🗿', label: 'Monumentos' },
      { value: 'patrimonio_unesco', emoji: '🌍', label: 'Patrimonio UNESCO' },
      { value: 'casas_historicas', emoji: '🏘️', label: 'Casas Históricas' }
    ],
    gastronomica: [
      { value: 'restaurantes_locales', emoji: '🍽️', label: 'Restaurantes Locales' },
      { value: 'mercados_gastronomicos', emoji: '🥘', label: 'Mercados Gastronómicos' },
      { value: 'food_trucks', emoji: '🚚', label: 'Food Trucks' },
      { value: 'cafeterias_especializadas', emoji: '☕', label: 'Cafeterías Especializadas' },
      { value: 'bares_tematicos', emoji: '🍻', label: 'Bares Temáticos' },
      { value: 'cervezas_artesanales', emoji: '🍺', label: 'Cervezas Artesanales' },
      { value: 'tours_gastronomicos', emoji: '👨‍🍳', label: 'Tours Gastronómicos' },
      { value: 'cocina_fusion', emoji: '🌮', label: 'Cocina Fusión' }
    ],
    aventura: [
      { value: 'deportes_extremos', emoji: '🪂', label: 'Deportes Extremos' },
      { value: 'escalada', emoji: '🧗', label: 'Escalada' },
      { value: 'rafting', emoji: '🚣', label: 'Rafting' },
      { value: 'parapente', emoji: '🪂', label: 'Parapente' },
      { value: 'ciclismo_montaña', emoji: '🚵', label: 'Ciclismo de Montaña' },
      { value: 'kayak', emoji: '🛶', label: 'Kayak' },
      { value: 'surf', emoji: '🏄', label: 'Surf' },
      { value: 'trekking_avanzado', emoji: '🥾', label: 'Trekking Avanzado' }
    ],
    relajacion: [
      { value: 'spas', emoji: '🧖', label: 'Spas' },
      { value: 'termas', emoji: '♨️', label: 'Termas' },
      { value: 'parques_tranquilos', emoji: '🌳', label: 'Parques Tranquilos' },
      { value: 'jardines_zen', emoji: '🧘', label: 'Jardines Zen' },
      { value: 'centros_wellness', emoji: '💆', label: 'Centros Wellness' },
      { value: 'yoga_studios', emoji: '🧘‍♀️', label: 'Estudios de Yoga' },
      { value: 'meditacion', emoji: '🕯️', label: 'Meditación' }
    ],
    nocturna: [
      { value: 'bares', emoji: '🍸', label: 'Bares' },
      { value: 'discotecas', emoji: '💃', label: 'Discotecas' },
      { value: 'pubs', emoji: '🍺', label: 'Pubs' },
      { value: 'rooftops', emoji: '🏙️', label: 'Rooftops' },
      { value: 'casinos', emoji: '🎰', label: 'Casinos' },
      { value: 'espectaculos_nocturnos', emoji: '🎭', label: 'Espectáculos Nocturnos' },
      { value: 'tours_nocturnos', emoji: '🌙', label: 'Tours Nocturnos' },
      { value: 'vida_bohemia', emoji: '🎨', label: 'Vida Bohemia' }
    ],
    naturaleza: [
      { value: 'parques_nacionales', emoji: '🏞️', label: 'Parques Nacionales' },
      { value: 'reservas_naturales', emoji: '🦋', label: 'Reservas Naturales' },
      { value: 'miradores', emoji: '🔭', label: 'Miradores' },
      { value: 'senderos', emoji: '🥾', label: 'Senderos' },
      { value: 'bosques', emoji: '🌲', label: 'Bosques' },
      { value: 'lagos', emoji: '🏔️', label: 'Lagos' },
      { value: 'cascadas', emoji: '💧', label: 'Cascadas' },
      { value: 'observacion_fauna', emoji: '🦅', label: 'Observación de Fauna' },
      { value: 'playas', emoji: '🏖️', label: 'Playas' }
    ],
    historica: [
      { value: 'sitios_historicos', emoji: '🏛️', label: 'Sitios Históricos' },
      { value: 'museos_historia', emoji: '📜', label: 'Museos de Historia' },
      { value: 'ruinas', emoji: '🏺', label: 'Ruinas' },
      { value: 'fortalezas', emoji: '🏰', label: 'Fortalezas' },
      { value: 'iglesias_antiguas', emoji: '⛪', label: 'Iglesias Antiguas' },
      { value: 'cementerios_historicos', emoji: '🪦', label: 'Cementerios Históricos' },
      { value: 'barrios_coloniales', emoji: '🏘️', label: 'Barrios Coloniales' },
      { value: 'arqueologia', emoji: '🔍', label: 'Arqueología' }
    ],
    artistica: [
      { value: 'galerias_arte', emoji: '🖼️', label: 'Galerías de Arte' },
      { value: 'arte_urbano', emoji: '🎨', label: 'Arte Urbano' },
      { value: 'talleres_artisticos', emoji: '🎭', label: 'Talleres Artísticos' },
      { value: 'estudios_artistas', emoji: '🎨', label: 'Estudios de Artistas' },
      { value: 'murales', emoji: '🖌️', label: 'Murales' },
      { value: 'esculturas_publicas', emoji: '🗿', label: 'Esculturas Públicas' },
      { value: 'arte_contemporaneo', emoji: '🎭', label: 'Arte Contemporáneo' },
      { value: 'artesanias', emoji: '🏺', label: 'Artesanías' }
    ],
    deportiva: [
      { value: 'estadios', emoji: '🏟️', label: 'Estadios' },
      { value: 'centros_deportivos', emoji: '🏋️', label: 'Centros Deportivos' },
      { value: 'gimnasios_aire_libre', emoji: '🤸', label: 'Gimnasios al Aire Libre' },
      { value: 'piscinas', emoji: '🏊', label: 'Piscinas' },
      { value: 'canchas_deportivas', emoji: '⚽', label: 'Canchas Deportivas' },
      { value: 'eventos_deportivos', emoji: '🏆', label: 'Eventos Deportivos' },
      { value: 'deportes_acuaticos', emoji: '🏄', label: 'Deportes Acuáticos' },
      { value: 'running_tracks', emoji: '🏃', label: 'Pistas de Running' }
    ],
    familiar: [
      { value: 'parques_infantiles', emoji: '🎠', label: 'Parques Infantiles' },
      { value: 'zoologicos', emoji: '🦁', label: 'Zoológicos' },
      { value: 'acuarios', emoji: '🐠', label: 'Acuarios' },
      { value: 'parques_tematicos', emoji: '🎢', label: 'Parques Temáticos' },
      { value: 'museos_interactivos', emoji: '🔬', label: 'Museos Interactivos' },
      { value: 'centros_recreativos', emoji: '🎯', label: 'Centros Recreativos' },
      { value: 'actividades_educativas', emoji: '📚', label: 'Actividades Educativas' },
      { value: 'espacios_seguros', emoji: '🛡️', label: 'Espacios Seguros' }
    ],
    fotografica: [
      { value: 'spots_instagram', emoji: '📸', label: 'Spots Instagram' },
      { value: 'miradores_fotograficos', emoji: '📷', label: 'Miradores Fotográficos' },
      { value: 'arquitectura_iconica', emoji: '🏗️', label: 'Arquitectura Icónica' },
      { value: 'paisajes_unicos', emoji: '🌄', label: 'Paisajes Únicos' },
      { value: 'arte_urbano_fotografico', emoji: '🎨', label: 'Arte Urbano Fotográfico' },
      { value: 'atardeceres_espectaculares', emoji: '🌅', label: 'Atardeceres Espectaculares' },
      { value: 'lugares_coloridos', emoji: '🌈', label: 'Lugares Coloridos' },
      { value: 'perspectivas_aereas', emoji: '🚁', label: 'Perspectivas Aéreas' }
    ],
    musical: [
      { value: 'salas_concierto', emoji: '🎵', label: 'Salas de Concierto' },
      { value: 'festivales_musica', emoji: '🎪', label: 'Festivales de Música' },
      { value: 'bares_musica_vivo', emoji: '🎤', label: 'Bares con Música en Vivo' },
      { value: 'conservatorios', emoji: '🎼', label: 'Conservatorios' },
      { value: 'estudios_grabacion', emoji: '🎧', label: 'Estudios de Grabación' },
      { value: 'museos_musica', emoji: '🎹', label: 'Museos de Música' },
      { value: 'eventos_musicales', emoji: '🎺', label: 'Eventos Musicales' },
      { value: 'jam_sessions', emoji: '🎸', label: 'Jam Sessions' }
    ],
    compras: [
      { value: 'centros_comerciales', emoji: '🏬', label: 'Centros Comerciales' },
      { value: 'mercados_artesanales', emoji: '🛍️', label: 'Mercados Artesanales' },
      { value: 'tiendas_locales', emoji: '🏪', label: 'Tiendas Locales' },
      { value: 'outlets', emoji: '🏷️', label: 'Outlets' },
      { value: 'ferias', emoji: '🎪', label: 'Ferias' },
      { value: 'boutiques', emoji: '👗', label: 'Boutiques' },
      { value: 'souvenirs', emoji: '🎁', label: 'Souvenirs' },
      { value: 'productos_regionales', emoji: '🏺', label: 'Productos Regionales' }
    ],
    wellness: [
      { value: 'centros_bienestar', emoji: '🧘', label: 'Centros de Bienestar' },
      { value: 'spas_holisticos', emoji: '💆', label: 'Spas Holísticos' },
      { value: 'terapias_alternativas', emoji: '🌿', label: 'Terapias Alternativas' },
      { value: 'centros_yoga', emoji: '🧘‍♀️', label: 'Centros de Yoga' },
      { value: 'retiros_wellness', emoji: '🏞️', label: 'Retiros Wellness' },
      { value: 'tratamientos_naturales', emoji: '🌱', label: 'Tratamientos Naturales' },
      { value: 'medicina_tradicional', emoji: '🌿', label: 'Medicina Tradicional' },
      { value: 'relajacion_mental', emoji: '🧠', label: 'Relajación Mental' }
    ],
    educativa: [
      { value: 'universidades', emoji: '🎓', label: 'Universidades' },
      { value: 'centros_investigacion', emoji: '🔬', label: 'Centros de Investigación' },
      { value: 'talleres_educativos', emoji: '📚', label: 'Talleres Educativos' },
      { value: 'conferencias', emoji: '🎤', label: 'Conferencias' },
      { value: 'cursos_cortos', emoji: '📖', label: 'Cursos Cortos' },
      { value: 'intercambio_cultural', emoji: '🌍', label: 'Intercambio Cultural' },
      { value: 'aprendizaje_idiomas', emoji: '🗣️', label: 'Aprendizaje de Idiomas' },
      { value: 'experiencias_inmersivas', emoji: '🎭', label: 'Experiencias Inmersivas' }
    ],
    religiosa: [
      { value: 'iglesias', emoji: '⛪', label: 'Iglesias' },
      { value: 'templos', emoji: '🏛️', label: 'Templos' },
      { value: 'mezquitas', emoji: '🕌', label: 'Mezquitas' },
      { value: 'sinagogas', emoji: '🕍', label: 'Sinagogas' },
      { value: 'centros_espirituales', emoji: '🕯️', label: 'Centros Espirituales' },
      { value: 'monasterios', emoji: '🏛️', label: 'Monasterios' },
      { value: 'sitios_peregrinacion', emoji: '🚶', label: 'Sitios de Peregrinación' },
      { value: 'ceremonias_religiosas', emoji: '🙏', label: 'Ceremonias Religiosas' }
    ],
    arquitectonica: [
      { value: 'edificios_emblematicos', emoji: '🏢', label: 'Edificios Emblemáticos' },
      { value: 'arquitectura_moderna', emoji: '🏗️', label: 'Arquitectura Moderna' },
      { value: 'arquitectura_colonial', emoji: '🏘️', label: 'Arquitectura Colonial' },
      { value: 'rascacielos', emoji: '🏙️', label: 'Rascacielos' },
      { value: 'puentes_iconicos', emoji: '🌉', label: 'Puentes Icónicos' },
      { value: 'plazas_arquitectonicas', emoji: '🏛️', label: 'Plazas Arquitectónicas' },
      { value: 'diseño_urbano', emoji: '🏙️', label: 'Diseño Urbano' },
      { value: 'construcciones_unicas', emoji: '🏗️', label: 'Construcciones Únicas' }
    ]
  }

  useEffect(() => {
    if (selectedExperience && interesesCategorizados[selectedExperience]) {
      const allInteresesForCategory = interesesCategorizados[selectedExperience].map(item => item.value)
      dispatch(updateStepC({ interesesEspecificos: allInteresesForCategory }))
    }
  }, [selectedExperience, dispatch])

  const handleInteresChange = (interes) => {
    const newIntereses = stepC.interesesEspecificos?.includes(interes)
      ? stepC.interesesEspecificos.filter(i => i !== interes)
      : [...(stepC.interesesEspecificos || []), interes]
    
    dispatch(updateStepC({ interesesEspecificos: newIntereses }))
  }

  const handleGenerateTour = async () => {
    if (isFormValid) {
      dispatch(generateTourFromCurrentState())
    }
  }

  const isFormValid = stepC.interesesEspecificos?.length > 0

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
      maxWidth: '900px',
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
          {/* Intereses específicos</h2> */}
          Intereses</h2>


        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          margin: 0
        }}>
          {/* Selecciona los intereses específicos para tu experiencia <strong>{selectedExperience?.toUpperCase()}</strong></p> */}
          Selecciona los intereses específicos para tu experiencia </p>

      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        {Object.entries(interesesCategorizados)
          .sort(([categoriaA], [categoriaB]) => {
            if (categoriaA === selectedExperience) return -1
            if (categoriaB === selectedExperience) return 1
            return 0
          })
          .map(([categoria, opciones]) => {
            const isSelectedCategory = categoria === selectedExperience
            const isDisabled = !isSelectedCategory
            
            return (
              <div key={categoria} style={{
                marginBottom: '2rem',
                opacity: isDisabled ? 0.3 : 1,
                pointerEvents: isDisabled ? 'none' : 'auto'
              }}>
                <h4 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: isSelectedCategory ? '#667eea' : '#9ca3af',
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {categoria}
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.8rem'
                }}>
                  {opciones.map(interes => {
                    const isSelected = stepC.interesesEspecificos?.includes(interes.value)
                    
                    return (
                      <button
                        key={interes.value}
                        onClick={() => !isDisabled && handleInteresChange(interes.value)}
                        disabled={isDisabled}
                        style={{
                          padding: '0.8rem',
                          borderRadius: '12px',
                          border: isSelected 
                            ? '2px solid #10b981' 
                            : '2px solid rgba(0, 0, 0, 0.1)',
                          background: isSelected 
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                            : 'rgba(255, 255, 255, 0.8)',
                          color: isSelected ? 'white' : '#374151',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                          boxShadow: isSelected 
                            ? '0 6px 20px rgba(16, 185, 129, 0.3)' 
                            : '0 2px 10px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          if (!isDisabled && !isSelected) {
                            e.target.style.transform = 'translateY(-2px) scale(1.02)'
                            e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isDisabled && !isSelected) {
                            e.target.style.transform = 'translateY(0) scale(1)'
                            e.target.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{interes.emoji}</span>
                        <span>{interes.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
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
          onClick={handleGenerateTour}
          disabled={!isFormValid}
          style={{
            padding: '16px 32px',
            fontSize: '1.1rem',
            fontWeight: '700',
            background: !isFormValid 
              ? 'rgba(0, 0, 0, 0.1)' 
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: !isFormValid ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: !isFormValid ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: !isFormValid 
              ? 'none' 
              : '0 10px 30px rgba(245, 158, 11, 0.4)',
            animation: isFormValid ? 'pulse 2s infinite' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(-3px) scale(1.05)'
              e.target.style.boxShadow = '0 15px 40px rgba(245, 158, 11, 0.5)'
            }
          }}
          onMouseLeave={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 10px 30px rgba(245, 158, 11, 0.4)'
            }
          }}
        >
          {/* 🚀 Generar mi tour personalizado */}
          🚀 Generar ruta
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4);
          }
          50% {
            box-shadow: 0 15px 40px rgba(245, 158, 11, 0.6);
          }
        }
      `}</style>
    </div>
  )
}