import UsernameInput from '@/components/UsernameInput'
import ScrollReveal from '@/components/ScrollReveal'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      <ScrollReveal />

      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.logoText}>TTPageReview</span>
          <span className={styles.logoDivider}>by</span>
          <span className={styles.logoRCN}>RCN</span>
        </div>
      </nav>

      {/* Hero */}
      <main className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={`${styles.badge} fade-up`} style={{ '--delay': '0ms' } as React.CSSProperties}>
            Free Profile Audit
          </div>
          <h1 className={`${styles.headline} fade-up`} style={{ '--delay': '80ms' } as React.CSSProperties}>
            Is your TikTok profile<br />losing you followers?
          </h1>
          <p className={`${styles.sub} fade-up`} style={{ '--delay': '160ms' } as React.CSSProperties}>
            Enter your username and get a free profile review in seconds. See exactly what&apos;s working and what to fix.
          </p>
          <div className={`fade-up`} style={{ '--delay': '240ms' } as React.CSSProperties}>
            <UsernameInput />
          </div>
          <p className={`${styles.hint} fade-up`} style={{ '--delay': '320ms' } as React.CSSProperties}>
            No sign-up required. Results in under 10 seconds.
          </p>
        </div>

        <div className={styles.heroRight}>
          {/* Floating preview scorecard */}
          <div className={styles.previewCard}>

            {/* Profile row */}
            <div className={styles.previewHeader}>
              <div className={styles.previewAvatarTC}>TC</div>
              <div className={styles.previewInfo}>
                <div className={styles.previewName}>Taylor Chen</div>
                <div className={styles.previewMeta}>@taylorchen · 47.2K followers</div>
              </div>
              <div className={styles.previewScoreBadge}>
                <span className={styles.previewScoreNum}>74</span>
                <span className={styles.previewScoreGrade}>Good</span>
              </div>
            </div>

            {/* Category bars */}
            <div className={styles.previewGrid}>
              {[
                { label: 'Profile Photo', score: 88, color: '#16A34A' },
                { label: 'Username',      score: 72, color: '#16A34A' },
                { label: 'Bio',           score: 55, color: '#D97706' },
                { label: 'Video Grid',    score: 81, color: '#16A34A' },
                { label: 'Engagement',    score: 61, color: '#D97706' },
                { label: 'Consistency',   score: 40, color: '#D97706' },
              ].map((item) => (
                <div key={item.label} className={styles.previewItem}>
                  <span className={styles.previewLabel}>{item.label}</span>
                  <div className={styles.previewBarWrap}>
                    <div className={styles.previewBar} style={{ width: `${item.score}%`, background: item.color }} />
                  </div>
                  <span className={styles.previewNum} style={{ color: item.color }}>{item.score}</span>
                </div>
              ))}
            </div>

            {/* Priority fixes */}
            <div className={styles.previewFixes}>
              <div className={styles.previewFixRow}>
                <span className={styles.previewFixBadge} style={{ background: '#fef2f2', color: '#DC2626', borderColor: '#fecaca' }}>HIGH</span>
                <span className={styles.previewFixText}>Bio missing stream schedule</span>
              </div>
              <div className={styles.previewFixRow}>
                <span className={styles.previewFixBadge} style={{ background: '#fffbeb', color: '#D97706', borderColor: '#fde68a' }}>MED</span>
                <span className={styles.previewFixText}>Post every 2–3 days minimum</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* How it works */}
      <section className={styles.howItWorks}>
        <div className={styles.howInner}>
          <p className={styles.howEyebrow}>How it works</p>
          <h2 className={styles.howTitle}>A full profile audit in seconds</h2>
          <div className={styles.steps}>
            {[
              { num: '01', title: 'Enter your username', desc: 'Just your TikTok handle — no login, no permissions, no sign-up required.' },
              { num: '02', title: 'We analyze everything', desc: 'Profile photo, bio, username, video grid, engagement rate, and posting consistency.' },
              { num: '03', title: 'Get your score', desc: 'See exactly what\'s working, what to fix, and in what order to fix it.' },
            ].map((step, i) => (
              <div key={step.num} className={`${styles.step} fade-up`} style={{ '--delay': `${i * 80}ms` } as React.CSSProperties}>
                <div className={styles.stepNum}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What gets scored */}
      <section className={styles.scored}>
        <div className={styles.scoredInner}>
          <p className={styles.howEyebrow}>The scorecard</p>
          <h2 className={styles.howTitle}>6 categories, 100-point scale</h2>
          <div className={styles.scoredGrid}>
            {[
              { icon: '📸', label: 'Profile Photo', weight: '20%', desc: 'AI vision detects whether you have a real face photo or a logo.' },
              { icon: '🔤', label: 'Username', weight: '15%', desc: 'Length, numbers, and symbols that hurt searchability.' },
              { icon: '✍️', label: 'Bio', weight: '20%', desc: 'CTA, stream schedule, and link presence.' },
              { icon: '🎬', label: 'Video Grid', weight: '20%', desc: 'Niche consistency, cover art, and posting frequency.' },
              { icon: '📊', label: 'Engagement Rate', weight: '15%', desc: '(Likes + comments) ÷ views, averaged across your last 10 videos.' },
              { icon: '📅', label: 'Posting Consistency', weight: '10%', desc: 'Average days between posts and recency of last upload.' },
            ].map((cat) => (
              <div key={cat.label} className={styles.scoredCard}>
                <div className={styles.scoredIcon}>{cat.icon}</div>
                <div className={styles.scoredContent}>
                  <div className={styles.scoredHeader}>
                    <span className={styles.scoredLabel}>{cat.label}</span>
                    <span className={styles.scoredWeight}>{cat.weight}</span>
                  </div>
                  <p className={styles.scoredDesc}>{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RCN Strip */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeft}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="Rise Creator Network" className={styles.footerLogo} />
            <div>
              <p className={styles.footerHeadline}>The official TikTok LIVE agency behind this tool.</p>
              <p className={styles.footerText}>
                Join 100+ creators getting free 1-on-1 coaching, a dedicated creator manager, monthly bonuses, and a 60-day growth plan — and keep 100% of everything you earn.
              </p>
            </div>
          </div>
          <a
            href="https://join.risecreatornetwork.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerCta}
          >
            Join RCN — It&apos;s Free →
          </a>
        </div>
      </footer>
    </div>
  )
}
