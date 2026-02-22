export default function TripPlanLogo({ size = 'medium', color = '#2c3e50', subtitleColor = '#667eea', onClick }) {
  const sizes = {
    large: {
      robot: '80px',
      title: '50px',
      subtitle: '20px',
      gap: '-23px',
      robotMarginLeft: '-8px',
      titleMarginTop: '2px',
      titleMarginLeft: '-3px',
      subtitleMarginTop: '7px',
      subtitleMarginLeft: '-2px'
    },
    medium: {
      robot: '50px',
      title: '32px',
      subtitle: '14px',
      gap: '-18px',
      robotMarginLeft: '-6px',
      titleMarginTop: '3px',
      titleMarginLeft: '0px',
      subtitleMarginTop: '4px',
      subtitleMarginLeft: '1px'
    },
    small: {
      robot: '40px',
      title: '24px',
      subtitle: '12px',
      gap: '-15px',
      robotMarginLeft: '-4px',
      titleMarginTop: '4px',
      titleMarginLeft: '1px',
      subtitleMarginTop: '3px',
      subtitleMarginLeft: '2px'
    }
  }

  const s = sizes[size]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: s.gap,
      cursor: onClick ? 'pointer' : 'default'
    }} onClick={onClick}>
      <img 
        src="/RobotEmo.png"
        alt="Robot"
        style={{
          width: s.robot,
          height: s.robot,
          objectFit: 'contain',
          display: 'block',
          marginLeft: s.robotMarginLeft
        }}
      />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
      }}>
        <h1 style={{
          fontSize: s.title,
          fontWeight: '700',
          color: color,
          margin: 0,
          letterSpacing: '-0.02em',
          lineHeight: '0.85',
          marginTop: s.titleMarginTop,
          marginLeft: s.titleMarginLeft
        }}>
          TripPlanner
        </h1>
        <p style={{
          fontSize: s.subtitle,
          color: subtitleColor,
          margin: 0,
          fontWeight: '500',
          letterSpacing: '0.5px',
          marginTop: s.subtitleMarginTop,
          marginLeft: s.subtitleMarginLeft,
          lineHeight: '1.2'
        }}>
          IA Agent
        </p>
      </div>
    </div>
  )
}