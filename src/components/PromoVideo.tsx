import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface Scene {
    title: string;
    description: string;
    image: string;
    duration: number;
}

export const PromoVideo: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [currentScene, setCurrentScene] = useState(0);
    const [progress, setProgress] = useState(0);

    const scenes: Scene[] = [
        {
            title: "Dashboard Intuitivo",
            description: "Visualize todas as suas métricas em tempo real",
            image: "/brain/668b4c75-749a-4d70-ade8-0396af001e12/dashboard_mockup_1769693212512.png",
            duration: 3000
        },
        {
            title: "IA Integrada",
            description: "Sugestões inteligentes de conteúdo e hashtags",
            image: "/brain/668b4c75-749a-4d70-ade8-0396af001e12/ai_features_mockup_1769693256974.png",
            duration: 3000
        },
        {
            title: "Agendamento Visual",
            description: "Programe posts com calendário intuitivo",
            image: "/brain/668b4c75-749a-4d70-ade8-0396af001e12/calendar_scheduling_mockup_1769693429181.png",
            duration: 3000
        },
        {
            title: "Publicação Multi-Plataforma",
            description: "Publique em todas as redes simultaneamente",
            image: "/brain/668b4c75-749a-4d70-ade8-0396af001e12/multiplatform_posting_mockup_1769693563534.png",
            duration: 3000
        }
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let progressInterval: NodeJS.Timeout;

        if (isPlaying) {
            const sceneDuration = scenes[currentScene].duration;

            // Progress bar animation
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    const increment = 100 / (sceneDuration / 50);
                    if (prev >= 100) return 0;
                    return prev + increment;
                });
            }, 50);

            // Scene transition
            interval = setTimeout(() => {
                setProgress(0);
                setCurrentScene(prev => {
                    const next = (prev + 1) % scenes.length;
                    if (next === 0) {
                        setIsPlaying(false);
                    }
                    return next;
                });
            }, sceneDuration);
        }

        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }, [isPlaying, currentScene, scenes]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying && currentScene === scenes.length - 1 && progress >= 100) {
            setCurrentScene(0);
            setProgress(0);
        }
    };

    const totalDuration = scenes.reduce((acc, scene) => acc + scene.duration, 0);
    const elapsedTime = scenes.slice(0, currentScene).reduce((acc, scene) => acc + scene.duration, 0) +
        (progress / 100) * scenes[currentScene].duration;

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative w-full max-w-5xl mx-auto">
            {/* Video Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
                {/* Video Display */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                    {/* Scene Image */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                        <img
                            src={scenes[currentScene].image}
                            alt={scenes[currentScene].title}
                            className={`w-full h-full object-contain rounded-xl transition-all duration-700 ${isPlaying ? 'scale-100 opacity-100' : 'scale-95 opacity-90'
                                }`}
                        />
                    </div>

                    {/* Scene Info Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'
                        }`}>
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                                {scenes[currentScene].title}
                            </h3>
                            <p className="text-gray-300 text-lg">
                                {scenes[currentScene].description}
                            </p>
                        </div>
                    </div>

                    {/* Play Button Overlay (when paused) */}
                    {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={handlePlayPause}
                                className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform"
                            >
                                <Play className="w-10 h-10 text-white ml-1" />
                            </button>
                        </div>
                    )}

                    {/* Scene Indicators */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        {scenes.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1 rounded-full transition-all duration-300 ${index === currentScene
                                        ? 'w-12 bg-gradient-to-r from-pink-500 to-purple-500'
                                        : index < currentScene
                                            ? 'w-8 bg-white/50'
                                            : 'w-8 bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-slate-800/90 backdrop-blur-sm border-t border-white/10 p-4">
                    {/* Progress Bar */}
                    <div className="mb-3">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100"
                                style={{
                                    width: `${((elapsedTime / totalDuration) * 100)}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Play/Pause */}
                            <button
                                onClick={handlePlayPause}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5 text-white" />
                                ) : (
                                    <Play className="w-5 h-5 text-white ml-0.5" />
                                )}
                            </button>

                            {/* Mute/Unmute */}
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                {isMuted ? (
                                    <VolumeX className="w-5 h-5 text-white" />
                                ) : (
                                    <Volume2 className="w-5 h-5 text-white" />
                                )}
                            </button>

                            {/* Time */}
                            <span className="text-sm text-gray-400">
                                {formatTime(elapsedTime)} / {formatTime(totalDuration)}
                            </span>
                        </div>

                        {/* Scene Counter */}
                        <span className="text-sm text-gray-400">
                            {currentScene + 1} / {scenes.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl -z-10 opacity-50" />
        </div>
    );
};
