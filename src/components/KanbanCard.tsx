import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { Post } from '../types';
import { Card, CardContent, CardHeader } from './ui/card';
import { Instagram, Facebook, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KanbanCardProps {
    post: Post;
    index: number;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ post, index }) => {
    // Parse images if they are strings (historical data safety)
    const images = Array.isArray(post.images) ? post.images : JSON.parse(post.images || '[]');
    const firstImage = images.length > 0 ? images[0] : null;

    return (
        <Draggable draggableId={post.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-3 ${snapshot.isDragging ? 'opacity-80 rotate-2 scale-105' : ''} transition-all duration-200`}
                >
                    <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors backdrop-blur-sm shadow-sm overflow-hidden group">
                        {firstImage && (
                            <div className="h-32 w-full overflow-hidden relative">
                                {firstImage && (
                                    (firstImage.match(/\.(mp4|mov|avi|wmv)$/i) || firstImage.startsWith('data:video')) ? (
                                        <video
                                            src={firstImage}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                                            src={firstImage}
                                            alt="Post preview"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    )
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                <div className="absolute bottom-2 right-2 flex gap-1">
                                    {post.platform === 'instagram' || post.platform === 'both' ? (
                                        <div className="p-1 bg-pink-600 rounded-full shadow-lg">
                                            <Instagram className="w-3 h-3 text-white" />
                                        </div>
                                    ) : null}
                                    {post.platform === 'facebook' || post.platform === 'both' ? (
                                        <div className="p-1 bg-blue-600 rounded-full shadow-lg">
                                            <Facebook className="w-3 h-3 text-white" />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        <CardHeader className={`${firstImage ? 'p-3 pt-2' : 'p-3'} space-y-0`}>
                            {!firstImage && (
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-1">
                                        {post.platform === 'instagram' || post.platform === 'both' ? (
                                            <Instagram className="w-4 h-4 text-pink-500" />
                                        ) : null}
                                        {post.platform === 'facebook' || post.platform === 'both' ? (
                                            <Facebook className="w-4 h-4 text-blue-500" />
                                        ) : null}
                                    </div>
                                    {post.status === 'failed' && (
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                    )}
                                </div>
                            )}
                            <p className="text-sm text-gray-200 line-clamp-3 font-medium">
                                {post.caption || <span className="text-gray-500 italic">Sem legenda...</span>}
                            </p>
                        </CardHeader>

                        <CardContent className="p-3 pt-0">
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                <Calendar className="w-3 h-3" />
                                <span>
                                    {post.scheduledDate
                                        ? format(new Date(post.scheduledDate), "d 'de' MMM", { locale: ptBR })
                                        : 'Sem data'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Draggable>
    );
};
