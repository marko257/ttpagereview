'use client'
import { useEffect } from 'react'

export default function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.fade-up')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.animationPlayState = 'running'
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '-60px' }
    )
    els.forEach(el => {
      (el as HTMLElement).style.animationPlayState = 'paused'
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])
  return null
}
