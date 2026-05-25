import type { HashtagAnalysis as HashtagAnalysisType } from '@/lib/scoring'
import styles from './HashtagAnalysis.module.css'

interface Props {
  data: HashtagAnalysisType
}

export default function HashtagAnalysis({ data }: Props) {
  const { genericTags, nicheTags, genericRatio } = data
  const hasGeneric = genericTags.length > 0
  const hasNiche = nicheTags.length > 0
  const genericPct = Math.round(genericRatio * 100)

  // Overall verdict
  let verdict: 'good' | 'mixed' | 'bad'
  if (genericRatio < 0.2) verdict = 'good'
  else if (genericRatio < 0.5) verdict = 'mixed'
  else verdict = 'bad'

  const verdictConfig = {
    good: {
      color: 'var(--green)',
      bg: 'var(--green-bg)',
      border: 'var(--green-border)',
      label: 'GREAT STRATEGY',
      summary: 'Mostly specific hashtags — the algorithm knows exactly who to show your content to.',
    },
    mixed: {
      color: 'var(--amber)',
      bg: 'var(--amber-bg)',
      border: 'var(--amber-border)',
      label: 'NEEDS WORK',
      summary: `${genericPct}% of your hashtag usage is generic tags. Replace them with niche-specific ones.`,
    },
    bad: {
      color: 'var(--red)',
      bg: 'var(--red-bg)',
      border: 'var(--red-border)',
      label: 'FIX THIS',
      summary: `${genericPct}% of your hashtags are generic (#fyp, #viral, etc.). These don't help the algorithm place your content.`,
    },
  }

  const vc = verdictConfig[verdict]

  return (
    <div className={styles.wrap}>
      {/* Header row */}
      <div className={styles.header}>
        <div>
          <p className={styles.summary}>{vc.summary}</p>
        </div>
        <span
          className={styles.badge}
          style={{ background: vc.bg, color: vc.color, border: `1px solid ${vc.border}` }}
        >
          {vc.label}
        </span>
      </div>

      <div className={styles.columns}>
        {/* Generic / bad tags */}
        <div className={styles.col}>
          <div className={styles.colHeader}>
            <span className={styles.colIcon}>🚩</span>
            <span className={styles.colTitle}>Generic tags</span>
            <span className={styles.colHint}>hurts discoverability</span>
          </div>
          {hasGeneric ? (
            <div className={styles.tagCloud}>
              {genericTags.map(({ tag, count }) => (
                <span key={tag} className={`${styles.tag} ${styles.tagBad}`}>
                  #{tag}
                  {count > 1 && <em className={styles.tagCount}>×{count}</em>}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>None found — good job!</p>
          )}
        </div>

        {/* Niche / good tags */}
        <div className={styles.col}>
          <div className={styles.colHeader}>
            <span className={styles.colIcon}>✅</span>
            <span className={styles.colTitle}>Niche tags</span>
            <span className={styles.colHint}>tells the algorithm who to show you to</span>
          </div>
          {hasNiche ? (
            <div className={styles.tagCloud}>
              {nicheTags.map(({ tag, count }) => (
                <span key={tag} className={`${styles.tag} ${styles.tagGood}`}>
                  #{tag}
                  {count > 1 && <em className={styles.tagCount}>×{count}</em>}
                </span>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No niche hashtags found. Start using specific tags for your content category.</p>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className={styles.tip}>
        <span className={styles.tipIcon}>💡</span>
        <span>Use 3–5 specific hashtags per video instead of generic ones. Think: <strong>who is your ideal viewer?</strong> Use the hashtags they follow.</span>
      </div>
    </div>
  )
}
