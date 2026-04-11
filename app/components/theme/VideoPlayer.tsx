'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, Settings } from 'lucide-react'

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
  const [isLoading, setIsLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  
  // Quality selector state
  const [currentQuality, setCurrentQuality] = useState<number>(0)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  
  // Hover state for pause button
  const [isHoveringCenter, setIsHoveringCenter] = useState(false)

  const hasVideos = videoSources.length > 0
  
  // Get unique qualities sorted by resolution (highest first)
  const qualities = [...new Set(videoSources.map(v => v.resolution))].sort((a, b) => b - a)

  useEffect(() => {
    // Set default quality to highest available
    if (qualities.length > 0 && currentQuality === 0) {
      setCurrentQuality(qualities[0])
    }
  }, [qualities, currentQuality])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    const handleWaiting = () => {
      setIsLoading(true)
    }

    const handlePlaying = () => {
      setIsLoading(false)
      setIsPlaying(true)
      setIsPaused(false)
    }

    const handlePause = () => {
      setIsPaused(true)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleEnded = () => {
      setIsPaused(true)
      setIsPlaying(false)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('playing', handlePlaying)
    video.addEventListener('pause', handlePause)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Update video source when quality changes
  useEffect(() => {
    const video = videoRef.current
    if (!video || currentQuality === 0) return

    const selectedSource = videoSources.find(s => s.resolution === currentQuality)
    if (selectedSource) {
      video.src = selectedSource.url
      video.load()
    }
  }, [currentQuality, videoSources])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPaused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.muted = false
      setIsMuted(false)
    } else {
      video.muted = true
      setIsMuted(true)
    }
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const time = parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (time: number) => {
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
        >
          {videoSources.map((source) => (
            <source key={source.resolution} src={source.url} type="video/webm" />
          ))}
        </video>

        {/* Background Cover Image - full opacity but video plays audio */}
        {poster && (
          <img src={poster} alt="Album cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
          {/* Mini Audio Player */}
          <div className="relative z-10">
            {/* Play/Pause Button - Large */}
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
            <div className="relative w-64 h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer">
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
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false)
        setIsHoveringCenter(false)
        setShowQualityMenu(false)
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster || undefined}
        playsInline
      >
        {videoSources.map((source) => (
          <source key={source.resolution} src={source.url} type="video/webm" />
        ))}
      </video>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Center Overlay - Play/Pause */}
      {isPaused && !isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={togglePlay}
          onMouseEnter={() => setIsHoveringCenter(true)}
          onMouseLeave={() => setIsHoveringCenter(false)}
        >
          {isHoveringCenter ? (
            <div className="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-all hover:scale-110">
              <Pause className="w-10 h-10 text-white fill-white" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-all hover:scale-110">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          )}
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 transition-opacity duration-300 ${showControls || isPaused ? 'opacity-100' : 'opacity-0'} z-30`}>
        {/* Progress Bar */}
        <div className="relative w-full h-1 bg-white/30 rounded-full mb-2 cursor-pointer group">
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

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-accent transition-colors">
              {isPaused ? <Play className="w-6 h-6 fill-white" /> : <Pause className="w-6 h-6 fill-white" />}
            </button>
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quality Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="text-white hover:text-accent transition-colors flex items-center gap-1 text-sm font-mono"
              >
                <Settings className="w-4 h-4" />
                {currentQuality}p
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg overflow-hidden min-w-[100px]">
                  <div className="text-xs text-white/60 px-3 py-1 bg-black/50">Quality</div>
                  {qualities.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setCurrentQuality(q)
                        setShowQualityMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors ${
                        q === currentQuality 
                          ? 'bg-accent text-white' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {q}p {q === Math.max(...qualities) && '(Best)'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={toggleMute} className="text-white hover:text-accent transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button onClick={toggleFullscreen} className="text-white hover:text-accent transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}