export default function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message }) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>⚠️</div>
        
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#2c3e50',
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          {title}
        </h3>
        
        <p style={{
          color: '#64748b',
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '2rem',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              background: 'rgba(148, 163, 184, 0.1)',
              color: '#64748b',
              border: '2px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(148, 163, 184, 0.2)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(148, 163, 184, 0.1)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 8px 25px rgba(220, 38, 38, 0.3)',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px) scale(1.05)'
              e.target.style.boxShadow = '0 12px 35px rgba(220, 38, 38, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)'
              e.target.style.boxShadow = '0 8px 25px rgba(220, 38, 38, 0.3)'
            }}
          >
            Sí, regresar
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}