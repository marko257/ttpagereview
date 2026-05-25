// lib/scoring.ts
import type { TikTokProfile, TikTokVideo } from './tiktok'

export interface CategoryScore {
  id: string
  label: string
  score: number
  status: 'pass' | 'partial' | 'fail'
  feedback: string
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
  return { id: 'username', label: 'Username', score, status, feedback: feedbackMap[status] }
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
  return { id: 'bio', label: 'Bio', score, status, feedback: feedbackMap[status] }
}

function scoreVideoGrid(videos: TikTokVideo[]): CategoryScore {
  if (!videos.length) {
    return { id: 'videoGrid', label: 'Video Grid', score: 20, status: 'fail', feedback: 'No videos found. Post consistently to build your grid.' }
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
    return { id: 'videoGrid', label: 'Video Grid', score: total, status, feedback: feedbacks[status] }
  }

  return { id: 'videoGrid', label: 'Video Grid', score: 20, status: 'fail', feedback: 'Not enough videos to evaluate grid consistency.' }
}

function scoreEngagement(videos: TikTokVideo[]): CategoryScore {
  if (!videos.length) {
    return { id: 'engagementRate', label: 'Engagement Rate', score: 20, status: 'fail', feedback: 'No video data available to calculate engagement.' }
  }

  const rates = videos
    .filter(v => v.stats.playCount > 0)
    .map(v => (v.stats.likeCount + v.stats.commentCount) / v.stats.playCount)

  if (!rates.length) {
    return { id: 'engagementRate', label: 'Engagement Rate', score: 30, status: 'fail', feedback: 'Could not calculate engagement rate from available data.' }
  }

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

  return { id: 'engagementRate', label: 'Engagement Rate', score, status, feedback: feedbacks[status] }
}

function scorePostingConsistency(videos: TikTokVideo[]): CategoryScore {
  if (videos.length < 3) {
    return { id: 'postingConsistency', label: 'Posting Consistency', score: 20, status: 'fail', feedback: 'Not enough videos to evaluate posting frequency.' }
  }

  const timestamps = videos.map(v => v.createTime).sort((a, b) => b - a)
  const gaps: number[] = []
  for (let i = 0; i < timestamps.length - 1; i++) {
    gaps.push((timestamps[i] - timestamps[i + 1]) / (24 * 60 * 60))
  }

  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length

  let score = 10
  if (avgGap <= 3) score = 100
  else if (avgGap <= 7) score = 75
  else if (avgGap <= 14) score = 50
  else if (avgGap <= 30) score = 25

  const status = statusFromScore(score)
  const feedbacks: Record<string, string> = {
    pass: `Posting every ${avgGap.toFixed(0)} days — algorithm-friendly consistency.`,
    partial: `Posting every ${avgGap.toFixed(0)} days. Aim for every 2–3 days.`,
    fail: `${avgGap.toFixed(0)}-day gaps between posts. The algorithm rewards daily creators.`,
  }

  return { id: 'postingConsistency', label: 'Posting Consistency', score, status, feedback: feedbacks[status] }
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

  const photoFeedback = photoScore >= 70 ? 'Great — your face is front and center.' : photoScore >= 40 ? 'Face partially visible. Get closer and more centered.' : 'No face detected. Creators with face photos get 3x more followers.'
  const photoCategory: CategoryScore = {
    id: 'profilePhoto',
    label: 'Profile Photo',
    score: photoScore,
    status: statusFromScore(photoScore),
    feedback: photoFeedback,
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
