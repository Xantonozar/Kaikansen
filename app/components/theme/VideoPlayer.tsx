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
  const [error, setError] = useState<string | null>(null)
  const [player, setPlayer] = useState<Plyr | null>(null)

  useEffect(() => {
    if (!videoRef.current) return

    if (mode === 'watch' && videoSources.length > 0) {
      try {
        const sortedSources = [...videoSources].sort((a, b) => b.resolution - a.resolution)
        
        const newPlayer = new Plyr(videoRef.current, {
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'mute',
            'volume',
            'settings',
            'pip',
            'fullscreen',
          ],
          autoplay: false,
        })

        setPlayer(newPlayer)
        setError(null)

        return () => {
          newPlayer.destroy()
          setPlayer(null)
        }
      } catch (err) {
        console.error('Plyr init error:', err)
        setError('Failed to initialize video player')
      }
    }
  }, [videoSources, mode])

  const handlePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  const hasVideos = videoSources.length > 0

  return (
    <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-bg-elevated">
      {mode === 'watch' ? (
        hasVideos ? (
          <video
            ref={videoRef}
            playsInline
            poster={poster || undefined}
            className="w-full h-full object-cover"
            onPlay={handlePlay}
            onError={(e) => {
              console.error('Video error:', e)
              setError('Failed to load video')
            }}
          >
            {videoSources
              .sort((a, b) => b.resolution - a.resolution)
              .map((source) => (
                <source
                  key={source.resolution}
                  src={source.url}
                  type="video/webm"
                />
              ))}
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-elevated">
            {poster && (
              <img 
                src={poster} 
                alt="Video poster" 
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
            )}
            <div className="relative z-10 text-center p-4">
              <p className="text-sm font-body text-ktext-tertiary">No video available</p>
            </div>
          </div>
        )
      ) : (
        /* Listen mode visualizer */
        <div className="absolute inset-0 flex items-center justify-center bg-bg-surface">
          <div className="flex items-end gap-1 h-12">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-accent-mint rounded-full animate-pulse"
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