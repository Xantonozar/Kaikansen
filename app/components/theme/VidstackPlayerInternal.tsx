'use client'

import { useCallback, useState, useEffect, useRef } from 'react'
import { 
  MediaPlayer, 
  MediaPoster,
  MediaPlayButton,
  MediaMuteButton,
  MediaFullscreenButton,
  MediaTimeSlider,
  MediaVolumeSlider,
  MediaBufferingIndicator,
  MediaCommunitySkin
} from '@vidstack/react'

interface VideoSource {
  resolution: number
  url: string
  tags?: string[]
}

interface VidstackPlayerProps {
  source: VideoSource
  poster?: string | null
  mode: 'watch' | 'listen'
  onEnded?: () => void
}

export function VidstackPlayerInternal({ source, poster, mode, onEnded }: VidstackPlayerProps) {
  const playerRef = useRef<any>(null)

  const handleEnded = useCallback(() => {
    if (onEnded) onEnded()
  }, [onEnded])

  const handlePlay = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.play()
    }
  }, [])

  const handlePause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause()
    }
  }, [])

  if (mode === 'listen') {
    return (
      <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-black">
        {poster && (
          <img src={poster} alt="Album cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
          <MediaPlayer
            ref={playerRef}
            src={source?.url}
            logLevel="warn"
            onEnded={handleEnded}
            preload="auto"
            playsInline
            controls
          >
            <MediaCommunitySkin />
          </MediaPlayer>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-black">
      <MediaPlayer
        ref={playerRef}
        src={source?.url}
        poster={poster || undefined}
        logLevel="warn"
        onEnded={handleEnded}
        preload="auto"
        playsInline
        controls
      >
        <MediaPoster />
        <MediaCommunitySkin />
        
        <MediaBufferingIndicator 
          stallClass="absolute inset-0 flex items-center justify-center bg-black/30"
          waitingClass="absolute inset-0 flex items-center justify-center"
        />
      </MediaPlayer>
    </div>
  )
}
