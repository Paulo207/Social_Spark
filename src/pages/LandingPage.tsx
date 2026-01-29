import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, BarChart3, Zap, Instagram, Facebook, Twitter, Linkedin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PromoVideo } from '../components/PromoVideo';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const features = [
        {
            icon: BarChart3,
            title: 'Analytics Avançado',
            description: 'Métricas detalhadas e insights em tempo real para otimizar sua estratégia',
            gradient: 'from-cyan-500 to-blue-500'
        },
        {
            icon: Sparkles,
            title: 'IA Integrada',
            description: 'Sugestões inteligentes de conteúdo, hashtags e melhores horários para postar',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: Calendar,
            title: 'Agendamento Inteligente',
            description: 'Programe posts para todas as redes sociais com calendário visual',
            gradient: 'from-orange-500 to-red-500'
        },
        {
            icon: Zap,
            title: 'Publicação Instantânea',
            description: 'Publique em múltiplas plataformas simultaneamente com um clique',
            gradient: 'from-green-500 to-emerald-500'
        }
    ];

    const socialPlatforms = [
        { name: 'Instagram', icon: Instagram, color: 'from-pink-500 via-purple-500 to-orange-500' },
        { name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-400' },
        { name: 'Twitter', icon: Twitter, color: 'from-sky-500 to-blue-500' },
        { name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-500' }
    ];

    const stats = [
        { value: '10K+', label: 'Usuários Ativos' },
        { value: '1M+', label: 'Posts Agendados' },
        { value: '99.9%', label: 'Uptime' },
        { value: '4.9★', label: 'Avaliação' }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <div
                    className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"
                    style={{ transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)` }}
                />
                <div
                    className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
                    style={{
                        transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`,
                        animationDelay: '1s'
                    }}
                />
                <div
                    className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
                    style={{
                        transform: `translate(${mousePosition.x}px, ${-mousePosition.y}px)`,
                        animationDelay: '2s'
                    }}
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
            </div>

            {/* Glassmorphic Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                            Social Spark
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/app')}
                            className="px-6 py-2.5 rounded-full border border-white/20 hover:bg-white/10 transition-all font-medium backdrop-blur-sm hover:scale-105 transform"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => navigate('/app')}
                            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 font-bold shadow-lg shadow-purple-500/50 hover:shadow-pink-500/50 transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            Começar Grátis
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <div
                            className="inline-block mb-6"
                            style={{
                                transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`
                            }}
                        >
                            <span className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold backdrop-blur-sm">
                                ✨ Gerencie todas as suas redes em um só lugar
                            </span>
                        </div>

                        <h1
                            className="text-6xl md:text-8xl font-black mb-8 tracking-tight"
                            style={{
                                transform: `translate3d(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px, 0)`
                            }}
                        >
                            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                Transforme Suas
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Redes Sociais
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Agende posts, analise métricas e cresça sua audiência com inteligência artificial.
                            Tudo em uma plataforma poderosa e intuitiva.
                        </p>

                        <div className="flex gap-4 justify-center items-center flex-wrap">
                            <button
                                onClick={() => navigate('/app')}
                                className="group px-8 py-4 text-lg rounded-full bg-gradient-to-r from-pink-600 to-purple-600 font-bold shadow-2xl shadow-purple-500/50 hover:shadow-pink-500/50 transition-all transform hover:scale-110 hover:-translate-y-1 flex items-center gap-2"
                            >
                                Começar Gratuitamente
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 text-lg rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all transform hover:scale-105 border border-white/20 font-semibold">
                                Ver Demonstração
                            </button>
                        </div>
                    </div>

                    {/* Promo Video */}
                    <div className="mt-20">
                        <PromoVideo />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-32 px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Recursos Poderosos
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Tudo que você precisa para dominar as redes sociais
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={i}
                                    className="group relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                                >
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                                    {/* Hover Glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity blur-xl`} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Social Platforms Section */}
            <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Conecte Todas as Suas Redes
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Integração perfeita com as principais plataformas sociais
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {socialPlatforms.map((platform, i) => {
                            const Icon = platform.icon;
                            return (
                                <div
                                    key={i}
                                    className="group relative bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all hover:scale-110 hover:-translate-y-2"
                                >
                                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-center font-semibold">{platform.name}</div>

                                    {/* Hover Glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity blur-xl`} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="relative bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl p-16 border border-white/10 text-center overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] opacity-50" />

                        <div className="relative z-10">
                            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                Pronto para Começar?
                            </h2>
                            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                                Junte-se a milhares de criadores que já transformaram sua presença digital
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <span>Sem cartão de crédito</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <span>Configuração em 2 minutos</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <span>Cancele quando quiser</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/app')}
                                className="group px-12 py-5 text-xl rounded-full bg-gradient-to-r from-pink-600 to-purple-600 font-bold shadow-2xl shadow-purple-500/50 hover:shadow-pink-500/50 transition-all transform hover:scale-110 hover:-translate-y-1 inline-flex items-center gap-3"
                            >
                                Começar Agora - É Grátis
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative py-12 px-6 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Brand */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                    Social Spark
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm text-center md:text-left">
                                Gerencie suas redes sociais com inteligência artificial
                            </p>
                        </div>

                        {/* Links */}
                        <div className="flex flex-col items-center md:items-start gap-3">
                            <h3 className="text-white font-semibold mb-2">Legal</h3>
                            <button
                                onClick={() => navigate('/privacy')}
                                className="text-gray-400 hover:text-white transition-colors text-sm"
                            >
                                Política de Privacidade
                            </button>
                            <button
                                onClick={() => navigate('/terms')}
                                className="text-gray-400 hover:text-white transition-colors text-sm"
                            >
                                Termos de Serviço
                            </button>
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col items-center md:items-start gap-3">
                            <h3 className="text-white font-semibold mb-2">Contato</h3>
                            <a
                                href="mailto:support@socialspark.app"
                                className="text-gray-400 hover:text-white transition-colors text-sm"
                            >
                                support@socialspark.app
                            </a>
                            <a
                                href="mailto:hello@socialspark.app"
                                className="text-gray-400 hover:text-white transition-colors text-sm"
                            >
                                hello@socialspark.app
                            </a>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="pt-8 border-t border-white/10 text-center">
                        <p className="text-gray-400 text-sm">
                            © 2026 Social Spark. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
