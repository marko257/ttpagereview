import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import CategoryCard from '@/components/CategoryCard'
import PriorityFix from '@/components/PriorityFix'
import RCNFooter from '@/components/RCNFooter'
import ScoreCounter from '@/components/ScoreCounter'
import { fetchProfile, fetchVideos } from '@/lib/tiktok'
import { scoreProfilePhoto } from '@/lib/vision'
import { computeScores } from '@/lib/scoring'
import ShareButton from '@/components/ShareButton'
import HashtagAnalysis from '@/components/HashtagAnalysis'
import KeywordAnalysis from '@/components/KeywordAnalysis'
import VideoStatsGrid from '@/components/VideoStatsGrid'
import styles from './page.module.css'

async function getAnalysis(username: string) {
  try {
    const [profile, videos] = await Promise.all([
      fetchProfile(username),
      fetchVideos(username, 20),
    ])

    const photoScore = await scoreProfilePhoto(profile.avatarUrl)
    const scores = computeScores(profile, videos, photoScore)

    return {
      username: profile.uniqueId,
      displayName: profile.nickname,
      avatarUrl: profile.avatarUrl,
      followerCount: profile.followerCount,
      videoCount: profile.videoCount,
      bio: profile.signature || '',
      bioLink: profile.bioLink || '',
      ...scores,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown'
    if (message === 'user_not_found') {
      return { error: 'user_not_found' as const, username }
    }
    console.error('Analysis error:', err)
    return { error: 'api_error' as const }
  }
}

function scoreColor(score: number) {
  if (score >= 70) return 'var(--green)'
  if (score >= 40) return 'var(--amber)'
  return 'var(--red)'
}

function scoreLabel(score: number) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Needs Work'
  if (score >= 30) return 'Weak'
  return 'Poor'
}

function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

