import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

export const PromoVideo: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handleEnded = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('ended', handleEnded);

        // Autoplay when component mounts
        const playVideo = async () => {
            try {
                await video.play();
                setIsPlaying(true);
            } catch (error) {
                console.log('Autoplay prevented by browser:', error);
                // Autoplay was prevented, user will need to click play
            }
        };

        playVideo();

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    // Auto-hide controls
    useEffect(() => {
        if (!isPlaying) {
            setShowControls(true);
            return;
        }

        const timer = setTimeout(() => setShowControls(false), 3000);
        return () => clearTimeout(timer);
    }, [isPlaying, currentTime]);

    const handlePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleMuteToggle = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.currentTime = percent * duration;
    };

    const handleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;

        if (!isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        setIsFullscreen(!isFullscreen);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="relative w-full max-w-6xl mx-auto">
            {/* Video Container */}
            <div
                ref={containerRef}
                className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 group"
                onMouseEnter={() => setShowControls(true)}
                onMouseMove={() => setShowControls(true)}
            >
                {/* Video Element */}
                <div className="relative aspect-video bg-black">
                    <video
                        ref={videoRef}
                        className="w-full h-full"
                        muted={isMuted}
                        autoPlay
                        playsInline
                        onClick={handlePlayPause}
                    >
                        <source src="/promo-video.mp4" type="video/mp4" />
                        Seu navegador não suporta vídeos HTML5.
                    </video>

                    {/* Play Button Overlay (when paused) */}
                    {!isPlaying && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity">
                            <button
                                onClick={handlePlayPause}
                                className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform"
                            >
                                <Play className="w-12 h-12 text-white ml-2" />
                            </button>
                        </div>
                    )}

                    {/* Controls Overlay */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {/* Progress Bar */}
                        <div
                            className="mb-4 h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all group/progress"
                            onClick={handleSeek}
                        >
                            <div
                                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Play/Pause */}
                                <button
                                    onClick={handlePlayPause}
                                    className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 flex items-center justify-center transition-all shadow-lg shadow-purple-500/30"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-6 h-6 text-white" />
                                    ) : (
                                        <Play className="w-6 h-6 text-white ml-0.5" />
                                    )}
                                </button>

                                {/* Mute/Unmute */}
                                <button
                                    onClick={handleMuteToggle}
                                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    {isMuted ? (
                                        <VolumeX className="w-5 h-5 text-white" />
                                    ) : (
                                        <Volume2 className="w-5 h-5 text-white" />
                                    )}
                                </button>

                                {/* Time */}
                                <span className="text-sm text-white font-mono">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            {/* Fullscreen */}
                            <button
                                onClick={handleFullscreen}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                {isFullscreen ? (
                                    <Minimize className="w-5 h-5 text-white" />
                                ) : (
                                    <Maximize className="w-5 h-5 text-white" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-8 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl -z-10 opacity-50 animate-pulse" />

            {/* Custom animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.3; }
                }
                .animate-pulse {
                    animation: pulse 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
