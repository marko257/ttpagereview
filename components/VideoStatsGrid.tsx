import type { VideoStats } from '@/lib/scoring'
import styles from './VideoStatsGrid.module.css'

interface Props {
  data: VideoStats
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

const stats = [
  { key: 'avgViews',    label: 'Avg Views',     icon: '👁',  description: 'per video' },
  { key: 'avgLikes',    label: 'Avg Likes',     icon: '❤️',  description: 'per video' },
  { key: 'avgComments', label: 'Avg Comments',  icon: '💬',  description: 'per video' },
  { key: 'avgShares',   label: 'Avg Shares',    icon: '↗️',  description: 'per video' },
  { key: 'avgSaves',    label: 'Avg Saves',     icon: '🔖',  description: 'per video' },
] as const

export default function VideoStatsGrid({ data }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {stats.map(({ key, label, icon, description }) => {
          const value = data[key]
          return (
            <div key={key} className={styles.card}>
              <span className={styles.icon}>{icon}</span>
              <span className={styles.value}>{fmt(value)}</span>
              <span className={styles.label}>{label}</span>
              <span className={styles.desc}>{description}</span>
            </div>
          )
        })}
      </div>
      <p className={styles.footnote}>Based on {data.videosAnalyzed} most recent videos</p>
    </div>
  )
}
