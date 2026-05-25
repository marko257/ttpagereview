import styles from './CategoryCard.module.css'

interface CategoryCardProps {
  id: string
  label: string
  score: number
  status: 'pass' | 'partial' | 'fail'
  feedback: string
  details?: string[]
  index: number
}

const colorMap = {
  pass: {
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    border: 'var(--green-border)',
    label: 'PASS',
  },
  partial: {
    color: 'var(--amber)',
    bg: 'var(--amber-bg)',
    border: 'var(--amber-border)',
    label: 'NEEDS WORK',
  },
  fail: {
    color: 'var(--red)',
    bg: 'var(--red-bg)',
    border: 'var(--red-border)',
    label: 'FIX THIS',
  },
}

export default function CategoryCard({ label, score, status, feedback, details, index }: CategoryCardProps) {
  const c = colorMap[status]
  const circumference = 2 * Math.PI * 26  // r=26
  const offset = circumference - (score / 100) * circumference

  return (
    <div
      className={`${styles.card} fade-up`}
      style={{ '--delay': `${index * 60}ms`, '--accent': c.color } as React.CSSProperties}
    >
      {/* Top row: label + status badge */}
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span
          className={styles.statusBadge}
          style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
        >
          {c.label}
        </span>
      </div>

      {/* Score ring + feedback */}
      <div className={styles.body}>
        {/* SVG ring */}
        <div className={styles.ringWrap}>
          <svg width="68" height="68" viewBox="0 0 68 68" className={styles.ring}>
            <circle cx="34" cy="34" r="26" fill="none" stroke="#f0f0f0" strokeWidth="5" />
            <circle
              cx="34"
              cy="34"
              r="26"
              fill="none"
              stroke={c.color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 34 34)"
              className={styles.ringFill}
            />
          </svg>
          <span className={styles.ringScore} style={{ color: c.color }}>{score}</span>
        </div>

        {/* Text */}
        <div className={styles.textBlock}>
          <p className={styles.feedback}>{feedback}</p>
          {details && details.length > 0 && (
            <div className={styles.chips}>
              {details.map((d) => (
                <span key={d} className={styles.chip}>{d}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
