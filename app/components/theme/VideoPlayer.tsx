'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Pause } from 'lucide-react'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  const hasVideos = videoSources.length > 0

  // Sort sources by resolution (highest first) - default to 720p for performance
  const sortedSources = [...videoSources].sort((a, b) => b.resolution - a.resolution)
  
  // Default to 720p for faster loading
  const defaultQuality = 720
  const availableQuality = sortedSources.find(s => s.resolution <= defaultQuality)?.resolution || sortedSources[0]?.resolution
  const currentSource = sortedSources.find(s => s.resolution === availableQuality) || sortedSources[0]

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleCanPlay = () => {
      // Video is ready
    }

    const handleWaiting = () => {
      // Buffering
    }

    const handlePlaying = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    const handlePause = () => {
      setIsPaused(true)
      setIsPlaying(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleEnded = () => {
      setIsPaused(true)
      setIsPlaying(false)
    }

    const handleProgress = () => {
      // Buffer progress if needed
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('pause', handlePause)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('progress', handleProgress)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('progress', handleProgress)
    }
  }, [])

  // Preload video when component mounts
  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentSource) return

    // Set preload to auto for faster initial load
    video.preload = 'auto'
  }, [currentSource])

  // Reset when mode changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    
    video.pause()
    video.currentTime = 0
    setIsPaused(true)
    setIsPlaying(false)
  }, [mode])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const time = parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      container.requestFullscreen()
    }
  }

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // === NO VIDEOS ===
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

  // === LISTEN MODE ===
  if (mode === 'listen') {
    return (
      <div 
        ref={containerRef}
        className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-black"
      >
        {/* Hidden Video Element - plays audio */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          preload="auto"
        >
          {currentSource && (
            <source key={currentSource.resolution} src={currentSource.url} type="video/webm" />
          )}
        </video>

        {/* Background Cover Image */}
        {poster && (
          <img src={poster} alt="Album cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
          <div className="relative z-10">
            {/* Play/Pause Button */}
            <button 
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-accent flex items-center justify-center hover:bg-accent-hover transition-all mx-auto mb-6 shadow-lg"
            >
              {isPaused ? (
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              ) : (
                <Pause className="w-10 h-10 text-white fill-white" />
              )}
            </button>

            {/* Progress Bar */}
            <div className="relative w-64 h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer group">
              <div 
                className="absolute h-full bg-accent rounded-full"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-between text-white text-sm font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // === WATCH MODE ===
  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-black"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="auto"
        poster={poster || undefined}
      >
        {currentSource && (
          <source key={currentSource.resolution} src={currentSource.url} type="video/webm" />
        )}
      </video>

      {/* Center Play Button Overlay */}
      {isPaused && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-all hover:scale-110">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
        {/* Progress Bar */}
        <div className="relative w-full h-1 bg-white/30 rounded-full mb-2 cursor-pointer">
          <div 
            className="absolute h-full bg-accent rounded-full"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-accent">
              {isPaused ? (
                <Play className="w-6 h-6 fill-white" />
              ) : (
                <span className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}
            </button>
            {isPaused && (
              <span className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white text-xs font-mono">{availableQuality}p</span>
            <button onClick={toggleMute} className="text-white hover:text-accent">
              {isMuted ? (
                <span className="text-xs">🔇</span>
              ) : (
                <span className="text-xs">🔊</span>
              )}
            </button>
            <button onClick={toggleFullscreen} className="text-white hover:text-accent">
              <span className="text-xs">⛶</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}