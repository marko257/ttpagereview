// lib/scoring.ts
import type { TikTokProfile, TikTokVideo } from './tiktok'
import { PHOTO_SCORE_UNANALYZED } from './vision'

export interface CategoryScore {
  id: string
  label: string
  score: number
  status: 'pass' | 'partial' | 'fail'
  feedback: string
  details?: string[]
}

function formatNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

export interface PriorityFix {
  priority: 'high' | 'medium' | 'quickwin'
  label: string
  description: string
}

export interface ScoreResult {
  overallScore: number
  categories: CategoryScore[]
  priorityFixes: PriorityFix[]
}

function statusFromScore(score: number): 'pass' | 'partial' | 'fail' {
  if (score >= 70) return 'pass'
  if (score >= 40) return 'partial'
  return 'fail'
}

function scoreUsername(username: string): CategoryScore {
  const len = username.length
  const numCount = (username.match(/\d/g) || []).length
  const underscoreCount = (username.match(/_/g) || []).length

  let score = 100
  if (len > 24) score = 20
  else if (len > 18) score = 40
  else if (len > 12) score = Math.min(score, 70)

  if (numCount >= 3) score = Math.min(score, 40)
  else if (numCount >= 1) score = Math.min(score, 70)

  if (underscoreCount >= 2) score = Math.min(score, 40)
  else if (underscoreCount >= 1) score = Math.min(score, 70)

  const feedbackMap: Record<string, string> = {
    pass: 'Clean and memorable username.',
    partial: 'Somewhat memorable but could be cleaner.',
    fail: username.length > 18 ? 'Too long — hard to remember and search.' : 'Too many numbers or symbols — reduces memorability.',
  }

  const status = statusFromScore(score)
  return {
    id: 'username',
    label: 'Username',
    score,
    status,
    feedback: feedbackMap[status],
    details: [
      `${username.length} characters`,
      numCount > 0 ? `${numCount} number${numCount > 1 ? 's' : ''} in name` : 'No numbers',
      underscoreCount > 0 ? `${underscoreCount} underscore${underscoreCount > 1 ? 's' : ''}` : 'No underscores',
    ],
  }
}

function scoreBio(profile: TikTokProfile): CategoryScore {
  const bio = profile.signature
  const hasLink = !!profile.bioLink
  const bioLen = bio.length
  const scheduleWords = ['stream', 'live', 'daily', 'weekly', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'pm', 'am', 'est', 'pst', 'cst']
  const hasSchedule = scheduleWords.some(w => bio.toLowerCase().includes(w))
  const hasCTA = bio.includes('!') || bio.toLowerCase().includes('follow') || bio.toLowerCase().includes('join') || bio.toLowerCase().includes('watch')

  let score = 20
  if (bioLen >= 10) score = 50
  if (bioLen >= 10 && (hasLink || hasCTA)) score = 70
  if (bioLen >= 10 && (hasLink || hasCTA) && hasSchedule) score = 100

  const feedbackMap: Record<string, string> = {
    pass: 'Great bio — clear, has a call-to-action, and a schedule.',
    partial: hasLink || hasCTA ? 'Good start. Adding a stream schedule would boost conversions.' : 'Has content but missing a clear CTA or link.',
    fail: 'Bio is empty or too short. This is prime real estate — use it.',
  }

  const status = statusFromScore(score)
  return {
    id: 'bio',
    label: 'Bio',
    score,
    status,
    feedback: feedbackMap[status],
    details: [
      bioLen === 0 ? 'Bio is empty' : `${bioLen} characters`,
      hasLink ? 'Link in bio ✓' : 'No link',
      hasSchedule ? 'Schedule mentioned ✓' : 'No schedule',
    ],
  }
}

