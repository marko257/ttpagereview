// lib/tiktok.ts
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!
const RAPIDAPI_HOST = 'tiktok-api23.p.rapidapi.com'

const headers = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST,
}

export interface TikTokProfile {
  uniqueId: string
  nickname: string
  avatarUrl: string
  followerCount: number
  videoCount: number
  bioLink: string
  signature: string // bio text
}

export interface TikTokVideo {
  id: string
  desc: string
  createTime: number
  stats: {
    playCount: number
    likeCount: number
    commentCount: number
    shareCount: number
  }
  video: {
    cover: string
    originCover: string
  }
  textExtra: Array<{ hashtagName: string }>
}

export async function fetchProfile(username: string): Promise<TikTokProfile> {
  const url = `https://${RAPIDAPI_HOST}/api/user/info?uniqueId=${encodeURIComponent(username)}`
  const res = await fetch(url, { headers, next: { revalidate: 60 } })

  if (!res.ok) {
    if (res.status === 404) throw new Error('user_not_found')
    throw new Error('api_error')
  }

  const data = await res.json()

  // Handle different response shapes from the API
  const user = data?.userInfo?.user || data?.data?.user || data?.user
  const stats = data?.userInfo?.stats || data?.data?.stats || data?.stats

  if (!user) throw new Error('user_not_found')

  return {
    uniqueId: user.uniqueId,
    nickname: user.nickname,
    avatarUrl: user.avatarMedium || user.avatarThumb || user.avatarLarger,
    followerCount: stats?.followerCount || 0,
    videoCount: stats?.videoCount || 0,
    bioLink: user.bioLink?.link || '',
    signature: user.signature || '',
  }
}

export async function fetchVideos(username: string, count = 20): Promise<TikTokVideo[]> {
  const url = `https://${RAPIDAPI_HOST}/api/user/posts?uniqueId=${encodeURIComponent(username)}&count=${count}`
  const res = await fetch(url, { headers, next: { revalidate: 60 } })

  if (!res.ok) return []

  const data = await res.json()
  const items = data?.data?.itemList || data?.itemList || data?.data || []

  return Array.isArray(items) ? items.slice(0, count).map((item: any) => ({
    id: item.id,
    desc: item.desc || '',
    createTime: item.createTime,
    stats: {
      playCount: item.stats?.playCount || 0,
      likeCount: item.stats?.diggCount || item.stats?.likeCount || 0,
      commentCount: item.stats?.commentCount || 0,
      shareCount: item.stats?.shareCount || 0,
    },
    video: {
      cover: item.video?.cover || '',
      originCover: item.video?.originCover || '',
    },
    textExtra: item.textExtra || [],
  })) : []
}
