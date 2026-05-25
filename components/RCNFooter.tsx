import styles from './RCNFooter.module.css'

export default function RCNFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.logoRow}>
            <span className={styles.logoMark}>RCN</span>
            <span className={styles.logoText}>Rise Creator Network</span>
          </div>
          <p className={styles.tagline}>
            We help TikTok LIVE creators 3–4x their income in 60 days. Dedicated manager, proven playbook, and paid traffic to your streams.
          </p>
        </div>
        <div className={styles.cta}>
          <a
            href="https://join.risecreatornetwork.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-yellow"
          >
            Join RCN →
          </a>
          <p className={styles.note}>Official TikTok LIVE agency partner</p>
        </div>
      </div>
    </footer>
  )
}
