'use client'

import { useCallback, useState, useRef } from 'react'
import { 
  MediaPlayer, 
  MediaPoster,
  MediaPlayButton,
  MediaMuteButton,
  MediaFullscreenButton,
  MediaTimeSlider,
  MediaVolumeSlider,
  MediaBufferingIndicator
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
  const handleEnded = useCallback(() => {
    if (onEnded) onEnded()
  }, [onEnded])

  if (mode === 'listen') {
    return (
      <div className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-black">
        {poster && (
          <img src={poster} alt="Album cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
          <MediaPlayer
            src={source?.url}
            logLevel="warn"
            onEnded={handleEnded}
            preload="auto"
            playsInline
          >
            <MediaBufferingIndicator 
              className="absolute inset-0 flex items-center justify-center"
            />
            <MediaPlayButton className="vidstack-play-button" />
            <MediaMuteButton className="vidstack-control-button" />
            <MediaVolumeSlider className="vidstack-slider" />
            <MediaFullscreenButton className="vidstack-control-button" />
          </MediaPlayer>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-black">
      <MediaPlayer
        src={source?.url}
        poster={poster || undefined}
        logLevel="warn"
        onEnded={handleEnded}
        preload="auto"
        playsInline
      >
        <MediaPoster />
        <MediaBufferingIndicator 
          className="absolute inset-0 flex items-center justify-center"
        />
        <MediaPlayButton className="vidstack-play-button" />
        <MediaMuteButton className="vidstack-control-button" />
        <MediaFullscreenButton className="vidstack-control-button" />
        <MediaTimeSlider className="vidstack-slider" />
        <MediaVolumeSlider className="vidstack-slider" />
      </MediaPlayer>
    </div>
  )
}
