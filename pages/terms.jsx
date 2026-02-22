import { useRouter } from 'next/router'
import Footer from '../components/Footer'

export default function Terms() {
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

        <h1 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>Términos de Uso</h1>
        
        <div style={{ lineHeight: '1.6', color: '#4a5568' }}>
          <h2 style={{ color: '#2c3e50', fontSize: '1.2rem', marginTop: '2rem' }}>Uso del servicio</h2>
          <p>TripPlanner es una demo que genera recomendaciones turísticas usando IA. Al usar el servicio, aceptas que podemos detectar tu región general para personalizar las sugerencias.</p>
          
          <h2 style={{ color: '#2c3e50', fontSize: '1.2rem', marginTop: '2rem' }}>Ubicación</h2>
          <p>Detectamos tu región general para sugerir lugares cercanos. Puedes seleccionar manualmente cualquier ubicación durante el proceso.</p>
          
          <h2 style={{ color: '#2c3e50', fontSize: '1.2rem', marginTop: '2rem' }}>Limitaciones</h2>
          <p>Este es un proyecto de demostración. Las recomendaciones son generadas por IA y pueden no reflejar condiciones actuales de los lugares sugeridos.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}