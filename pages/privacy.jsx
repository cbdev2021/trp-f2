import { useRouter } from 'next/router'
import Footer from '../components/Footer'

export default function Privacy() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)'
      }}>
        <button 
          onClick={() => router.back()}
          style={{
            marginBottom: '2rem',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Volver
        </button>

        <h1 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>Política de Privacidad</h1>
        
        <div style={{ lineHeight: '1.6', color: '#4a5568' }}>
          <h2 style={{ color: '#2c3e50', fontSize: '1.2rem', marginTop: '2rem' }}>Información que recopilamos</h2>
          <p>TripPlanner detecta tu región general para sugerir lugares cercanos. Esta información se procesa temporalmente y no se almacena.</p>
          
          <h2 style={{ color: '#2c3e50', fontSize: '1.2rem', marginTop: '2rem' }}>Uso de datos</h2>
          <p>La información de región se usa exclusivamente para personalizar las recomendaciones turísticas. No compartimos esta información con terceros.</p>
          
          <h2 style={{ color: '#2c3e50', fontSize: '1.2rem', marginTop: '2rem' }}>Almacenamiento</h2>
          <p>No almacenamos datos personales ni información de ubicación en bases de datos. Todo el procesamiento es temporal.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}