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

// Alcance geográfico de 360km
const determineGeographicScope = (userData, cityName, countryName) => {
  return {
    scope: 'regional',
    instruction: `Incluir ${cityName} Y ciudades/lugares cercanos en un radio de 360km para máxima variedad de opciones.`
  }
}

export default async function handler(req, res) {
  console.log('[TOUR-1] 🟢 Iniciando handler');
  
  if (req.method !== 'POST') {
    console.log('[TOUR-2] ❌ Método no permitido:', req.method);
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('[TOUR-3] ✅ Método POST validado');

  try {
    const { userData, sessionId } = req.body
    console.log('[TOUR-4] 📦 Datos recibidos:', { sessionId, hasUserData: !!userData });

    const fechaHoraInicio = userData.inicioTour || new Date().toISOString().slice(0, 16)
    const fechaHoraFin = userData.finTour || new Date(Date.now() + 8*60*60*1000).toISOString().slice(0, 16)
    const ciudad = userData.selectedCity || userData.detectedCity
    const puntoInicio = userData.ubicacionInicio
    
    console.log('[TOUR-5] 📋 Datos extraídos:', { ciudad: ciudad?.city, inicio: fechaHoraInicio, fin: fechaHoraFin });
    
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
    console.log('[TOUR-6] 📊 Itinerario calculado:', itinerario);
    
    const criticalPromptModifiers = generateCriticalPrompt(userData)
    console.log('[TOUR-7] 🎯 Preferencias generadas, length:', criticalPromptModifiers.length);
    
    const cityName = ciudad?.city || ciudad?.name || 'Ciudad'
    const countryName = ciudad?.country || 'País'
    
    const geoScope = determineGeographicScope(userData, cityName, countryName)
    
    const prompt = `You are a professional travel guide creating a route for ${cityName.toUpperCase()}, ${countryName.toUpperCase()}.

🎯 ROUTE REQUIREMENTS:
- Geographic Area: ${cityName} + 360km radius
- Starting Point: ${puntoInicio?.direccion}
- Duration: ${itinerario.diasTotales} days, ${itinerario.horasDiarias} per day
- Total Activities: EXACTLY ${itinerario.totalActividades} activities
- Activities per Day: ${itinerario.actividadesPorDia}
- User Preferences: ${criticalPromptModifiers}

📍 GEOGRAPHIC RULES:
- Include places within 360km radius from ${cityName}
- Prioritize places in ${cityName} first (60-70% of activities)
- Include nearby cities/attractions for variety (30-40%)
- Ensure logical travel flow and distances

🎯 EXPERIENCE DISTRIBUTION (MANDATORY):
${criticalPromptModifiers}
- STRICTLY follow the 80/20 distribution
- Match activities to user's experience preferences
- Respect all restrictions mentioned

📋 ACTIVITY REQUIREMENTS:
- Each activity: 60-120 minutes
- Travel time between activities: 15-30 minutes
- Total daily time: ${itinerario.minutosPorDia} minutes (${itinerario.horasDiarias})
- Generate EXACTLY ${itinerario.totalActividades} activities

✅ INCLUDE:
- Major museums, monuments, landmarks
- Historic sites, cathedrals, palaces
- UNESCO sites, famous parks
- Cultural centers matching user preferences

❌ EXCLUDE:
- Restaurants, bars, nightlife (unless user specifically requested)
- Shopping centers, hotels
- Generic facilities without significance

INSTRUCTIONS:
1. Generate EXACTLY ${itinerario.totalActividades} activities
2. Distribute ${itinerario.actividadesPorDia} activities per day
3. Match ${criticalPromptModifiers} preferences
4. Stay within 360km radius
5. "wikipedia_url" and "wikipedia_image_url": use empty strings ""
6. NO comments in JSON

JSON RESPONSE (COMPLETE, NO COMMENTS):
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
  ],
  "costo_total_estimado": "$0",
  "dias_totales": ${itinerario.diasTotales},
  "actividades_por_dia": ${itinerario.actividadesPorDia},
  "minutos_por_dia": ${itinerario.minutosPorDia}
}

Generate complete valid JSON with ALL ${itinerario.totalActividades} activities. NO comments.`

    console.log('[TOUR-8] 📝 Prompt generado, length:', prompt.length);

    // Send to AI
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log('[TOUR-9] ⏱️ TIMEOUT alcanzado (10min)');
      controller.abort()
    }, 600000)
    
    console.log('[TOUR-10] 🚀 Llamando a IA en http://localhost:10000/chat');
    
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
    console.log('[TOUR-11] 📡 Respuesta recibida, status:', response.status);

    if (!response.ok) {
      console.log('[TOUR-12] ❌ Respuesta no OK:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log('[TOUR-13] ✅ Respuesta OK, parseando...');
    const data = await response.json()
    console.log('[TOUR-14] 📊 JSON de respuesta parseado, keys:', Object.keys(data));
    
    // Parse AI response con reparación (como n8n)
    let tourData
    try {
      const aiResponse = data.output || data.data?.text || ''
      console.log('[TOUR-15] 📦 AI Response extraído, length:', aiResponse.length);
      
      if (aiResponse) {
        // Limpieza básica (como n8n)
        let cleanOutput = aiResponse
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/\/\/.*$/gm, '')  // Eliminar comentarios
          .replace(/[\n\r\t]/g, ' ')  // Eliminar saltos de línea
          .trim()
        
        console.log('[TOUR-16] 🧹 Output limpiado, length:', cleanOutput.length);
        
        // Extract JSON
        const jsonMatch = cleanOutput.match(/{[\s\S]*}/)
        if (jsonMatch) {
          cleanOutput = jsonMatch[0]
          console.log('[TOUR-17] 🔍 JSON extraído con regex');
        }
        
        console.log('[TOUR-18] 🔄 Intentando parsear JSON...');
        
        // Intentar parsear
        try {
          tourData = JSON.parse(cleanOutput)
          console.log('[TOUR-19] ✅ JSON parseado exitosamente, ruta length:', tourData.ruta?.length);
        } catch (parseError) {
          console.log('[TOUR-20] ⚠️ Parseo falló, aplicando reparación...');
          console.log('[TOUR-20.1] 🔍 Error:', parseError.message);
          
          // Reparación (como n8n): eliminar URLs rotas
          cleanOutput = cleanOutput
            .replace(/"wikipedia_url"\s*:\s*"[^"]*"/g, '"wikipedia_url":""')
            .replace(/"wikipedia_image_url"\s*:\s*"[^"]*"/g, '"wikipedia_image_url":""')
            .replace(/\s+/g, ' ')
          
          console.log('[TOUR-21] 🔧 Reparación aplicada, reintentando parseo...');
          
          try {
            tourData = JSON.parse(cleanOutput)
            console.log('[TOUR-22] ✅ JSON reparado y parseado exitosamente');
          } catch (repairError) {
            console.log('[TOUR-22.1] ❌ Reparación falló, extrayendo manualmente...');
            
            // EXTRACCIÓN MANUAL: Extraer lo que se pueda con regex
            try {
              const nombres = [...cleanOutput.matchAll(/"nombre"\s*:\s*"([^"]+)"/g)].map(m => m[1])
              const tipos = [...cleanOutput.matchAll(/"tipo"\s*:\s*"([^"]+)"/g)].map(m => m[1])
              const tiempos = [...cleanOutput.matchAll(/"tiempo"\s*:\s*"([^"]+)"/g)].map(m => m[1])
              const descripciones = [...cleanOutput.matchAll(/"descripcion"\s*:\s*"([^"]*?)"/g)].map(m => m[1])
              const lats = [...cleanOutput.matchAll(/"lat"\s*:\s*([\d.-]+)/g)].map(m => parseFloat(m[1]))
              const lons = [...cleanOutput.matchAll(/"lon"\s*:\s*([\d.-]+)/g)].map(m => parseFloat(m[1]))
              
              console.log('[TOUR-22.2] 📊 Extraídos:', { nombres: nombres.length, lats: lats.length });
              
              if (nombres.length > 0) {
                tourData = {
                  titulo: `Ruta Turística por ${cityName}`,
                  duracion: `${itinerario.diasTotales} día(s)`,
                  ruta: nombres.map((nombre, i) => ({
                    orden: i + 1,
                    nombre: nombre,
                    lugar_fisico: nombre,
                    tipo: tipos[i] || 'lugar de interés',
                    tiempo: tiempos[i] || `${9 + i}:00-${10 + i}:00`,
                    descripcion: descripciones[i] || `Visita a ${nombre}`,
                    coordenadas: {
                      lat: lats[i] || ciudad?.lat || -33.4489,
                      lon: lons[i] || ciudad?.lon || -70.6693
                    },
                    costo_estimado: '$0',
                    duracion_min: 90,
                    wikipedia_url: '',
                    wikipedia_image_url: ''
                  })),
                  costo_total_estimado: '$0',
                  dias_totales: itinerario.diasTotales,
                  actividades_por_dia: itinerario.actividadesPorDia,
                  minutos_por_dia: itinerario.minutosPorDia
                }
                console.log('[TOUR-22.3] ✅ Datos extraídos manualmente:', tourData.ruta.length, 'actividades');
              } else {
                throw repairError
              }
            } catch (extractError) {
              console.log('[TOUR-22.4] ❌ Extracción manual falló');
              throw parseError
            }
          }
        }
        
        // Clean data
        if (tourData.ruta) {
          console.log('[TOUR-23] 🧹 Limpiando datos de ruta...');
          tourData.ruta = tourData.ruta.map(punto => ({
            ...punto,
            nombre: punto.nombre?.replace(/undefined\s*/gi, '').trim() || 'Punto de interés',
            lugar_fisico: punto.lugar_fisico?.replace(/undefined\s*/gi, '').trim() || punto.nombre,
            descripcion: punto.descripcion?.replace(/undefined\s*/gi, '').trim() || 'Descripción no disponible',
            wikipedia_url: punto.wikipedia_url || '',
            wikipedia_image_url: punto.wikipedia_image_url || ''
          }))
          console.log('[TOUR-24] ✅ Datos limpiados');
        }
        
      } else {
        console.log('[TOUR-25] ❌ No hay output de IA');
        throw new Error('No output received')
      }
    } catch (error) {
      console.error('[TOUR-26] 💥 ERROR en parseo:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n')[0]
      });
      
      console.log('[TOUR-27] 🔄 Usando fallback...');
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
    
    console.log('[TOUR-28] ✅ Enviando respuesta exitosa, ruta length:', tourData.ruta?.length);
    res.status(200).json(tourData)
    
  } catch (error) {
    console.error('[TOUR-29] 💥 ERROR FATAL:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    });
    res.status(500).json({ error: 'Error generating route' })
  }
}