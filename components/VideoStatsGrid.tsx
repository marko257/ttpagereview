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

const stats: Array<{
  key: keyof Omit<VideoStats, 'videosAnalyzed'>
  label: string
  icon: string
  highlight?: boolean
}> = [
  { key: 'avgViews',    label: 'Avg Views',    icon: '👁'  },
  { key: 'avgLikes',    label: 'Avg Likes',    icon: '❤️'  },
  { key: 'avgComments', label: 'Avg Comments', icon: '💬'  },
  { key: 'avgShares',   label: 'Avg Shares',   icon: '↗️',  highlight: true },
  { key: 'avgSaves',    label: 'Avg Saves',    icon: '🔖',  highlight: true },
]

export default function VideoStatsGrid({ data }: Props) {
  return (
    <div className={styles.wrap}>
      {/* Callout banner */}
      <div className={styles.callout}>
        <span className={styles.calloutIcon}>⭐</span>
        <span>
          <strong>Shares and saves are the most powerful signals</strong> — they tell the algorithm your content is worth pushing to new audiences. Focus on content that makes people want to send it or bookmark it.
        </span>
      </div>

      <div className={styles.grid}>
        {stats.map(({ key, label, icon, highlight }) => {
          const value = data[key]
          return (
            <div key={key} className={`${styles.card} ${highlight ? styles.cardHighlight : ''}`}>
              {highlight && (
                <span className={styles.keyBadge}>KEY METRIC</span>
              )}
              <span className={styles.icon}>{icon}</span>
              <span className={`${styles.value} ${highlight ? styles.valueHighlight : ''}`}>
                {fmt(value)}
              </span>
              <span className={styles.label}>{label}</span>
              <span className={styles.desc}>per video</span>
            </div>
          )
        })}
      </div>

      <p className={styles.footnote}>Based on {data.videosAnalyzed} most recent videos</p>
    </div>
  )
}
