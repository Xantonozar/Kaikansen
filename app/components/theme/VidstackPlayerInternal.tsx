'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

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
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const hideControlsTimeout = useRef<NodeJS.Timeout>()

  const handleEnded = useCallback(() => {
    if (onEnded) onEnded()
  }, [onEnded])

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return
    
    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (e) {
      console.error('Fullscreen error:', e)
    }
  }, [isFullscreen])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }, [])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = percent * duration
  }, [duration])

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current)
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }, [isPlaying])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => setShowControls(false), 3000)
    } else {
      setShowControls(true)
    }
    return () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current)
    }
  }, [isPlaying])

  if (mode === 'listen') {
    return (
      <div className="relative w-full aspect-square rounded-[20px] overflow-hidden bg-black">
        {poster && (
          <img src={poster} alt="Album cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <video
          ref={videoRef}
          src={source?.url}
          className="absolute inset-0 w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          playsInline
        />
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
          onClick={togglePlay}
        >
          {!isPlaying && (
            <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          )}
        </div>
        <div className={`absolute bottom-4 left-4 right-4 flex items-center gap-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
            {isPlaying ? <Pause className="w-5 h-5 text-white" fill="white" /> : <Play className="w-5 h-5 text-white" fill="white" />}
          </button>
          <button onClick={toggleMute} className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
            {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
            <div className="h-full bg-red-500" style={{ width: `${(currentTime / duration) * 100}%` }} />
          </div>
          <span className="text-white text-sm">{formatTime(currentTime)}/{formatTime(duration)}</span>
          <button onClick={toggleFullscreen} className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80">
            <Maximize className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={source?.url}
        poster={poster || undefined}
        className="w-full h-full object-contain"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        playsInline
      />
      
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
        {!isPlaying && (
          <div className="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center pointer-events-auto cursor-pointer" onClick={togglePlay}>
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </div>
        )}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-10 pb-3 px-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-2 group-hover:h-2" onClick={handleSeek}>
          <div className="absolute h-full bg-red-500 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
            {isPlaying ? <Pause className="w-6 h-6 text-white" fill="white" /> : <Play className="w-6 h-6 text-white" fill="white" />}
          </button>
          
          <div className="flex items-center gap-1">
            <button onClick={toggleMute} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
              {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
            <div className="w-20 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
              <div className="h-full bg-white" style={{ width: isMuted ? '0%' : '100%' }} />
            </div>
          </div>
          
          <span className="text-white text-sm ml-2">{formatTime(currentTime)} / {formatTime(duration)}</span>
          
          <div className="flex-1" />
          
          <button onClick={toggleFullscreen} className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors">
            {isFullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>
    </div>
  )
}
