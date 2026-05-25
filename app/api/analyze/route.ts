import { NextRequest, NextResponse } from 'next/server'
import { fetchProfile, fetchVideos } from '@/lib/tiktok'
import { scoreProfilePhoto } from '@/lib/vision'
import { computeScores } from '@/lib/scoring'

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username')?.replace(/^@/, '').trim()

  if (!username) {
    return NextResponse.json({ error: 'missing_username' }, { status: 400 })
  }

  try {
    const [profile, videos] = await Promise.all([
      fetchProfile(username),
      fetchVideos(username, 20),
    ])

    const photoScore = await scoreProfilePhoto(profile.avatarUrl)
    const scores = computeScores(profile, videos, photoScore)

    return NextResponse.json({
      username: profile.uniqueId,
      displayName: profile.nickname,
      avatarUrl: profile.avatarUrl,
      followerCount: profile.followerCount,
      videoCount: profile.videoCount,
      ...scores,
    })
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'user_not_found') {
      return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
    }
    console.error('Analyze error:', err)
    return NextResponse.json({ error: 'api_error' }, { status: 500 })
  }
}