function scoreVideoGrid(videos: TikTokVideo[]): CategoryScore {
  if (!videos.length) {
    return { id: 'videoGrid', label: 'Video Grid', score: 20, status: 'fail', feedback: 'No videos found. Post consistently to build your grid.', details: ['0 videos found', 'Need 2+ for analysis'] }
  }

  // Check cover art consistency (non-empty cover URLs distinct from origin)
  const hasCoverArt = videos.filter(v => v.cover && v.cover !== v.originCover).length / videos.length
  const coverScore = hasCoverArt > 0.8 ? 30 : hasCoverArt > 0.5 ? 20 : 0

  // Check niche consistency via hashtag overlap
  const allHashtags = videos.flatMap(v => v.hashtags)
  const hashtagCounts: Record<string, number> = {}
  allHashtags.forEach(h => { hashtagCounts[h] = (hashtagCounts[h] || 0) + 1 })
  const topHashtags = Object.entries(hashtagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topHashtagVideos = topHashtags.reduce((sum, [, count]) => sum + count, 0)
  const nicheConsistency = videos.length > 0 ? topHashtagVideos / (videos.length * 1.5) : 0
  const nicheScore = nicheConsistency > 0.6 ? 40 : nicheConsistency > 0.3 ? 25 : 0

  // Posting frequency (videos per week)
  if (videos.length >= 2) {
    const oldest = Math.min(...videos.map(v => v.createTime))
    const newest = Math.max(...videos.map(v => v.createTime))
    const weekSpan = (newest - oldest) / (7 * 24 * 60 * 60)
    const videosPerWeek = weekSpan > 0 ? videos.length / weekSpan : videos.length
    const freqScore = videosPerWeek >= 3 ? 30 : videosPerWeek >= 1 ? 20 : 10

    const total = Math.min(100, coverScore + nicheScore + freqScore)
    const status = statusFromScore(total)
    const feedbacks: Record<string, string> = {
      pass: 'Consistent grid with strong niche focus.',
      partial: nicheScore < 25 ? 'Content feels scattered — tighten your niche.' : 'Good posting but cover art is inconsistent.',
      fail: 'Grid lacks consistency in niche or posting frequency.',
    }
    const videosPerWeekDisplay = videosPerWeek.toFixed(1)
    return {
      id: 'videoGrid',
      label: 'Video Grid',
      score: total,
      status,
      feedback: feedbacks[status],
      details: [
        `${videosPerWeekDisplay} videos/week avg`,
        `${Math.round(hasCoverArt * 100)}% have cover art`,
        topHashtags.length > 0 ? `Top tag: #${topHashtags[0][0]}` : 'No hashtags found',
      ],
    }
  }

  return { id: 'videoGrid', label: 'Video Grid', score: 20, status: 'fail', feedback: 'Not enough videos to evaluate grid consistency.', details: [`${videos.length} videos found`, 'Need 2+ for analysis'] }
}

function scoreEngagement(videos: TikTokVideo[]): CategoryScore {
  if (!videos.length) {
    return { id: 'engagementRate', label: 'Engagement Rate', score: 20, status: 'fail', feedback: 'No video data available to calculate engagement.' }
  }

  const filtered = videos.filter(v => v.stats.playCount > 0)

  if (!filtered.length) {
    return { id: 'engagementRate', label: 'Engagement Rate', score: 30, status: 'fail', feedback: 'Could not calculate engagement rate from available data.' }
  }

  const rates = filtered.map(v => (v.stats.likeCount + v.stats.commentCount) / v.stats.playCount)
  const avgViews = Math.round(filtered.reduce((s, v) => s + v.stats.playCount, 0) / filtered.length)
  const avgLikes = Math.round(filtered.reduce((s, v) => s + v.stats.likeCount, 0) / filtered.length)

  const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length
  const pct = avgRate * 100

  let score = 20
  if (pct >= 8) score = 100
  else if (pct >= 5) score = 80
  else if (pct >= 3) score = 60
  else if (pct >= 1) score = 40

  const rateDisplay = pct.toFixed(1) + '%'
  const status = statusFromScore(score)
  const feedbacks: Record<string, string> = {
    pass: `Strong ${rateDisplay} engagement — your audience is active.`,
    partial: `${rateDisplay} engagement — decent but room to grow.`,
    fail: `${rateDisplay} engagement is below average. Focus on hooks and CTAs.`,
  }

  return {
    id: 'engagementRate',
    label: 'Engagement Rate',
    score,
    status,
    feedback: feedbacks[status],
    details: [
      `Avg ${formatNum(avgViews)} views/video`,
      `Avg ${formatNum(avgLikes)} likes/video`,
      `Based on ${filtered.length} videos`,
    ],
  }
}

function scorePostingConsistency(videos: TikTokVideo[]): CategoryScore {
  if (videos.length < 3) {
    return { id: 'postingConsistency', label: 'Posting Consistency', score: 20, status: 'fail', feedback: 'Not enough videos to evaluate posting frequency.' }
  }

  const nowSec = Date.now() / 1000
  const timestamps = videos.map(v => v.createTime).filter(t => t > 0).sort((a, b) => b - a)

  if (timestamps.length < 3) {
    return { id: 'postingConsistency', label: 'Posting Consistency', score: 20, status: 'fail', feedback: 'Not enough timestamp data to evaluate posting frequency.' }
  }

  // How long since the last post (days)
  const daysSinceLastPost = (nowSec - timestamps[0]) / (24 * 60 * 60)

  // Average gap between posts (days)
  const gaps: number[] = []
  for (let i = 0; i < timestamps.length - 1; i++) {
    gaps.push((timestamps[i] - timestamps[i + 1]) / (24 * 60 * 60))
  }
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length

  // Base score from average gap
  let score = 10
  if (avgGap <= 3) score = 100
  else if (avgGap <= 7) score = 75
  else if (avgGap <= 14) score = 50
  else if (avgGap <= 30) score = 25

  // Penalize heavily if last post was recent — inactive period overrides historic pattern
  if (daysSinceLastPost > 60) score = Math.min(score, 10)
  else if (daysSinceLastPost > 30) score = Math.min(score, 20)
  else if (daysSinceLastPost > 14) score = Math.min(score, 40)

  const status = statusFromScore(score)

  // Build feedback that reflects both recency and cadence
  let feedback: string
  if (daysSinceLastPost > 30) {
    feedback = `Last post was ${Math.round(daysSinceLastPost)} days ago. Going dark kills algorithm momentum.`
  } else if (score >= 70) {
    feedback = `Posting every ${avgGap.toFixed(0)} days — algorithm-friendly consistency.`
  } else if (score >= 40) {
    feedback = `Posting every ${avgGap.toFixed(0)} days on average. Aim for every 2–3 days.`
  } else {
    feedback = `Posting every ${avgGap.toFixed(0)} days on average. The algorithm rewards daily creators.`
  }

  const lastPostText = daysSinceLastPost < 1
    ? 'Last post: today'
    : daysSinceLastPost < 2
      ? 'Last post: yesterday'
      : `Last post: ${Math.round(daysSinceLastPost)}d ago`

  return {
    id: 'postingConsistency',
    label: 'Posting Consistency',
    score,
    status,
    feedback,
    details: [
      lastPostText,
      `Avg gap: ${avgGap.toFixed(1)} days`,
      `${timestamps.length} videos analyzed`,
    ],
  }
}

export function computeScores(
  profile: TikTokProfile,
  videos: TikTokVideo[],
  photoScore: number
): ScoreResult {
  const weights: Record<string, number> = {
    profilePhoto: 0.20,
    username: 0.15,
    bio: 0.20,
    videoGrid: 0.20,
    engagementRate: 0.15,
    postingConsistency: 0.10,
  }

  // -1 = no API key set, can't analyze — show neutral score/feedback, don't penalize
  const isUnanalyzed = photoScore === PHOTO_SCORE_UNANALYZED
  const effectivePhotoScore = isUnanalyzed ? 70 : photoScore
  const photoFeedback = isUnanalyzed
    ? 'Photo analysis requires an OpenAI API key. Score estimated based on profile presence.'
    : effectivePhotoScore >= 70
      ? 'Great — your face is front and center.'
      : effectivePhotoScore >= 40
        ? 'Face partially visible. Get closer and more centered.'
        : 'No face detected. Creators with face photos get 3x more followers.'
  const photoCategory: CategoryScore = {
    id: 'profilePhoto',
    label: 'Profile Photo',
    score: effectivePhotoScore,
    status: statusFromScore(effectivePhotoScore),
    feedback: photoFeedback,
    details: isUnanalyzed
      ? ['Estimated — add OpenAI key for AI analysis']
      : effectivePhotoScore >= 70
        ? ['Face detected ✓', 'AI-analyzed']
        : effectivePhotoScore >= 40
          ? ['Partial face detected', 'AI-analyzed']
          : ['No face detected', 'AI-analyzed'],
  }

  const categories: CategoryScore[] = [
    photoCategory,
    scoreUsername(profile.uniqueId),
    scoreBio(profile),
    scoreVideoGrid(videos),
    scoreEngagement(videos),
    scorePostingConsistency(videos),
  ]

  const overallScore = Math.round(
    categories.reduce((sum, cat) => {
      const weight = weights[cat.id] || 0
      return sum + cat.score * weight
    }, 0)
  )

  // Generate priority fixes from worst categories
  const sorted = [...categories].sort((a, b) => a.score - b.score)

  const fixDescriptions: Record<string, Record<string, string>> = {
    profilePhoto: {
      fail: "Switch to a clear face photo. Creators with real faces get significantly more follows from profile visits.",
      partial: "Move closer to camera and ensure your face fills most of the frame.",
    },
    username: {
      fail: "Consider simplifying your username — remove numbers and keep it under 15 characters.",
      partial: "Clean up any numbers or underscores to make your name more searchable.",
    },
    bio: {
      fail: "Your bio is empty — add what you do, when you stream, and a link. Don't waste this space.",
      partial: "Add your streaming schedule to your bio so followers know when to tune in.",
    },
    videoGrid: {
      fail: "Post more consistently and stick to one niche. A scattered grid confuses the algorithm.",
      partial: "Add custom cover art to your videos — it makes your grid look intentional.",
    },
    engagementRate: {
      fail: "Add a strong hook in the first 2 seconds of every video to keep viewers watching.",
      partial: "Ask a direct question in your videos to boost comments and engagement.",
    },
    postingConsistency: {
      fail: "Post at least every 2–3 days. Inconsistent creators fall out of the algorithm quickly.",
      partial: "Tighten your posting schedule — even 4x/week is enough to stay visible.",
    },
  }

  const priorityFixes: PriorityFix[] = []
  const priorities: Array<'high' | 'medium' | 'quickwin'> = ['high', 'medium', 'quickwin']

  sorted.slice(0, 3).forEach((cat, i) => {
    const level = cat.score < 40 ? 'fail' : 'partial'
    const desc = fixDescriptions[cat.id]?.[level]
    if (desc) {
      priorityFixes.push({
        priority: priorities[i],
        label: cat.label,
        description: desc,
      })
    }
  })

  return { overallScore, categories, priorityFixes }
}
