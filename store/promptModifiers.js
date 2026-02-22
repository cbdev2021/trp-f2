// Modificadores críticos para optimizar el prompt de IA
export const criticalModifiers = {
  // 1. Tipo de experiencia - Determina actividades principales
  tipoExperiencia: {
    cultural: "museos principales, sitios históricos, arte local",
    gastronomica: "restaurantes típicos, mercados locales, tours culinarios",
    aventura: "actividades al aire libre, deportes, naturaleza",
    relajacion: "spas, parques tranquilos, cafés, ritmo pausado",
    nocturna: "bares locales, vida nocturna, shows nocturnos",
    naturaleza: "parques naturales, jardines, miradores, paisajes"
  },

  // 3. Restricciones - Filtros obligatorios
  restricciones: {
    movilidad: "acceso para sillas de ruedas, ascensores, rampas",
    vegetariano: "opciones vegetarianas, restaurantes plant-based",
    ninos: "actividades familiares, espacios seguros para niños",
    alergias: "opciones sin alérgenos, restaurantes con menús especiales",
    accesibilidad: "lugares accesibles, transporte adaptado"
  }
}

// Generar modificadores para el prompt
export const generateCriticalPrompt = (userPreferences) => {
  const modifiers = []
  
  // Solo procesar campos críticos
  const criticalFields = ['tipoExperiencia', 'restricciones']
  
  criticalFields.forEach(field => {
    const value = userPreferences[field]
    
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (criticalModifiers[field]?.[item]) {
          modifiers.push(criticalModifiers[field][item])
        }
      })
    } else if (value && criticalModifiers[field]?.[value]) {
      modifiers.push(criticalModifiers[field][value])
    }
  })
  
  return modifiers.join(', ')
}