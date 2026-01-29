import React, { useState, useEffect } from 'react';
import { Play, Pause, Sparkles, TrendingUp, Calendar, Share2, Zap, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';

interface Scene {
    id: number;
    duration: number;
    type: 'hook' | 'problem' | 'solution' | 'dashboard' | 'ai' | 'scheduling' | 'multiplatform' | 'results' | 'cta';
}

export const PromoVideo: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentScene, setCurrentScene] = useState(0);
    const [sceneProgress, setSceneProgress] = useState(0);
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

    const scenes: Scene[] = [
        { id: 1, duration: 5000, type: 'hook' },
        { id: 2, duration: 5000, type: 'problem' },
        { id: 3, duration: 8000, type: 'solution' },
        { id: 4, duration: 10000, type: 'dashboard' },
        { id: 5, duration: 10000, type: 'ai' },
        { id: 6, duration: 10000, type: 'scheduling' },
        { id: 7, duration: 10000, type: 'multiplatform' },
        { id: 8, duration: 10000, type: 'results' },
        { id: 9, duration: 17000, type: 'cta' }
    ];

    // Generate particles
    useEffect(() => {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 3
        }));
        setParticles(newParticles);
    }, []);

    // Scene progression
    useEffect(() => {
        let progressInterval: NodeJS.Timeout;
        let sceneTimeout: NodeJS.Timeout;

        if (isPlaying && currentScene < scenes.length) {
            const duration = scenes[currentScene].duration;

            progressInterval = setInterval(() => {
                setSceneProgress(prev => {
                    const increment = 100 / (duration / 50);
                    return Math.min(prev + increment, 100);
                });
            }, 50);

            sceneTimeout = setTimeout(() => {
                if (currentScene < scenes.length - 1) {
                    setCurrentScene(prev => prev + 1);
                    setSceneProgress(0);
                } else {
                    setIsPlaying(false);
                    setSceneProgress(100);
                }
            }, duration);
        }

        return () => {
            clearInterval(progressInterval);
            clearTimeout(sceneTimeout);
        };
    }, [isPlaying, currentScene, scenes]);

    const handlePlayPause = () => {
        if (!isPlaying && currentScene === scenes.length - 1 && sceneProgress >= 100) {
            setCurrentScene(0);
            setSceneProgress(0);
        }
        setIsPlaying(!isPlaying);
    };

    const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);
    const elapsedTime = scenes.slice(0, currentScene).reduce((acc, s) => acc + s.duration, 0) +
        (sceneProgress / 100) * scenes[currentScene].duration;

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    };

    const renderScene = () => {
        const scene = scenes[currentScene];

        switch (scene.type) {
            case 'hook':
                return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                        {/* Animated particles */}
                        {particles.map(p => (
                            <div
                                key={p.id}
                                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                                style={{
                                    left: `${p.x}%`,
                                    top: `${p.y}%`,
                                    animationDelay: `${p.delay}s`,
                                    opacity: 0.6
                                }}
                            />
                        ))}

                        {/* Logo with glow */}
                        <div className="relative mb-8 animate-fade-in">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-3xl opacity-50 animate-pulse" />
                            <Sparkles className="w-24 h-24 text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text relative" style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))' }} />
                        </div>

                        {/* Text */}
                        <h1 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-slide-up">
                            Social Spark
                        </h1>
                        <p className="text-3xl text-white/90 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            Transforme Suas Redes Sociais
                        </p>
                    </div>
                );

            case 'problem':
                return (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
                        {/* Chaotic social media icons */}
                        <div className="absolute inset-0 opacity-30">
                            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                                <Icon
                                    key={i}
                                    className="absolute text-white animate-bounce"
                                    size={60}
                                    style={{
                                        left: `${20 + i * 20}%`,
                                        top: `${30 + (i % 2) * 30}%`,
                                        animationDelay: `${i * 0.2}s`,
                                        filter: 'blur(2px)'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Text */}
                        <div className="relative text-center z-10">
                            <h2 className="text-5xl font-bold text-white mb-4 animate-shake">
                                Muitas redes.
                            </h2>
                            <p className="text-4xl text-gray-400 animate-shake" style={{ animationDelay: '0.3s' }}>
                                Pouco tempo.
                            </p>
                        </div>
                    </div>
                );

            case 'solution':
                return (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
                        {/* Clean dashboard mockup */}
                        <div className="relative w-4/5 h-3/4 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 animate-scale-in">
                            <div className="grid grid-cols-3 gap-4 h-full">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-white/10 p-4 animate-float"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    >
                                        <div className="h-full bg-white/5 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Text overlay */}
                        <div className="absolute bottom-16 left-0 right-0 text-center">
                            <h2 className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                                Tudo em um só lugar
                            </h2>
                        </div>
                    </div>
                );

            case 'dashboard':
                return (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12">
                        {/* Stats cards */}
                        <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                            {[
                                { label: 'Usuários', value: '10K+', icon: '👥' },
                                { label: 'Posts', value: '1M+', icon: '📱' },
                                { label: 'Uptime', value: '99.9%', icon: '⚡' },
                                { label: 'Avaliação', value: '4.9★', icon: '⭐' }
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 animate-slide-up"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                >
                                    <div className="text-5xl mb-4">{stat.icon}</div>
                                    <div className="text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-xl text-gray-300">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom text */}
                        <div className="absolute bottom-12 left-0 right-0 text-center">
                            <p className="text-3xl text-white/90">Dashboard inteligente em tempo real</p>
                        </div>
                    </div>
                );

            case 'ai':
                return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-12">
                        {/* AI Brain visualization */}
                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-3xl opacity-50 animate-pulse" />
                            <Sparkles className="w-32 h-32 text-purple-400 relative animate-spin-slow" />
                        </div>

                        {/* AI Features */}
                        <div className="space-y-6 w-full max-w-2xl">
                            {[
                                'Gerando ideias de conteúdo...',
                                'Sugerindo hashtags relevantes...',
                                'Analisando melhores horários...'
                            ].map((text, i) => (
                                <div
                                    key={i}
                                    className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-purple-500/30 p-6 animate-slide-right"
                                    style={{ animationDelay: `${i * 0.5}s` }}
                                >
                                    <p className="text-2xl text-white font-mono">{text}</p>
                                    <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mt-3 animate-pulse" />
                                </div>
                            ))}
                        </div>

                        {/* Bottom text */}
                        <div className="absolute bottom-12 left-0 right-0 text-center">
                            <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                                Powered by IA
                            </p>
                        </div>
                    </div>
                );

            case 'scheduling':
                return (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-12">
                        {/* Calendar grid */}
                        <div className="w-full max-w-4xl">
                            <div className="grid grid-cols-7 gap-3 mb-8">
                                {Array.from({ length: 35 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`aspect-square rounded-lg border ${i % 7 === 2 || i % 7 === 5
                                                ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-500/50 animate-pulse'
                                                : 'bg-slate-800/30 border-white/10'
                                            }`}
                                        style={{ animationDelay: `${i * 0.02}s` }}
                                    >
                                        {(i % 7 === 2 || i % 7 === 5) && (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Calendar className="w-6 h-6 text-purple-400" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bottom text */}
                        <div className="absolute bottom-12 left-0 right-0 text-center">
                            <p className="text-4xl font-bold text-white">Agende tudo com facilidade</p>
                        </div>
                    </div>
                );

            case 'multiplatform':
                return (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12">
                        {/* Center post */}
                        <div className="relative">
                            <div className="w-64 h-64 bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-center mb-8">
                                <Share2 className="w-24 h-24 text-white" />
                            </div>

                            {/* Platform icons with connecting lines */}
                            {[
                                { Icon: Instagram, position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-32', color: 'from-pink-500 to-purple-500' },
                                { Icon: Facebook, position: 'top-1/2 -translate-y-1/2 -left-32', color: 'from-blue-500 to-indigo-500' },
                                { Icon: Twitter, position: 'top-1/2 -translate-y-1/2 -right-32', color: 'from-cyan-500 to-blue-500' },
                                { Icon: Linkedin, position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-32', color: 'from-blue-600 to-indigo-600' }
                            ].map(({ Icon, position, color }, i) => (
                                <div key={i} className={`absolute ${position}`}>
                                    <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }}>
                                        <Icon className="w-10 h-10 text-white" />
                                    </div>
                                    {/* Connecting line */}
                                    <div className={`absolute w-1 bg-gradient-to-br ${color} animate-pulse`} style={{
                                        height: '8rem',
                                        left: '50%',
                                        top: i < 2 ? '100%' : 'auto',
                                        bottom: i >= 2 ? '100%' : 'auto',
                                        transform: 'translateX(-50%)'
                                    }} />
                                </div>
                            ))}
                        </div>

                        {/* Bottom text */}
                        <div className="absolute bottom-12 left-0 right-0 text-center px-8">
                            <p className="text-3xl font-bold text-white">
                                Publique em todas as redes com um clique
                            </p>
                        </div>
                    </div>
                );

            case 'results':
                return (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-12">
                        {/* Growth metrics */}
                        <div className="space-y-8 w-full max-w-3xl">
                            {[
                                { label: 'Alcance', value: '+350%' },
                                { label: 'Engajamento', value: '+280%' },
                                { label: 'Seguidores', value: '+420%' }
                            ].map((metric, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-6 animate-slide-right"
                                    style={{ animationDelay: `${i * 0.3}s` }}
                                >
                                    <TrendingUp className="w-16 h-16 text-green-400 animate-bounce" />
                                    <div className="flex-1">
                                        <div className="text-2xl text-gray-300 mb-2">{metric.label}</div>
                                        <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                            {metric.value}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom text */}
                        <div className="absolute bottom-12 left-0 right-0 text-center">
                            <p className="text-4xl font-bold text-white">Mais alcance. Mais engajamento.</p>
                        </div>
                    </div>
                );

            case 'cta':
                return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                        {/* Logo */}
                        <div className="relative mb-12 animate-fade-in">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-3xl opacity-50 animate-pulse" />
                            <Sparkles className="w-32 h-32 text-purple-400 relative" />
                        </div>

                        <h1 className="text-6xl font-bold text-center mb-8 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                            Social Spark
                        </h1>

                        {/* CTA Button */}
                        <button className="relative px-12 py-6 mb-8 text-3xl font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-full shadow-2xl shadow-purple-500/50 animate-pulse-scale hover:scale-110 transition-transform">
                            Comece grátis agora
                            <Zap className="inline-block ml-3 w-8 h-8" />
                        </button>

                        {/* Benefits */}
                        <div className="flex gap-8 text-gray-300 text-lg">
                            <span>✓ Sem cartão</span>
                            <span>✓ 2 minutos</span>
                            <span>✓ Cancele quando quiser</span>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="relative w-full max-w-6xl mx-auto">
            {/* Video Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
                {/* Video Display */}
                <div className="relative aspect-video">
                    {renderScene()}

                    {/* Play Button Overlay (when paused) */}
                    {!isPlaying && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                            <button
                                onClick={handlePlayPause}
                                className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 hover:scale-110 transition-transform"
                            >
                                <Play className="w-12 h-12 text-white ml-2" />
                            </button>
                        </div>
                    )}

                    {/* Scene Progress Indicators */}
                    <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
                        {scenes.map((_, index) => (
                            <div
                                key={index}
                                className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden"
                            >
                                <div
                                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100"
                                    style={{
                                        width: index < currentScene ? '100%' : index === currentScene ? `${sceneProgress}%` : '0%'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-slate-800/90 backdrop-blur-sm border-t border-white/10 p-4">
                    {/* Overall Progress Bar */}
                    <div className="mb-3">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-100"
                                style={{ width: `${(elapsedTime / totalDuration) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Play/Pause */}
                            <button
                                onClick={handlePlayPause}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 flex items-center justify-center transition-all shadow-lg shadow-purple-500/30"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5 text-white" />
                                ) : (
                                    <Play className="w-5 h-5 text-white ml-0.5" />
                                )}
                            </button>

                            {/* Time */}
                            <span className="text-sm text-gray-400 font-mono">
                                {formatTime(elapsedTime)} / {formatTime(totalDuration)}
                            </span>
                        </div>

                        {/* Scene Counter */}
                        <span className="text-sm text-gray-400">
                            Cena {currentScene + 1} / {scenes.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -inset-8 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl -z-10 opacity-50 animate-pulse" />

            {/* Custom animations */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-right {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse-scale {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .animate-fade-in { animation: fade-in 1s ease-out; }
                .animate-slide-up { animation: slide-up 0.8s ease-out; }
                .animate-slide-right { animation: slide-right 0.8s ease-out; }
                .animate-scale-in { animation: scale-in 0.8s ease-out; }
                .animate-shake { animation: shake 0.5s ease-in-out; }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-spin-slow { animation: spin-slow 8s linear infinite; }
                .animate-pulse-scale { animation: pulse-scale 2s ease-in-out infinite; }
            `}</style>
        </div>
    );
};
