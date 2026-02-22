// Mapeo de categorías a subcategorías
const categoriasMap = {
  cultural: ['museos', 'sitios_arqueologicos', 'centros_culturales', 'bibliotecas', 'teatros', 'monumentos', 'patrimonio_unesco', 'casas_historicas'],
  gastronomica: ['restaurantes_locales', 'mercados_gastronomicos', 'food_trucks', 'cafeterias_especializadas', 'bares_tematicos', 'cervezas_artesanales', 'tours_gastronomicos', 'cocina_fusion'],
  aventura: ['deportes_extremos', 'escalada', 'rafting', 'parapente', 'ciclismo_montaña', 'kayak', 'surf', 'trekking_avanzado'],
  relajacion: ['spas', 'termas',   'parques_tranquilos', 'jardines_zen', 'centros_wellness', 'yoga_studios', 'meditacion'],
  nocturna: ['bares', 'discotecas', 'pubs', 'rooftops', 'casinos', 'espectaculos_nocturnos', 'tours_nocturnos', 'vida_bohemia'],
  naturaleza: ['parques_nacionales', 'reservas_naturales', 'miradores', 'senderos', 'bosques', 'lagos', 'cascadas', 'observacion_fauna','playas'],
  historica: ['sitios_historicos', 'museos_historia', 'ruinas', 'fortalezas', 'iglesias_antiguas', 'cementerios_historicos', 'barrios_coloniales', 'arqueologia'],
  artistica: ['galerias_arte', 'arte_urbano', 'talleres_artisticos', 'estudios_artistas', 'murales', 'esculturas_publicas', 'arte_contemporaneo', 'artesanias'],
  deportiva: ['estadios', 'centros_deportivos', 'gimnasios_aire_libre', 'piscinas', 'canchas_deportivas', 'eventos_deportivos', 'deportes_acuaticos', 'running_tracks'],
  familiar: ['parques_infantiles', 'zoologicos', 'acuarios', 'parques_tematicos', 'museos_interactivos', 'centros_recreativos', 'actividades_educativas', 'espacios_seguros'],

  fotografica: ['spots_instagram', 'miradores_fotograficos', 'arquitectura_iconica', 'paisajes_unicos', 'arte_urbano_fotografico', 'atardeceres_espectaculares', 'lugares_coloridos', 'perspectivas_aereas'],
  musical: ['salas_concierto', 'festivales_musica', 'bares_musica_vivo', 'conservatorios', 'estudios_grabacion', 'museos_musica', 'eventos_musicales', 'jam_sessions'],
  compras: ['centros_comerciales', 'mercados_artesanales', 'tiendas_locales', 'outlets', 'ferias', 'boutiques', 'souvenirs', 'productos_regionales'],
  wellness: ['centros_bienestar', 'spas_holisticos', 'terapias_alternativas', 'centros_yoga', 'retiros_wellness', 'tratamientos_naturales', 'medicina_tradicional', 'relajacion_mental'],
  educativa: ['universidades', 'centros_investigacion', 'talleres_educativos', 'conferencias', 'cursos_cortos', 'intercambio_cultural', 'aprendizaje_idiomas', 'experiencias_inmersivas'],
  religiosa: ['iglesias', 'templos', 'mezquitas', 'sinagogas', 'centros_espirituales', 'monasterios', 'sitios_peregrinacion', 'ceremonias_religiosas'],
  arquitectonica: ['edificios_emblematicos', 'arquitectura_moderna', 'arquitectura_colonial', 'rascacielos', 'puentes_iconicos', 'plazas_arquitectonicas', 'diseño_urbano', 'construcciones_unicas']
}

// Generar prompt con lógica 80/20
const generateCriticalPrompt = (userData) => {
  const preferences = []
  
  // 80% para experiencias principales con sus subcategorías
  if (userData.tipoExperiencia && userData.tipoExperiencia.length > 0) {
    const experiencias = userData.tipoExperiencia
    let subcategorias = []
    
    experiencias.forEach(exp => {
      if (categoriasMap[exp]) {
        subcategorias = [...subcategorias, ...categoriasMap[exp]]
      }
    })
    
    if (experiencias.length === 1) {
      preferences.push(`EXPERIENCIA PRINCIPAL (80%): ${experiencias[0].toUpperCase()} - incluir: ${subcategorias.join(', ')}`)
    } else {
      const porcentaje = Math.floor(80 / experiencias.length)
      preferences.push(`EXPERIENCIAS PRINCIPALES (80% total): ${experiencias.map(e => `${porcentaje}% ${e.toUpperCase()}`).join(', ')} - incluir: ${subcategorias.join(', ')}`)
    }
  }
  
  // 20% para intereses específicos
  if (userData.interesesEspecificos && userData.interesesEspecificos.length > 0) {
    preferences.push(`INTERESES ESPECÍFICOS (20%): ${userData.interesesEspecificos.join(', ')}`)
  }
  
  if (userData.restricciones && userData.restricciones.length > 0) {
    preferences.push(`RESTRICCIONES: ${userData.restricciones.join(', ')}`)
  }
  
  return preferences.join(' | ') || 'experiencia general'
}

