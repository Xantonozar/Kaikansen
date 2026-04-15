'use client'

import { useCallback, useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Play, Pause, Download, AlertTriangle, X } from 'lucide-react'

interface VideoSource {
  resolution: number
  url: string
  tags?: string[]
}

interface VideoPlayerProps {
  videoSources: VideoSource[]
  audioUrl?: string | null
  poster?: string | null
  mode: 'watch' | 'listen'
  onModeChange?: (mode: 'watch' | 'listen') => void
  onEnded?: () => void
}

function handleDownload(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Lazy load Vidstack player
const LazyVidstackPlayer = lazy(() => import('./VidstackPlayerInternal').then(m => ({ default: m.VidstackPlayerInternal })))

export function VideoPlayer({ videoSources, audioUrl, poster, mode, onEnded }: VideoPlayerProps) {
  const hasVideos = videoSources.length > 0

  const sortedSources = [...videoSources].sort((a, b) => a.resolution - b.resolution)
  const currentSource = sortedSources[0]

  if (!hasVideos) {
    return (
      <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-bg-elevated">
        {poster && (
          <img src={poster} alt="Video poster" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm font-body text-ktext-tertiary">No video available</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    }>
      <LazyVidstackPlayer 
        source={currentSource}
        audioUrl={audioUrl}
        poster={poster}
        mode={mode}
        onEnded={onEnded}
      />
    </Suspense>
  )
}