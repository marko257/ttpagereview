import styles from './RCNFooter.module.css'

export default function RCNFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.left}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rcn-logo.jpg" alt="Rise Creator Network" className={styles.logo} />
          <div>
            <p className={styles.headline}>The official TikTok LIVE agency behind this tool.</p>
            <p className={styles.tagline}>
              Join 100+ creators getting free 1-on-1 coaching, a dedicated creator manager, monthly bonuses, and a 60-day growth plan — and keep 100% of everything you earn.
            </p>
          </div>
        </div>
        <div className={styles.cta}>
          <a
            href="https://join.risecreatornetwork.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaBtn}
          >
            Join RCN — It&apos;s Free →
          </a>
          <p className={styles.note}>Official TikTok LIVE agency partner · 0% revenue share</p>
        </div>
      </div>
    </footer>
  )
}
