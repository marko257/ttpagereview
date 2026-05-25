import styles from './PriorityFix.module.css'

interface PriorityFixProps {
  priority: 'high' | 'medium' | 'quickwin'
  label: string
  description: string
  index: number
}

const priorityConfig = {
  high: { label: 'HIGH PRIORITY', color: 'var(--red)', bg: '#fef2f2', border: '#fecaca' },
  medium: { label: 'MEDIUM', color: 'var(--amber)', bg: '#fffbeb', border: '#fde68a' },
  quickwin: { label: 'QUICK WIN', color: 'var(--green)', bg: '#f0fdf4', border: '#bbf7d0' },
}

export default function PriorityFix({ priority, label, description, index }: PriorityFixProps) {
  const config = priorityConfig[priority]

  return (
    <div
      className={`${styles.fix} fade-up`}
      style={{
        '--delay': `${index * 80}ms`,
        '--border-color': config.color,
        background: config.bg,
        borderLeft: `3px solid ${config.color}`,
      } as React.CSSProperties}
    >
      <div className={styles.header}>
        <span className={styles.tag} style={{ color: config.color }}>{config.label}</span>
        <span className={styles.fixLabel}>{label}</span>
      </div>
      <p className={styles.description}>{description}</p>
    </div>
  )
}