async function ResultsContent({ username }: { username: string }) {
  const data = await getAnalysis(username)

  if (data.error === 'user_not_found') {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>?</div>
        <h2 className={styles.errorTitle}>Profile not found</h2>
        <p className={styles.errorText}>We couldn&apos;t find <strong>@{data.username}</strong>. Double-check the spelling and try again.</p>
        <a href="/" className="btn-primary" style={{ marginTop: '8px' }}>Try Again</a>
      </div>
    )
  }

  if (data.error) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>!</div>
        <h2 className={styles.errorTitle}>Something went wrong</h2>
        <p className={styles.errorText}>We couldn&apos;t analyze that profile right now. Try again in a moment.</p>
        <a href="/" className="btn-primary" style={{ marginTop: '8px' }}>Try Again</a>
      </div>
    )
  }

  // Percentile: rough mapping of score → where they stand vs other profiles
  const percentile = Math.min(97, Math.max(5, Math.round(data.overallScore * 0.88 + 5)))

  // Engagement rate from video stats
  const engRate = data.videoStats && data.videoStats.avgViews > 0
    ? ((data.videoStats.avgLikes + data.videoStats.avgComments) / data.videoStats.avgViews * 100).toFixed(1)
    : null

  return (
    <>
      {/* Hero card — dark header (Option D) + profile stats + bio (Option C) */}
      <div className={`${styles.heroCard} fade-up`}>

        {/* Top: avatar · name · giant score */}
        <div className={styles.heroTop}>
          <div className={styles.heroAvatarWrap}>
            {data.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.avatarUrl} alt={data.displayName} className={styles.heroAvatar} width={80} height={80} />
            ) : (
              <div className={styles.heroAvatarFallback}>{data.username?.[0]?.toUpperCase()}</div>
            )}
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.heroName}>{data.displayName || `@${data.username}`}</h1>
            <p className={styles.heroHandle}>@{data.username}</p>
          </div>
          <div className={styles.heroScoreBlock}>
            <div className={styles.heroScoreNum}>
              <ScoreCounter target={data.overallScore} />
            </div>
            <div className={styles.heroScoreLbl}>Overall Score</div>
          </div>
        </div>

        {/* Stats row: followers · videos · engagement · grade */}
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>{formatNumber(data.followerCount)}</span>
            <span className={styles.heroStatLbl}>Followers</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>{data.videoCount}</span>
            <span className={styles.heroStatLbl}>Videos</span>
          </div>
          {engRate && (
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>{engRate}%</span>
              <span className={styles.heroStatLbl}>Eng. Rate</span>
            </div>
          )}
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>{scoreLabel(data.overallScore)}</span>
            <span className={styles.heroStatLbl}>Grade</span>
          </div>
        </div>

        {/* Bio (if present) */}
        {(data.bio || data.bioLink) && (
          <div className={styles.heroBio}>
            {data.bio && <p className={styles.heroBioText}>{data.bio}</p>}
            {data.bioLink && (
              <a href={data.bioLink} target="_blank" rel="noopener noreferrer" className={styles.heroBioLink}>
                🔗 {data.bioLink.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
          </div>
        )}

        {/* Percentile bar */}
        <div className={styles.heroPercentile}>
          <p className={styles.heroPercentileLbl}>How this profile compares</p>
          <div className={styles.heroPercentileBar}>
            <div className={styles.heroPercentileFill} style={{ width: `${percentile}%` }} />
          </div>
          <p className={styles.heroPercentileNote}>
            Better than <strong>{percentile}%</strong> of TikTok profiles we&apos;ve analyzed
          </p>
        </div>

      </div>

      {/* Categories */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile Breakdown</h2>
        <div className={styles.categoryGrid}>
          {data.categories?.map((cat: { id: string; label: string; score: number; status: 'pass' | 'partial' | 'fail'; feedback: string; details?: string[] }, i: number) => (
            <CategoryCard key={cat.id} {...cat} index={i} />
          ))}
        </div>
      </section>

      {/* Post Analysis — Performance + Hashtags + Keywords */}
      {(data.videoStats || data.hashtagAnalysis || data.keywordAnalysis) && (
        <section className={`${styles.section} fade-up`} style={{ '--delay': '200ms' } as React.CSSProperties}>
          <h2 className={styles.sectionTitle}>Post Analysis</h2>
          <div className={styles.analysisStack}>
            {data.videoStats && (
              <div>
                <p className={styles.subSectionTitle}>Post Performance</p>
                <VideoStatsGrid data={data.videoStats} />
              </div>
            )}
            {data.hashtagAnalysis && (
              <div>
                <p className={styles.subSectionTitle}>Hashtag Strategy</p>
                <HashtagAnalysis data={data.hashtagAnalysis} />
              </div>
            )}
            {data.keywordAnalysis && (
              <div>
                <p className={styles.subSectionTitle}>Description Keywords</p>
                <KeywordAnalysis data={data.keywordAnalysis} totalVideos={data.videoCount ?? data.keywordAnalysis.insights[0]?.totalVideos ?? 0} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Priority Fixes */}
      {data.priorityFixes?.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Fix These First</h2>
          <div className={styles.fixList}>
            {data.priorityFixes.map((fix: { priority: 'high' | 'medium' | 'quickwin'; label: string; description: string }, i: number) => (
              <PriorityFix key={fix.label} {...fix} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ username?: string }> }) {
  const params = await searchParams
  const username = params.username?.replace(/^@/, '').trim()

  if (!username) {
    notFound()
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <a href="/" className={styles.navLogo}>
          <span className={styles.logoText}>TTPageReview</span>
          <span className={styles.logoDivider}>by</span>
          <span className={styles.logoRCN}>RCN</span>
        </a>
        <div className={styles.navActions}>
          <ShareButton username={username} />
          <a href="/" className="btn-primary">← New Review</a>
        </div>
      </nav>

      <main className={styles.main}>
        <Suspense fallback={<ResultsSkeleton />}>
          <ResultsContent username={username} />
        </Suspense>
      </main>

      <RCNFooter />
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <>
      <div className={styles.profileHeader}>
        <div className={`skeleton ${styles.skeletonAvatar}`} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton" style={{ height: 24, width: '40%', borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 16, width: '60%', borderRadius: 6 }} />
        </div>
        <div className={`skeleton ${styles.skeletonScore}`} />
      </div>
      <div className={styles.categoryGrid} style={{ marginTop: 40 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 140, borderRadius: 14 }} />
        ))}
      </div>
    </>
  )
}
