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
    
    // Sanitizar un punto (garantiza campos mínimos / coordenadas)
    const sanitizePoint = (punto, index) => {
      const nombre = (punto.nombre || punto.name || '').replace(/undefined\s*/gi, '').trim() || 'Punto de interés'
      const lugarFisico = (punto.lugar_fisico || punto.address || nombre).replace(/undefined\s*/gi, '').trim() || nombre
      const lat = parseFloat(punto.coordenadas?.lat || punto.lat || punto.latitude)
      const lon = parseFloat(punto.coordenadas?.lon || punto.coordenadas?.lng || punto.lon || punto.longitude)
      const sinTrailing = (v) => isNaN(v) ? null : parseFloat(v.toFixed(6))
      return {
        orden: punto.orden || index + 1,
        nombre,
        lugar_fisico: lugarFisico,
        tipo: punto.tipo || punto.category || 'lugar de interés',
        tiempo: punto.tiempo || punto.time || punto.horarios || `${9 + (index % 10)}:00-${10 + (index % 10)}:00`,
        descripcion: (punto.descripcion || punto.description || '').replace(/undefined\s*/gi, '').trim() || `Visita a ${nombre}`,
        coordenadas: {
          lat: sinTrailing(lat) ?? (ciudad?.lat || -33.4489),
          lon: sinTrailing(lon) ?? (ciudad?.lon || -70.6693)
        },
        costo_estimado: punto.costo_estimado ?? '$0',
        duracion_min: punto.duracion_min || punto.duracion || 90,
        wikipedia_url: punto.wikipedia_url || '',
        wikipedia_image_url: punto.wikipedia_image_url || ''
      }
    }

    // Extraer y parsear el JSON de la respuesta del chatbot de forma robusta:
    // descarta BOM, fences markdown, tags de razonamiento y texto previo.
    const extraerTourData = (aiResponse) => {
      let cleanOutput = (aiResponse || '')
        .replace(/^\uFEFF/, '')
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/\/\/.*$/gm, '')
        .replace(/<(thinking|reasoning|thought)[\s\S]*?<\/\1>/gi, '')
        .trim()

      // Buscar la primera '[' o '{' que inicie el JSON real (después de cualquier razonamiento)
      let startIdx = cleanOutput.indexOf('{')
      // Preferir el objeto que contenga "titulo" o "ruta"
      const tituloIdx = cleanOutput.indexOf('"titulo"')
      const rutaIdx = cleanOutput.indexOf('"ruta"')
      if (tituloIdx !== -1) {
        const brace = cleanOutput.lastIndexOf('{', tituloIdx)
        if (brace !== -1 && (startIdx === -1 || brace < startIdx)) startIdx = brace
      } else if (rutaIdx !== -1) {
        const brace = cleanOutput.lastIndexOf('{', rutaIdx)
        if (brace !== -1 && (startIdx === -1 || brace < startIdx)) startIdx = brace
      }
      const endIdx = cleanOutput.lastIndexOf('}')
      if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null

      cleanOutput = cleanOutput.substring(startIdx, endIdx + 1)

      // Intentos de parseo
      try {
        return JSON.parse(cleanOutput)
      } catch (e1) {
        // Reparación: vaciar URLs rotas y compactar
        const reparado = cleanOutput
          .replace(/"wikipedia_url"\s*:\s*"[^"]*"/g, '"wikipedia_url":""')
          .replace(/"wikipedia_image_url"\s*:\s*"[^"]*"/g, '"wikipedia_image_url":""')
          .replace(/\s+/g, ' ')
        try {
          return JSON.parse(reparado)
        } catch (e2) {
          // Extración mínima con regex
          const nombres = [...cleanOutput.matchAll(/"nombre"\s*:\s*"([^"]+)"/g)].map(m => m[1])
          const tipos = [...cleanOutput.matchAll(/"tipo"\s*:\s*"([^"]+)"/g)].map(m => m[1])
          const tiempos = [...cleanOutput.matchAll(/"tiempo"\s*:\s*"([^"]+)"/g)].map(m => m[1])
          const descripciones = [...cleanOutput.matchAll(/"descripcion"\s*:\s*"([^"]*?)"/g)].map(m => m[1])
          const lats = [...cleanOutput.matchAll(/"lat"\s*:\s*([\d.-]+)/g)].map(m => parseFloat(m[1]))
          const lons = [...cleanOutput.matchAll(/"lon"\s*:\s*([\d.-]+)/g)].map(m => parseFloat(m[1]))
          if (nombres.length === 0) return null
          return {
            titulo: `Ruta Turística por ${cityName}`,
            ruta: nombres.map((nombre, i) => ({
              orden: i + 1,
              nombre,
              lugar_fisico: nombre,
              tipo: tipos[i] || 'lugar de interés',
              tiempo: tiempos[i] || `${9 + i}:00-${10 + i}:00`,
              descripcion: descripciones[i] || `Visita a ${nombre}`,
              coordenadas: { lat: lats[i] || ciudad?.lat || -33.4489, lon: lons[i] || ciudad?.lon || -70.6693 },
              costo_estimado: '$0',
              duracion_min: 90,
              wikipedia_url: '',
              wikipedia_image_url: ''
            }))
          }
        }
      }
    }

    // Llamar al chatbot con reintento ante 5xx
    const chatTurismo = async (mensaje, subId) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 600000)
      let response = await fetch('http://localhost:10000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: mensaje,
          sessionId: sessionId || `ruta-${Date.now()}-${subId || ''}`,
          max_tokens: 8192,
          temperature: 0
        }),
        signal: controller.signal
      })
      if (!response.ok && response.status >= 500) {
        console.log('[TOUR-10.1] 🔁 Reintentando tras error', response.status);
        clearTimeout(timeoutId)
        const retryController = new AbortController()
        const retryTimeoutId = setTimeout(() => retryController.abort(), 600000)
        const retry = await fetch('http://localhost:10000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: mensaje,
            sessionId: sessionId || `ruta-${Date.now()}-${subId || ''}-retry`,
            max_tokens: 8192,
            temperature: 0
          }),
          signal: retryController.signal
        })
        clearTimeout(retryTimeoutId)
        response = retry
      }
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      return data.output || data.data?.text || ''
    }

    const baseDatos = {
      ciudad: cityName,
      pais: countryName,
      preferencias: criticalPromptModifiers,
      inicio: puntoInicio?.direccion,
      lat: ciudad?.lat || puntoInicio?.coordenadas?.lat || -33.4489,
      lon: ciudad?.lon || puntoInicio?.coordenadas?.lon || -70.6693,
      duracionPreferida: itinerario.horasDiarias,
      minutosPorDia: itinerario.minutosPorDia
    }

    const generarPromptDia = (diaIndex, nActividades = itinerario.actividadesPorDia) => `You are a professional travel guide creating ONLY the activities for DAY ${diaIndex} of a trip to ${cityName.toUpperCase()}, ${countryName.toUpperCase()}.

🎯 CONTEXT:
- City: ${cityName} (plus nearby places within 360km for variety)
- Day number: ${diaIndex} of ${itinerario.diasTotales}
- Starting point of the trip: ${puntoInicio?.direccion || 'City center'}
- Daily time budget: ${itinerario.minutosPorDia} minutes (${itinerario.horasDiarias})

🎯 USER PREFERENCES:
${criticalPromptModifiers}

📋 REQUIREMENTS FOR THIS DAY ONLY:
- Generate EXACTLY ${nActividades} activities (60-120 minutes each)
- They must be DIFFERENT from any other day's activities
- Match user preferences
- Prioritize ${cityName}; include some nearby cities/attractions for variety (30-40%)
- "wikipedia_url" and "wikipedia_image_url": use empty strings ""
- NO comments in JSON
- Logical travel flow and reasonable times

JSON RESPONSE (COMPLETE, NO COMMENTS):
{
  "ruta": [
    {
      "orden": 1,
      "nombre": "Activity Name",
      "lugar_fisico": "Physical Address",
      "wikipedia_url": "",
      "wikipedia_image_url": "",
      "tipo": "type",
      "tiempo": "10:00-11:30",
      "descripcion": "short description",
      "coordenadas": {"lat": -33.4489, "lon": -70.6693},
      "costo_estimado": "$0",
      "duracion_min": 90
    }
  ]
}

Generate complete valid JSON with EXACTLY ${nActividades} activities for DAY ${diaIndex}. NO comments.`

    console.log('[TOUR-10] 🚀 Generando ruta por días vía http://localhost:10000/chat');

    let rutasUnidas = []
    let diasOK = 0

    for (let dia = 1; dia <= itinerario.diasTotales; dia++) {
      let diaResuelto = false
      const intentarDia = async (nAct, sufijo, maxIntentos) => {
        for (let intento = 1; intento <= maxIntentos; intento++) {
          try {
            console.log(`[TOUR-10.2] 📅 Pidiendo día ${dia}/${itinerario.diasTotales} (${sufijo}, intento ${intento})`);
            const aiResponse = await chatTurismo(generarPromptDia(dia, nAct), `${sufijo}-${intento}`)
            const tourDia = extraerTourData(aiResponse)
            if (tourDia && Array.isArray(tourDia.ruta) && tourDia.ruta.length > 0) {
              rutasUnidas = rutasUnidas.concat(tourDia.ruta)
              diasOK++
              console.log(`[TOUR-10.3] ✅ Día ${dia} OK, acumulado: ${rutasUnidas.length}`);
              return true
            }
            console.log(`[TOUR-10.4] ⚠️ Día ${dia} sin resultados (${sufijo}, intento ${intento})`);
          } catch (e) {
            console.log(`[TOUR-10.5] ❌ Error en día ${dia} (${sufijo}, intento ${intento}): ${e.message}`);
          }
          const backoff = [0, 800, 2000][intento - 1] ?? 2500
          if (intento < maxIntentos) await new Promise(r => setTimeout(r, backoff))
        }
        return false
      }

      // Primero con el tamaño completo de actividades por día
      diaResuelto = await intentarDia(itinerario.actividadesPorDia, 'completo', 3)
      // Si falla, reintentar pidiendo la mitad de actividades (más fiable)
      if (!diaResuelto && itinerario.actividadesPorDia > 2) {
        const mitad = Math.max(2, Math.ceil(itinerario.actividadesPorDia / 2))
        console.log(`[TOUR-10.6] 🔽 Día ${dia}: reintentando con ${mitad} actividades`);
        await intentarDia(mitad, `reducido-${mitad}`, 2)
      }
    }

    console.log('[TOUR-28] 📊 Ruta generada, actividades:', rutasUnidas.length, 'diasOK:', diasOK);

    if (rutasUnidas.length === 0) {
      // Fallback de emergencia: al menos el punto de inicio
      rutasUnidas = [{
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
      }]
      console.log('[TOUR-27] 🔄 Usando fallback de emergencia (punto de inicio)');
    }

    rutasUnidas = rutasUnidas.map(sanitizePoint)

    const tourData = {
      titulo: `Ruta Turística por ${cityName}`,
      duracion: `${itinerario.diasTotales} día(s)`,
      ruta: rutasUnidas,
      costo_total_estimado: '$0',
      dias_totales: itinerario.diasTotales,
      actividades_por_dia: itinerario.actividadesPorDia,
      minutos_por_dia: itinerario.minutosPorDia,
      consejos: [`Comenzar puntualmente en ${puntoInicio?.direccion || cityName}`, "Llevar agua"]
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