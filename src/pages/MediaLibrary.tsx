import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import {
    Upload,
    Search,
    Image as ImageIcon,
    Video,
    Loader2,
    Wand2,
    Trash2,
    Copy,
    CheckCircle2
} from 'lucide-react';
import type { MediaAsset } from '../types';
import {
    getMediaAssets,
    uploadMediaAsset,
    generateAIMetadata,
    deleteMediaAsset
} from '../services/api';
import { format } from 'date-fns';

export const MediaLibrary: React.FC = () => {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
    const [generatingAI, setGeneratingAI] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [copiedCaption, setCopiedCaption] = useState(false);

    useEffect(() => {
        loadAssets();
    }, [page]);

    const loadAssets = async () => {
        try {
            setLoading(true);
            const response = await getMediaAssets(page, 20);
            setAssets(response.assets);
            setTotalPages(response.pagination.totalPages);
        } catch (error: any) {
            console.error('Failed to load media:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const response = await uploadMediaAsset(file, true);
                setAssets(prev => [response.asset, ...prev]);
            }
            alert('Mídia enviada com sucesso!');
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert(error.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleGenerateAI = async (assetId: string) => {
        setGeneratingAI(assetId);
        try {
            const updatedAsset = await generateAIMetadata(assetId);
            setAssets(prev => prev.map(a => a.id === assetId ? updatedAsset : a));
            if (selectedAsset?.id === assetId) {
                setSelectedAsset(updatedAsset);
            }
            alert('Metadados AI gerados com sucesso!');
        } catch (error: any) {
            console.error('AI generation failed:', error);
            alert(error.message);
        } finally {
            setGeneratingAI(null);
        }
    };

    const handleDelete = async (assetId: string) => {
        if (!confirm('Tem certeza que deseja deletar esta mídia?')) return;

        try {
            await deleteMediaAsset(assetId);
            setAssets(prev => prev.filter(a => a.id !== assetId));
            if (selectedAsset?.id === assetId) {
                setSelectedAsset(null);
            }
            alert('Mídia deletada com sucesso!');
        } catch (error: any) {
            console.error('Delete failed:', error);
            alert(error.message);
        }
    };

    const copyCaption = (caption: string) => {
        navigator.clipboard.writeText(caption);
        setCopiedCaption(true);
        setTimeout(() => setCopiedCaption(false), 2000);
    };

    const filteredAssets = assets.filter(asset =>
        asset.aiCaption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.userCaption?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Biblioteca de Mídia</h1>
                    <p className="text-slate-300">Gerencie suas imagens e vídeos com IA</p>
                </div>

                {/* Actions Bar */}
                <div className="flex gap-4 mb-6 flex-wrap">
                    <div className="flex-1 min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <Input
                                placeholder="Buscar por legenda..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-800 border-slate-700 text-white"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={handleUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={uploading}
                        />
                        <Button disabled={uploading} className="gap-2">
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            {uploading ? 'Enviando...' : 'Upload de Mídia'}
                        </Button>
                    </div>
                </div>

                {/* Media Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 size={48} className="animate-spin text-purple-400" />
                    </div>
                ) : filteredAssets.length === 0 ? (
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-12 text-center">
                            <ImageIcon size={64} className="mx-auto mb-4 text-slate-600" />
                            <h3 className="text-xl font-semibold text-white mb-2">Nenhuma mídia encontrada</h3>
                            <p className="text-slate-400 mb-6">Faça upload de imagens ou vídeos para começar</p>
                            <div className="relative inline-block">
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={handleUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <Button>
                                    <Upload size={18} className="mr-2" />
                                    Upload de Mídia
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredAssets.map((asset) => (
                                <Card
                                    key={asset.id}
                                    className="bg-slate-800 border-slate-700 overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
                                    onClick={() => setSelectedAsset(asset)}
                                >
                                    <div className="aspect-square relative bg-black">
                                        {asset.resourceType === 'video' ? (
                                            <>
                                                <video src={asset.url} className="w-full h-full object-cover" />
                                                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                                    <Video size={12} />
                                                    {asset.duration ? `${Math.round(asset.duration)}s` : 'Video'}
                                                </div>
                                            </>
                                        ) : (
                                            <img src={asset.url} alt="" className="w-full h-full object-cover" />
                                        )}
                                        {asset.aiCaption && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                <p className="text-white text-xs line-clamp-2">{asset.aiCaption}</p>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400">
                                                {format(asset.createdAt, 'dd/MM/yy')}
                                            </span>
                                            {asset.aiHashtags && asset.aiHashtags.length > 0 && (
                                                <span className="text-xs text-purple-400">
                                                    {asset.aiHashtags.length} #
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Anterior
                                </Button>
                                <span className="flex items-center px-4 text-white">
                                    Página {page} de {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Próxima
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Detail Modal */}
                {selectedAsset && (
                    <div
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedAsset(null)}
                    >
                        <Card
                            className="bg-slate-800 border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Media Preview */}
                                    <div className="aspect-square bg-black rounded-lg overflow-hidden">
                                        {selectedAsset.resourceType === 'video' ? (
                                            <video src={selectedAsset.url} controls className="w-full h-full object-contain" />
                                        ) : (
                                            <img src={selectedAsset.url} alt="" className="w-full h-full object-contain" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h2 className="text-2xl font-bold text-white">Detalhes da Mídia</h2>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedAsset(null)}
                                            >
                                                ✕
                                            </Button>
                                        </div>

                                        {/* AI Caption */}
                                        {selectedAsset.aiCaption && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-semibold text-purple-400">Legenda AI</label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyCaption(selectedAsset.aiCaption!)}
                                                        className="h-6 gap-1"
                                                    >
                                                        {copiedCaption ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                                                        {copiedCaption ? 'Copiado!' : 'Copiar'}
                                                    </Button>
                                                </div>
                                                <p className="text-white bg-slate-900 p-3 rounded-lg text-sm">
                                                    {selectedAsset.aiCaption}
                                                </p>
                                            </div>
                                        )}

                                        {/* AI Hashtags */}
                                        {selectedAsset.aiHashtags && selectedAsset.aiHashtags.length > 0 && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-purple-400">Hashtags AI</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedAsset.aiHashtags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4">
                                            <Button
                                                variant="secondary"
                                                className="flex-1 gap-2"
                                                onClick={() => handleGenerateAI(selectedAsset.id)}
                                                disabled={generatingAI === selectedAsset.id || selectedAsset.resourceType === 'video'}
                                            >
                                                {generatingAI === selectedAsset.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Wand2 size={16} />
                                                )}
                                                {generatingAI === selectedAsset.id ? 'Gerando...' : 'Gerar AI'}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    handleDelete(selectedAsset.id);
                                                    setSelectedAsset(null);
                                                }}
                                                className="gap-2"
                                            >
                                                <Trash2 size={16} />
                                                Deletar
                                            </Button>
                                        </div>

                                        {/* Info */}
                                        <div className="text-xs text-slate-400 space-y-1 pt-4 border-t border-slate-700">
                                            <p>Tipo: {selectedAsset.resourceType}</p>
                                            <p>Tamanho: {(selectedAsset.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                            {selectedAsset.width && selectedAsset.height && (
                                                <p>Dimensões: {selectedAsset.width} x {selectedAsset.height}</p>
                                            )}
                                            <p>Criado: {format(selectedAsset.createdAt, 'dd/MM/yyyy HH:mm')}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
