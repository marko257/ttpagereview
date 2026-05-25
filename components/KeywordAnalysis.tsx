import type { KeywordAnalysis as KeywordAnalysisType } from '@/lib/scoring'
import styles from './KeywordAnalysis.module.css'

interface Props {
  data: KeywordAnalysisType
  totalVideos: number
}

export default function KeywordAnalysis({ data, totalVideos }: Props) {
  const { insights, overallCoverage, videosWithNoKeywords } = data

  const pct = Math.round(overallCoverage * 100)
  const missingPct = Math.round((videosWithNoKeywords / totalVideos) * 100)

  let verdict: 'good' | 'mixed' | 'bad'
  if (overallCoverage >= 0.6) verdict = 'good'
  else if (overallCoverage >= 0.3) verdict = 'mixed'
  else verdict = 'bad'

  const verdictConfig = {
    good: {
      color: 'var(--green)',
      bg: 'var(--green-bg)',
      border: 'var(--green-border)',
      label: 'STRONG',
    },
    mixed: {
      color: 'var(--amber)',
      bg: 'var(--amber-bg)',
      border: 'var(--amber-border)',
      label: 'INCONSISTENT',
    },
    bad: {
      color: 'var(--red)',
      bg: 'var(--red-bg)',
      border: 'var(--red-border)',
      label: 'MISSING KEYWORDS',
    },
  }

  const vc = verdictConfig[verdict]

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <p className={styles.summary}>
            {verdict === 'good'
              ? `Descriptions include niche keywords on ${pct}% of videos. The algorithm knows your topic.`
              : verdict === 'mixed'
              ? `Niche keywords appear in only ${pct}% of video descriptions. ${missingPct}% of videos give the algorithm no topic signal.`
              : `${missingPct}% of your videos have descriptions with no niche keywords. You're relying on hashtags alone — descriptions reinforce the signal.`}
          </p>
        </div>
        <span
          className={styles.badge}
          style={{ background: vc.bg, color: vc.color, border: `1px solid ${vc.border}` }}
        >
          {vc.label}
        </span>
      </div>

      {/* Keyword rows */}
      <div className={styles.rows}>
        {insights.map(({ keyword, inDescriptions, coverage }) => {
          const bar = Math.round(coverage * 100)
          const rowColor =
            coverage >= 0.6 ? 'var(--green)' :
            coverage >= 0.3 ? 'var(--amber)' :
            'var(--red)'

          return (
            <div key={keyword} className={styles.row}>
              <span className={styles.keyword}>#{keyword}</span>
              <div className={styles.barWrap}>
                <div
                  className={styles.bar}
                  style={{ width: `${bar}%`, background: rowColor }}
                />
              </div>
              <span className={styles.stat} style={{ color: rowColor }}>
                {inDescriptions}/{totalVideos} videos
              </span>
            </div>
          )
        })}
      </div>

      <div className={styles.tip}>
        <span className={styles.tipIcon}>💡</span>
        <span>
          Write your main topic keyword naturally in every description — not just as a hashtag.
          If you post Fortnite content, write <strong>"Fortnite"</strong> in the caption itself.
          TikTok reads descriptions to confirm what your video is about.
        </span>
      </div>
    </div>
  )
}
