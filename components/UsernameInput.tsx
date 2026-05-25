'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import styles from './UsernameInput.module.css'

export default function UsernameInput() {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const clean = value.replace(/^@/, '').trim()
    if (!clean) return
    setLoading(true)
    router.push(`/results?username=${encodeURIComponent(clean)}`)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputWrap}>
        <span className={styles.at}>@</span>
        <input
          className={styles.input}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="yourusername"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={loading}
        />
      </div>
      <button type="submit" className="btn-primary" disabled={loading || !value.trim()}>
        {loading ? 'Loading…' : 'Analyze →'}
      </button>
    </form>
  )
}
