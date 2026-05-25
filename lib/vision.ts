// lib/vision.ts
import OpenAI from 'openai'

// Returned when we can't analyze the photo — neutral, no penalizing feedback
export const PHOTO_SCORE_UNANALYZED = -1

export async function scoreProfilePhoto(imageUrl: string): Promise<number> {
  if (!process.env.OPENAI_API_KEY || !imageUrl) return PHOTO_SCORE_UNANALYZED
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'low' },
            },
            {
              type: 'text',
              text: 'This is a TikTok profile photo. Rate it 0-100 for how effective it is as a creator profile photo. 100 = real human face, clearly visible, well-lit, close-up, engaging expression. 70 = face visible but somewhat small, obscured, or low quality. 40 = no face but a person\'s body or silhouette. 10 = logo, text, AI art, cartoon, or no person. Respond with ONLY a number 0-100.',
            },
          ],
        },
      ],
      max_tokens: 5,
    })

    const text = response.choices[0]?.message?.content?.trim() || '50'
    const score = parseInt(text, 10)
    return isNaN(score) ? PHOTO_SCORE_UNANALYZED : Math.max(0, Math.min(100, score))
  } catch {
    return PHOTO_SCORE_UNANALYZED
  }
}
