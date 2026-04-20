'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/next'

export default function AnalyticsWrapper() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    // ?block_analytics=1 でアクセスするとこのデバイスの計測をオフにする
    const params = new URLSearchParams(window.location.search)
    if (params.get('block_analytics') === '1') {
      localStorage.setItem('block_analytics', 'true')
    }
    if (!localStorage.getItem('block_analytics')) {
      setEnabled(true)
    }
  }, [])

  return enabled ? <Analytics /> : null
}
