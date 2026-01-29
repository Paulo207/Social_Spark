import React, { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
    FileText,
    CheckCircle,
    AlertCircle,
    Clock,
    Filter,
    Instagram,
    Facebook
} from 'lucide-react';
import type { Post } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './PostList.css';

interface PostListProps {
    posts: Post[];
    onCreatePost: () => void;
    onEditPost: (post: Post) => void;
}

export const PostList: React.FC<PostListProps> = ({ posts, onCreatePost, onEditPost }) => {
    const [filter, setFilter] = useState<Post['status'] | 'all'>('all');

    const filteredPosts = useMemo(() => {
        if (filter === 'all') return posts;
        return posts.filter(p => p.status === filter);
    }, [posts, filter]);

    const getStatusColor = (status: Post['status']) => {
        switch (status) {
            case 'published': return 'var(--color-success)';
            case 'scheduled': return 'var(--color-info)';
            case 'failed': return 'var(--color-error)';
            case 'draft': return 'var(--color-warning)';
        }
    };

    const getStatusIcon = (status: Post['status']) => {
        switch (status) {
            case 'published': return <CheckCircle size={14} />;
            case 'scheduled': return <Clock size={14} />;
            case 'failed': return <AlertCircle size={14} />;
            case 'draft': return <FileText size={14} />;
        }
    };

    const getStatusLabel = (status: Post['status']) => {
        switch (status) {
            case 'published': return 'Publicado';
            case 'scheduled': return 'Agendado';
            case 'failed': return 'Falhou';
            case 'draft': return 'Rascunho';
        }
    };

    const getPlatformIcon = (platform: string) => {
        if (platform === 'instagram') return <Instagram size={16} />;
        if (platform === 'facebook') return <Facebook size={16} />;
        return <div className="flex gap-1"><Instagram size={16} /><Facebook size={16} /></div>;
    };

    return (
        <div className="post-list-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="gradient-text">Minhas Postagens</h1>
                    <p className="page-subtitle">Gerencie suas publicações e agendamentos</p>
                </div>
                <Button className="gap-2" onClick={onCreatePost}>
                    <FileText size={20} />
                    Nova Postagem
                </Button>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Todos
                        <span className="count-badge">{posts.length}</span>
                    </button>
                    <button
                        className={`filter-tab ${filter === 'scheduled' ? 'active' : ''}`}
                        onClick={() => setFilter('scheduled')}
                    >
                        Agendados
                        <span className="count-badge">{posts.filter(p => p.status === 'scheduled').length}</span>
                    </button>
                    <button
                        className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
                        onClick={() => setFilter('published')}
                    >
                        Publicados
                        <span className="count-badge count-success">{posts.filter(p => p.status === 'published').length}</span>
                    </button>
                    <button
                        className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
                        onClick={() => setFilter('draft')}
                    >
                        Rascunhos
                        <span className="count-badge count-warning">{posts.filter(p => p.status === 'draft').length}</span>
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="posts-grid">
                {filteredPosts.length === 0 ? (
                    <div className="empty-state-container">
                        <div className="empty-icon-bg">
                            <Filter size={40} />
                        </div>
                        <h3>Nada encontrado</h3>
                        <p>Não há postagens com este status.</p>
                        {filter !== 'all' && (
                            <Button variant="ghost" onClick={() => setFilter('all')}>
                                Limpar filtros
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredPosts.map(post => (
                        <Card key={post.id} className="post-card-item glass-hover" onClick={() => onEditPost(post)}>
                            <div className="post-card-image">
                                {post.images[0] ? (
                                    (post.images[0].match(/\.(mp4|mov|avi|wmv)$/i) || post.images[0].startsWith('data:video')) ? (
                                        <video
                                            src={post.images[0]}
                                            className="w-full h-full object-cover"
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
                                        <img src={post.images[0]} alt="Post" />
                                    )
                                ) : (
                                    <div className="no-image-placeholder">
                                        <FileText size={32} />
                                    </div>
                                )}
                                <div className="post-card-platform">
                                    {getPlatformIcon(post.platform)}
                                </div>
                            </div>
                            <div className="post-card-content">
                                <div className="post-card-header">
                                    <div
                                        className="status-badge"
                                        style={{
                                            backgroundColor: `${getStatusColor(post.status)}20`,
                                            color: getStatusColor(post.status),
                                            borderColor: `${getStatusColor(post.status)}40`
                                        }}
                                    >
                                        {getStatusIcon(post.status)}
                                        {getStatusLabel(post.status)}
                                    </div>
                                    <span className="post-date">
                                        {format(new Date(post.scheduledDate), "dd MMM, HH:mm", { locale: ptBR })}
                                    </span>
                                </div>
                                <p className="post-card-caption">
                                    {post.caption || <em>Sem legenda...</em>}
                                </p>
                                <div className="post-card-footer">
                                    <Button variant="ghost" size="sm" className="edit-btn">
                                        Editar
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