// Alcance geográfico fijo de 300km para garantizar lugares con fotos
const determineGeographicScope = (userData, cityName, countryName) => {
  return {
    scope: 'regional',
    instruction: `Incluir ${cityName} Y ciudades/lugares cercanos en un radio de 300km para máxima variedad de opciones con Wikipedia y fotografías.`
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userData, sessionId } = req.body

    const fechaHoraInicio = userData.inicioTour || new Date().toISOString().slice(0, 16)
    const fechaHoraFin = userData.finTour || new Date(Date.now() + 8*60*60*1000).toISOString().slice(0, 16)
    const ciudad = userData.selectedCity || userData.detectedCity
    const puntoInicio = userData.ubicacionInicio
    
    // Calcular itinerario
    const calcularItinerario = () => {
      const inicio = new Date(fechaHoraInicio)
      const fin = new Date(fechaHoraFin)
      const diasTotales = Math.max(1, Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)))
      
      const horasDiarias = userData.duracionPreferida || userData.horasDiarias || '4-6h'
      const rangosHoras = {
        '2-3h': { minutos: 150, actividades: 3 },
        '4-5h': { minutos: 270, actividades: 4 },
        '4-6h': { minutos: 300, actividades: 4 },
        '6-7h': { minutos: 390, actividades: 6 },
        '6-8h': { minutos: 420, actividades: 6 },
        '8-10h': { minutos: 540, actividades: 5 }
      }
      
      const config = rangosHoras[horasDiarias] || { minutos: 300, actividades: 4 }
      const totalActividades = Math.min(diasTotales * config.actividades, 50)
      
      return {
        diasTotales,
        actividadesPorDia: config.actividades,
        totalActividades,
        minutosPorDia: config.minutos,
        horasDiarias
      }
    }
    
    const itinerario = calcularItinerario()
    const criticalPromptModifiers = generateCriticalPrompt(userData)
    const cityName = ciudad?.city || ciudad?.name || 'Ciudad'
    const countryName = ciudad?.country || 'País'
    
    const geoScope = determineGeographicScope(userData, cityName, countryName)
    
    const prompt = `You are a professional travel guide creating a route for ${cityName.toUpperCase()}, ${countryName.toUpperCase()}.

🌍 GEOGRAPHIC SCOPE: ${geoScope.instruction}
📚 WIKIPEDIA REQUIREMENT: ONLY include places that have Wikipedia articles with photographs
✅ USE ONLY real, specific places that exist within 300km radius AND have Wikipedia coverage

ROUTE DETAILS:
- TARGET AREA: ${cityName}, ${countryName} (radio de 300km para máxima variedad)
- STARTING POINT: ${puntoInicio?.direccion}
- DURATION: ${itinerario.diasTotales} days, ${itinerario.horasDiarias} daily
- ACTIVITIES NEEDED: EXACTLY ${itinerario.totalActividades} activities
- DISTRIBUTION: ${itinerario.actividadesPorDia} activities per day
- EXPERIENCE REQUIREMENTS: ${criticalPromptModifiers}

🚨 MANDATORY WIKIPEDIA PHOTO VERIFICATION FOR ALL CITIES WORLDWIDE

🔍 BEFORE INCLUDING ANY PLACE, YOU MUST MENTALLY VERIFY:

1. 📚 WIKIPEDIA ARTICLE CHECK:
   - Does this exact place have a Wikipedia article?
   - Search mentally: "[Place Name] + [City] Wikipedia"
   - If NO article exists, EXCLUDE immediately

2. 📷 PHOTO VERIFICATION CHECK:
   - Does the Wikipedia article contain photographs?
   - Are there images in the article or Wikimedia Commons?
   - If NO photos exist, EXCLUDE immediately

3. 🎯 SIGNIFICANCE CHECK:
   - Is it a major tourist attraction, museum, monument, or landmark?
   - Is it historically, culturally, or architecturally significant?
   - If NOT significant, EXCLUDE immediately

✅ ONLY INCLUDE PLACES THAT PASS ALL 3 CHECKS:
   • Major museums (National Museum, Art Museum, etc.)
   • Historical monuments and landmarks
   • Famous religious buildings (Cathedrals, major churches, temples)
   • Government buildings and palaces
   • UNESCO World Heritage sites
   • Major universities (main campus buildings)
   • Famous parks and natural landmarks
   • Historic city centers and main squares
   • Major cultural centers and theaters
   • Iconic architectural structures

❌ NEVER INCLUDE:
   • Restaurants, bars, cafes, nightlife venues
   • Shopping centers, malls, markets (unless historically significant)
   • Hotels, private businesses
   • Generic sports facilities
   • Modern commercial buildings
   • Small local attractions without Wikipedia coverage

🚨 CRITICAL RULE: If you have ANY doubt about Wikipedia photos, DO NOT include that place. Better to have fewer places with guaranteed photos than many places without photos.

INSTRUCTIONS:
1. ${geoScope.instruction}
2. RESPECT experience distribution requirements strictly
3. Each activity: 60-120 minutes + 15min travel
4. "lugar_fisico" field: exact place name only (must match Wikipedia article title)
5. "wikipedia_url" field: MANDATORY - exact Wikipedia article URL (e.g., https://es.wikipedia.org/wiki/Palacio_de_La_Moneda)
6. "wikipedia_image_url" field: MANDATORY - direct URL to main Wikipedia image (e.g., https://upload.wikimedia.org/wikipedia/commons/...)
7. Generate exactly ${itinerario.totalActividades} activities
8. ONLY include places where you can provide BOTH wikipedia_url AND wikipedia_image_url
9. This guarantees every place has photos available

JSON RESPONSE:
{
  "titulo": "Ruta Turística por ${cityName}",
  "duracion": "${itinerario.diasTotales} día(s)",
  "ruta": [
    {
      "orden": 1,
      "nombre": "${puntoInicio?.direccion || 'Punto de Inicio'}",
      "lugar_fisico": "${puntoInicio?.direccion || 'Punto de Inicio'}",
      "wikipedia_url": "",
      "wikipedia_image_url": "",
      "tipo": "${puntoInicio?.categoria || 'punto de inicio'}",
      "tiempo": "${fechaHoraInicio.split('T')[1] || '09:00'}-${fechaHoraInicio.split('T')[1] || '09:30'}",
      "descripcion": "${puntoInicio?.descripcion || 'Punto de partida de la ruta'}",
      "coordenadas": {"lat": ${puntoInicio?.coordenadas?.lat || ciudad?.lat || -33.4489}, "lon": ${puntoInicio?.coordenadas?.lon || ciudad?.lon || -70.6693}},
      "costo_estimado": "$0",
      "duracion_min": 30
    }
    // Add ${itinerario.totalActividades - 1} more activities for ${cityName}
  ],
  "costo_total_estimado": "[CALCULATE]",
  "dias_totales": ${itinerario.diasTotales},
  "actividades_por_dia": ${itinerario.actividadesPorDia},
  "minutos_por_dia": ${itinerario.minutosPorDia}
}`

    // Send to AI
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 600000) // 2 minutes ---
    
    const response = await fetch('http://localhost:10000/chat', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        sessionId: sessionId || `ruta-${Date.now()}`
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Parse AI response
    let tourData
    try {
      const aiResponse = data.output || data.data?.text || ''
      if (aiResponse) {
        let cleanOutput = aiResponse
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
        
        // Extract JSON
        const jsonMatch = cleanOutput.match(/{[\s\S]*}/)
        if (jsonMatch) {
          cleanOutput = jsonMatch[0]
        }
        
        tourData = JSON.parse(cleanOutput)
        
        // Clean data
        if (tourData.ruta) {
          tourData.ruta = tourData.ruta.map(punto => ({
            ...punto,
            nombre: punto.nombre?.replace(/undefined\s*/gi, '').trim() || 'Punto de interés',
            lugar_fisico: punto.lugar_fisico?.replace(/undefined\s*/gi, '').trim() || punto.nombre,
            descripcion: punto.descripcion?.replace(/undefined\s*/gi, '').trim() || 'Descripción no disponible'
          }))
        }
        
      } else {
        throw new Error('No output received')
      }
    } catch (error) {
      console.error('Error parsing JSON:', error)
      
      // Fallback
      tourData = {
        titulo: `Ruta Turística por ${cityName}`,
        duracion: `${itinerario.diasTotales} día(s)`,
        ruta: [{
          orden: 1,
          nombre: puntoInicio?.direccion || "Punto de inicio",
          lugar_fisico: puntoInicio?.direccion || "Punto de inicio",
          tipo: puntoInicio?.categoria || "punto de inicio",
          tiempo: `${fechaHoraInicio.split('T')[1] || '09:00'}-${fechaHoraInicio.split('T')[1] || '09:30'}`,
          descripcion: puntoInicio?.descripcion || "Punto de partida de la ruta",
          coordenadas: { 
            lat: puntoInicio?.coordenadas?.lat || ciudad?.lat || -33.4489, 
            lon: puntoInicio?.coordenadas?.lon || ciudad?.lon || -70.6693 
          },
          costo_estimado: "$0",
          duracion_min: 30
        }],
        costo_total_estimado: "$25000",
        dias_totales: itinerario.diasTotales,
        actividades_por_dia: itinerario.actividadesPorDia,
        minutos_por_dia: itinerario.minutosPorDia,
        consejos: [`Comenzar puntualmente en ${puntoInicio?.direccion}`, "Llevar agua"]
      }
    }
    
    res.status(200).json(tourData)
  } catch (error) {
    console.error('Route generation error:', error)
    res.status(500).json({ error: 'Error generating route' })
  }
}