import styles from './CategoryCard.module.css'

interface CategoryCardProps {
  id: string
  label: string
  score: number
  status: 'pass' | 'partial' | 'fail'
  feedback: string
  index: number
}

const colorMap = {
  pass: { color: 'var(--green)', bg: 'var(--green-bg)', border: 'var(--green-border)' },
  partial: { color: 'var(--amber)', bg: 'var(--amber-bg)', border: 'var(--amber-border)' },
  fail: { color: 'var(--red)', bg: 'var(--red-bg)', border: 'var(--red-border)' },
}

const iconMap = {
  pass: '✓',
  partial: '~',
  fail: '✗',
}

export default function CategoryCard({ label, score, status, feedback, index }: CategoryCardProps) {
  const colors = colorMap[status]

  return (
    <div
      className={`${styles.card} fade-up`}
      style={{
        '--delay': `${index * 60}ms`,
        '--bar-color': colors.color,
        borderBottomColor: colors.color,
      } as React.CSSProperties}
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.badge} style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}>
          {iconMap[status]}
        </span>
      </div>
      <div className={styles.scoreRow}>
        <span className={styles.score} style={{ color: colors.color }}>{score}</span>
        <span className={styles.scoreMax}>/100</span>
      </div>
      <div className={styles.barWrap}>
        <div
          className={styles.bar}
          style={{ '--target': `${score}%`, background: colors.color } as React.CSSProperties}
        />
      </div>
      <p className={styles.feedback}>{feedback}</p>
    </div>
  )
}
