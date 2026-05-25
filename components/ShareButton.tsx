'use client'

import { useState } from 'react'
import styles from './ShareButton.module.css'

interface ShareButtonProps {
  username: string
}

export default function ShareButton({ username }: ShareButtonProps) {
  const [state, setState] = useState<'idle' | 'copied'>('idle')

  async function handleShare() {
    const url = `${window.location.origin}/results?username=${username}`
    const text = `Check out @${username}'s TikTok profile score on TTPageReview by RCN!`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'TTPageReview', text, url })
      } catch {
        // user cancelled share sheet — do nothing
      }
      return
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setState('copied')
      setTimeout(() => setState('idle'), 2000)
    } catch {
      // clipboard not available — silently fail
    }
  }

  return (
    <button
      className={`${styles.btn} ${state === 'copied' ? styles.copied : ''}`}
      onClick={handleShare}
      title="Share this report"
    >
      {state === 'copied' ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Share
        </>
      )}
    </button>
  )
}
