// lib/tiktok.ts
// API: tiktok-scraper7.p.rapidapi.com
// /user/info?unique_id=  → { code, data: { user: {...}, stats: {...} } }
// /user/posts?unique_id=&count= → { code, data: { videos: [...], cursor, hasMore } }

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!
const RAPIDAPI_HOST = 'tiktok-scraper7.p.rapidapi.com'

function getHeaders() {
  return {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
  }
}

export interface TikTokProfile {
  uniqueId: string
  nickname: string
  avatarUrl: string
  followerCount: number
  videoCount: number
  bioLink: string
  signature: string
}

export interface TikTokVideo {
  id: string
  desc: string
  createTime: number
  isTop: boolean
  stats: {
    playCount: number
    likeCount: number
    commentCount: number
    shareCount: number
    collectCount: number
  }
  cover: string
  originCover: string
  hashtags: string[]
}

export async function fetchProfile(username: string): Promise<TikTokProfile> {
  const url = `https://${RAPIDAPI_HOST}/user/info?unique_id=${encodeURIComponent(username)}`
  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 60 } })

  if (!res.ok) {
    if (res.status === 404) throw new Error('user_not_found')
    throw new Error('api_error')
  }

  const data = await res.json()

  if (data.code !== 0) throw new Error('user_not_found')

  const user = data.data?.user
  const stats = data.data?.stats

  if (!user) throw new Error('user_not_found')

  return {
    uniqueId: user.uniqueId,
    nickname: user.nickname,
    avatarUrl: user.avatarMedium || user.avatarThumb || user.avatarLarger || '',
    followerCount: stats?.followerCount || 0,
    videoCount: stats?.videoCount || 0,
    bioLink: user.bioLink?.link || '',
    signature: user.signature || '',
  }
}

export async function fetchVideos(username: string, count = 20): Promise<TikTokVideo[]> {
  const url = `https://${RAPIDAPI_HOST}/user/posts?unique_id=${encodeURIComponent(username)}&count=${count}`
  const res = await fetch(url, { headers: getHeaders(), next: { revalidate: 60 } })

  if (!res.ok) return []

  const data = await res.json()
  const videos: unknown[] = data?.data?.videos || []

  if (!Array.isArray(videos)) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return videos.slice(0, count).map((v: any) => {
    // Extract hashtags from title string (e.g. "#fyp #gaming")
    const hashtags: string[] = []
    const title: string = v.title || v.content_desc || ''
    const matches = title.match(/#\w+/g)
    if (matches) hashtags.push(...matches.map((t: string) => t.slice(1).toLowerCase()))

    return {
      id: v.aweme_id || v.video_id || '',
      desc: title,
      createTime: v.create_time || 0,
      isTop: v.is_top === 1 || v.is_top === true,
      stats: {
        playCount: v.play_count || 0,
        likeCount: v.digg_count || 0,
        commentCount: v.comment_count || 0,
        shareCount: v.share_count || 0,
        collectCount: v.collect_count || v.saved_count || 0,
      },
      cover: v.cover || v.origin_cover || '',
      originCover: v.origin_cover || '',
      hashtags,
    }
  })
}
