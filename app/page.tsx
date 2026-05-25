import UsernameInput from '@/components/UsernameInput'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span className={styles.logoText}>TTPageReview</span>
          <span className={styles.logoDivider}>by</span>
          <span className={styles.logoRCN}>RCN</span>
        </div>
        <a
          href="https://join.risecreatornetwork.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Join RCN →
        </a>
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
          {/* Floating preview scorecard — static mockup */}
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div className={styles.previewAvatar} />
              <div>
                <div className={styles.previewName}>@yourprofile</div>
                <div className={styles.previewMeta}>1,284 followers · 47 videos</div>
              </div>
              <div className={styles.previewScore}>72</div>
            </div>
            <div className={styles.previewGrid}>
              {[
                { label: 'Profile Photo', score: 90, color: '#16A34A' },
                { label: 'Username', score: 45, color: '#D97706' },
                { label: 'Bio', score: 55, color: '#D97706' },
                { label: 'Video Grid', score: 80, color: '#16A34A' },
                { label: 'Engagement', score: 62, color: '#D97706' },
                { label: 'Consistency', score: 70, color: '#16A34A' },
              ].map((item) => (
                <div key={item.label} className={styles.previewItem} style={{ '--bar-color': item.color } as React.CSSProperties}>
                  <span className={styles.previewLabel}>{item.label}</span>
                  <div className={styles.previewBarWrap}>
                    <div className={styles.previewBar} style={{ width: `${item.score}%`, background: item.color }} />
                  </div>
                  <span className={styles.previewNum} style={{ color: item.color }}>{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* RCN Strip */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerText}>Built by <strong>Rise Creator Network</strong> — helping TikTok LIVE creators 3–4x their income</span>
          <a
            href="https://join.risecreatornetwork.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-yellow"
          >
            Join RCN →
          </a>
        </div>
      </footer>
    </div>
  )
}
