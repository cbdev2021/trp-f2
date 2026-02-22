import Link from 'next/link'

export default function Footer() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '10px',
      marginTop: '10px',
      textAlign: 'center',
      fontSize: '11px',
      color: '#94a3b8'
    }}>
      <Link href="/privacy" style={{
        color: '#94a3b8',
        textDecoration: 'none',
        marginRight: '15px'
      }}>
        Privacidad
      </Link>
      <Link href="/terms" style={{
        color: '#94a3b8',
        textDecoration: 'none'
      }}>
        Términos
      </Link>
    </div>
  )
}