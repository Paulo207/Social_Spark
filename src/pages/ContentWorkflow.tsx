import React, { useState, useEffect } from 'react';
import { KanbanBoard } from '../components/KanbanBoard';
import type { Post, PostStatus } from '../types';
import { Loader2, Plus, ListTodo } from 'lucide-react';

export const ContentWorkflow: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Posts
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                console.log('Fetched Posts for Workflow:', data);
                setPosts(data);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (postId: string, newStatus: PostStatus) => {
        // Optimistic Update
        const previousPosts = [...posts];
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, status: newStatus } : p
        ));

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                // Revert on failure
                setPosts(previousPosts);
                console.error('Failed to update status');
            }
        } catch (error) {
            setPosts(previousPosts);
            console.error('Failed to update status:', error);
        }
    };

    const handleNewPost = (status: PostStatus) => {
        // Here we could open a modal to create a quick card
        // For now, let's just log or redirect to composer with pre-selected status
        console.log(`Create new post in ${status}`);
        // TODO: Integrate with PostComposer Modal
    };

    return (
        <div className="p-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
                        <ListTodo className="w-8 h-8 text-purple-500" />
                        Workflow de Conteúdo
                    </h1>
                    <p className="text-gray-400 mt-2">Organize suas ideias e posts em um quadro visual.</p>
                </div>
                <button
                    onClick={() => handleNewPost('idea')}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 rounded-xl font-medium text-white hover:opacity-90 transition-opacity shadow-lg shadow-purple-900/20"
                >
                    <Plus className="w-5 h-5" />
                    Nova Ideia
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                </div>
            ) : (
                <div className="flex-1 overflow-hidden">
                    <KanbanBoard
                        posts={posts}
                        onStatusChange={handleStatusChange}
                        onNewPost={handleNewPost}
                    />
                </div>
            )}
        </div>
    );
};
