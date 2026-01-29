import React, { useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
    TrendingUp,
    Calendar,
    CheckCircle,
    Heart,
    Plus,
    Instagram,
    Facebook
} from 'lucide-react';
import type { Post, DashboardStats } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EngagementChart } from './EngagementChart';
import './Dashboard.css';

interface DashboardProps {
    posts: Post[];
    onCreatePost: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ posts, onCreatePost }) => {
    const stats: DashboardStats = useMemo(() => {
        const scheduled = posts.filter(p => p.status === 'scheduled').length;
        const published = posts.filter(p => p.status === 'published').length;
        const totalEngagement = posts.reduce((sum, post) => {
            if (post.engagement) {
                return sum + post.engagement.likes + post.engagement.comments + post.engagement.shares;
            }
            return sum;
        }, 0);

        return {
            totalPosts: posts.length,
            scheduledPosts: scheduled,
            publishedPosts: published,
            totalEngagement,
            engagementRate: published > 0 ? totalEngagement / published : 0,
        };
    }, [posts]);

    const recentPosts = useMemo(() => {
        return [...posts]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);
    }, [posts]);

    const getStatusColor = (status: Post['status']) => {
        switch (status) {
            case 'published': return 'var(--color-success)';
            case 'scheduled': return 'var(--color-info)';
            case 'failed': return 'var(--color-error)';
            case 'draft': return 'var(--color-warning)';
        }
    };

    const getStatusText = (status: Post['status']) => {
        switch (status) {
            case 'published': return 'Publicado';
            case 'scheduled': return 'Agendado';
            case 'failed': return 'Falhou';
            case 'draft': return 'Rascunho';
        }
    };

    const getPlatformIcon = (platform: Post['platform']) => {
        if (platform === 'instagram') return <Instagram size={16} />;
        if (platform === 'facebook') return <Facebook size={16} />;
        return <><Instagram size={16} /><Facebook size={16} /></>;
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="gradient-text">Dashboard</h1>
                    <p className="dashboard-subtitle">Visão geral das suas postagens</p>
                </div>
                <Button
                    className="gap-2"
                    onClick={onCreatePost}
                >
                    <Plus size={20} />
                    Nova Postagem
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <Card className="flex items-center p-6 gap-4">
                    <div className="w-[60px] h-[60px] rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: 'var(--gradient-primary)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Total de Posts</p>
                        <h2 className="text-3xl font-bold">{stats.totalPosts}</h2>
                    </div>
                </Card>

                <Card className="flex items-center p-6 gap-4">
                    <div className="w-[60px] h-[60px] rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: 'var(--gradient-secondary)' }}>
                        <Calendar size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Agendados</p>
                        <h2 className="text-3xl font-bold">{stats.scheduledPosts}</h2>
                    </div>
                </Card>

                <Card className="flex items-center p-6 gap-4">
                    <div className="w-[60px] h-[60px] rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Publicados</p>
                        <h2 className="text-3xl font-bold">{stats.publishedPosts}</h2>
                    </div>
                </Card>

                <Card className="flex items-center p-6 gap-4">
                    <div className="w-[60px] h-[60px] rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' }}>
                        <Heart size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Engajamento Total</p>
                        <h2 className="text-3xl font-bold">{stats.totalEngagement.toLocaleString()}</h2>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="mb-8">
                <EngagementChart />
            </div>

            {/* Recent Posts */}
            <Card className="recent-posts">
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Postagens Recentes</h3>
                    {recentPosts.length === 0 ? (
                        <div className="empty-state">
                            <p>Nenhuma postagem ainda</p>
                            <Button variant="secondary" onClick={onCreatePost}>
                                Criar primeira postagem
                            </Button>
                        </div>
                    ) : (
                        <div className="posts-list">
                            {recentPosts.map(post => (
                                <div key={post.id} className="post-item glass-hover">
                                    {post.images[0] && (
                                        (post.images[0].match(/\.(mp4|mov|avi|wmv)$/i) || post.images[0].startsWith('data:video')) ? (
                                            <video
                                                src={post.images[0]}
                                                className="post-thumbnail object-cover"
                                                muted
                                                playsInline
                                                loop
                                                onMouseOver={e => {
                                                    const vid = e.currentTarget;
                                                    const playPromise = vid.play();
                                                    if (playPromise !== undefined) {
                                                        playPromise.catch(() => { });
                                                    }
                                                }}
                                                onMouseOut={e => {
                                                    e.currentTarget.pause();
                                                    e.currentTarget.currentTime = 0;
                                                }}
                                            />
                                        ) : (
                                            <img
                                                src={post.images[0]}
                                                alt="Post preview"
                                                className="post-thumbnail"
                                            />
                                        )
                                    )}
                                    <div className="post-info">
                                        <p className="post-caption">{post.caption.slice(0, 80)}...</p>
                                        <div className="post-meta">
                                            <span className="post-platform">
                                                {getPlatformIcon(post.platform)}
                                            </span>
                                            <span className="post-date">
                                                {format(post.scheduledDate, "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="post-status"
                                        style={{
                                            background: getStatusColor(post.status),
                                            color: 'white'
                                        }}
                                    >
                                        {getStatusText(post.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
