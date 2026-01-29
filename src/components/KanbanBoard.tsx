import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Post, PostStatus } from '../types';
import { KanbanCard } from './KanbanCard';
import { Plus, Sparkles, FileText, CheckCircle2, CalendarClock } from 'lucide-react';

interface KanbanBoardProps {
    posts: Post[];
    onStatusChange: (postId: string, newStatus: PostStatus) => void;
    onNewPost: (status: PostStatus) => void;
}

const COLUMNS: { id: PostStatus; title: string; icon: React.ReactNode; color: string }[] = [
    {
        id: 'idea',
        title: 'Ideias',
        icon: <Sparkles className="w-4 h-4" />,
        color: 'from-amber-500 to-orange-500'
    },
    {
        id: 'draft',
        title: 'Rascunho',
        icon: <FileText className="w-4 h-4" />,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'approval',
        title: 'Aprovação',
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'scheduled',
        title: 'Agendado',
        icon: <CalendarClock className="w-4 h-4" />,
        color: 'from-emerald-500 to-green-500'
    }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ posts, onStatusChange, onNewPost }) => {
    // Filter posts by column
    const getPostsByStatus = (status: PostStatus) => {
        return posts.filter(post => post.status === status);
    };

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Call parent handler
        onStatusChange(draggableId, destination.droppableId as PostStatus);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 h-full min-h-[600px] w-full items-start snap-x snap-mandatory md:snap-none px-4 md:px-0 scrollbar-hide">
                {COLUMNS.map(column => {
                    const columnPosts = getPostsByStatus(column.id);

                    return (
                        <div key={column.id} className="min-w-[85vw] md:min-w-[300px] w-[85vw] md:w-[300px] flex flex-col h-full rounded-xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm snap-center shrink-0">
                            {/* Column Header */}
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur-md rounded-t-xl z-10">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${column.color} flex items-center justify-center text-white shadow-lg`}>
                                        {column.icon}
                                    </div>
                                    <h3 className="font-bold text-white">{column.title}</h3>
                                    <span className="text-xs text-gray-400 font-mono bg-slate-800 px-2 py-0.5 rounded-full ml-1">
                                        {columnPosts.length}
                                    </span>
                                </div>
                                <button
                                    onClick={() => onNewPost(column.id)}
                                    className="p-1.5 hover:bg-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    title={`Adicionar em ${column.title}`}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Column Content */}
                            <Droppable droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 p-3 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-slate-800/30' : ''
                                            }`}
                                    >
                                        {columnPosts.map((post, index) => (
                                            <KanbanCard key={post.id} post={post} index={index} />
                                        ))}
                                        {provided.placeholder}

                                        {columnPosts.length === 0 && !snapshot.isDraggingOver && (
                                            <div className="flex flex-col items-center justify-center py-8 text-gray-600 border-2 border-dashed border-slate-800/50 rounded-xl">
                                                <div className="opacity-20">{column.icon}</div>
                                                <p className="text-xs mt-2">Arraste itens aqui</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
};
