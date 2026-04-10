'use client'

import { useRef, useEffect, useState } from 'react'
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'

interface VideoSource {
  resolution: number
  url: string
  tags?: string[]
}

interface VideoPlayerProps {
  videoSources: VideoSource[]
  poster?: string | null
  mode: 'watch' | 'listen'
  onModeChange?: (mode: 'watch' | 'listen') => void
}

export function VideoPlayer({ videoSources, poster, mode }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (videoRef.current && videoSources.length > 0 && mode === 'watch') {
      const sortedSources = [...videoSources].sort((a, b) => b.resolution - a.resolution)
      
      const player = new Plyr(videoRef.current, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen',
        ],
        autoplay: false,
      })

      return () => {
        player.destroy()
      }
    }
  }, [videoSources, mode])

  const handlePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  return (
    <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-bg-elevated">
      {mode === 'watch' ? (
        <video
          ref={videoRef}
          playsInline
          poster={poster || undefined}
          className="w-full h-full object-cover"
          onPlay={handlePlay}
        >
          {videoSources
            .sort((a, b) => b.resolution - a.resolution)
            .map((source) => (
              <source
                key={source.resolution}
                src={source.url}
                type="video/webm"
                data-resolution={source.resolution}
              />
            ))}
        </video>
      ) : (
        /* Listen mode visualizer */
        <div className="absolute inset-0 flex items-center justify-center bg-bg-surface">
          <div className="flex items-end gap-1 h-12">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 bg-accent-mint rounded-full eq-bar-${i + 1} animate-pulse`}
                style={{
                  height: `${20 + Math.random() * 30}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}