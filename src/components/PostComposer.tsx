import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    Image as ImageIcon,
    X,
    Instagram,
    Facebook,
    Send,
    Loader2,
    Video,
    Film
} from 'lucide-react';
import type { Post, Platform, SocialAccount } from '../types';
import { format } from 'date-fns';
import { savePost, publishPostNow } from '../services/api';
import { adaptImageForInstagram, getImageInfo, isAspectRatioValid } from '../utils/imageProcessor';
import { AlertCircle, Wand2, AlertTriangle } from 'lucide-react';
import { isPast } from 'date-fns';
import './PostComposer.css';

interface PostComposerProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (post: Omit<Post, 'id' | 'createdAt'>) => void;
    accounts: SocialAccount[];
    editPost?: Post;
}

export const PostComposer: React.FC<PostComposerProps> = ({
    isOpen,
    onClose,
    onSave,
    accounts,
    editPost
}) => {
    const [caption, setCaption] = useState(editPost?.caption || '');
    const [images, setImages] = useState<string[]>(editPost?.images || []);
    const [platform, setPlatform] = useState<Platform>(editPost?.platform || 'both');
    const [accountId, setAccountId] = useState(editPost?.accountId || accounts[0]?.id || '');
    const [scheduledDate, setScheduledDate] = useState(
        editPost?.scheduledDate ? format(editPost.scheduledDate, "yyyy-MM-dd'T'HH:mm") : ''
    );
    const [status, setStatus] = useState<Post['status']>(editPost?.status || 'scheduled');
    const [isPublishing, setIsPublishing] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [invalidRatios, setInvalidRatios] = useState<number[]>([]);
    const [isAdapting, setIsAdapting] = useState(false);

    const connectedAccounts = useMemo(() => accounts.filter(a => a.isConnected), [accounts]);
    const availableAccounts = useMemo(() => {
        return platform === 'both'
            ? connectedAccounts
            : connectedAccounts.filter(a => a.platform === platform);
    }, [platform, connectedAccounts]);

    const selectedAccount = useMemo(() => {
        return accounts.find(a => a.id === accountId);
    }, [accountId, accounts]);

    const isTokenExpired = useMemo(() => {
        if (!selectedAccount?.tokenExpiresAt) return false;
        return isPast(new Date(selectedAccount.tokenExpiresAt));
    }, [selectedAccount]);

    useEffect(() => {
        if (isOpen) {
            if (editPost) {
                // If editing, state is already set by initial state
            } else if (!editPost && availableAccounts.length > 0) {
                const isCurrentIdValid = availableAccounts.some(a => a.id === accountId);
                if (!accountId || !isCurrentIdValid) {
                    setAccountId(availableAccounts[0]?.id || '');
                }
            }
        }
    }, [isOpen, availableAccounts, accountId, editPost]);

    const maxCaptionLength = platform === 'instagram' ? 2200 : 63206;

    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        const currentImagesCount = images.length;

        for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const isVideo = file.type.startsWith('video/');

            if (!isVideo) {
                try {
                    const info = await getImageInfo(file);
                    const isInvalid = (platform === 'instagram' || platform === 'both') && !isAspectRatioValid(info.ratio);

                    if (isInvalid) {
                        setInvalidRatios(prev => [...prev, currentImagesCount + i]);
                    }
                } catch (err) {
                    console.warn("Could not get image info", err);
                }
            }

            const reader = new FileReader();
            await new Promise((resolve) => {
                reader.onloadend = () => {
                    setImages(prev => [...prev, reader.result as string]);
                    setImageFiles(prev => [...prev, file]);
                    resolve(null);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleAutoFix = async () => {
        if (invalidRatios.length === 0) return;

        setIsAdapting(true);
        try {
            const updatedImages = [...images];
            const updatedFiles = [...imageFiles];

            for (const index of invalidRatios) {
                // Skip if it's a video (though invalidRatios shouldn't have videos normally)
                if (updatedFiles[index].type.startsWith('video/')) continue;

                const result = await adaptImageForInstagram(imageFiles[index]);
                updatedImages[index] = result.dataUrl;
                updatedFiles[index] = result.file;
            }

            setImages(updatedImages);
            setImageFiles(updatedFiles);
            setInvalidRatios([]);
        } catch (error: any) {
            console.error('Error adapting images:', error);
            console.error('Stack:', error.stack);
            alert(`Erro ao adaptar imagens: ${error.message || error}`);
        } finally {
            setIsAdapting(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setInvalidRatios(prev => {
            return prev
                .filter(i => i !== index)
                .map(i => i > index ? i - 1 : i);
        });
    };

    const handleSubmit = () => {
        if (!caption || !accountId) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        if (status === 'scheduled' && !scheduledDate) {
            alert('Por favor, selecione uma data para agendamento');
            return;
        }

        const postData: Omit<Post, 'id' | 'createdAt'> = {
            caption,
            images,
            platform,
            accountId,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
            status,
            publishedAt: status === 'published' ? new Date() : undefined,
        };

        onSave(postData);
        handleClose();
    };

    const handlePublishNow = async () => {
        if (!caption || !accountId) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        setIsPublishing(true);
        try {
            const postData: Omit<Post, 'id' | 'createdAt'> = {
                caption,
                images,
                platform,
                accountId,
                scheduledDate: new Date(),
                status: 'draft',
            };

            const newPostData = {
                ...postData,
                id: editPost?.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                createdAt: editPost?.createdAt || new Date(),
            };

            const savedPost = await savePost(newPostData as Post);
            await publishPostNow(savedPost.id);

            alert('Postagem publicada com sucesso!');
            onSave(postData);
            handleClose();
        } catch (error: any) {
            console.error('Publishing failed:', error);
            const errorMsg = error.message || '';
            if (errorMsg.includes('aspect ratio')) {
                alert('Erro: Proporção da imagem não suportada pelo Instagram. Por favor, use o botão "Adaptar Auto" abaixo das imagens.');
            } else {
                alert(`Erro ao publicar: ${error.message}`);
            }
        } finally {
            setIsPublishing(false);
        }
    };

    const handleClose = () => {
        setCaption('');
        setImages([]);
        setPlatform('both');
        setScheduledDate('');
        setStatus('scheduled');
        onClose();
    };

    const isVideo = (index: number) => {
        const file = imageFiles[index];
        if (file) return file.type.startsWith('video/');

        const url = images[index];
        if (!url) return false;
        return url.startsWith('data:video') || /\.(mp4|mov|avi|wmv)$/i.test(url);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle>{editPost ? 'Editar Postagem' : 'Nova Postagem'}</DialogTitle>
                    <DialogDescription className="sr-only">
                        {editPost ? 'Edite os detalhes da sua postagem para redes sociais.' : 'Crie e agende uma nova postagem para Instagram e Facebook.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Form Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            {/* Media Upload */}
                            <div className="space-y-2">
                                <Label>Mídia (Foto ou Vídeo)</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={handleMediaUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <div className="p-3 bg-secondary rounded-full">
                                            <div className="flex gap-1">
                                                <ImageIcon size={20} className="text-primary" />
                                                <Video size={20} className="text-primary" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium">Clique ou arraste fotos ou vídeos aqui</p>
                                    </div>
                                </div>

                                {images.length > 0 && (
                                    <div className="space-y-4 mt-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            {images.map((img, index) => (
                                                <div
                                                    key={`img-${index}-${img.length}`}
                                                    className={`relative aspect-square rounded-md overflow-hidden group border ${invalidRatios.includes(index) ? 'border-destructive ring-2 ring-destructive/20' : ''
                                                        }`}
                                                >
                                                    {isVideo(index) ? (
                                                        <video src={img} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                    )}

                                                    {isVideo(index) && (
                                                        <div className="absolute top-1 left-1 p-1 bg-black/50 text-white rounded-full">
                                                            <Video size={10} />
                                                        </div>
                                                    )}

                                                    <button
                                                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    {invalidRatios.includes(index) && (
                                                        <div className="absolute bottom-0 left-0 right-0 bg-destructive/90 text-[10px] text-white py-0.5 text-center px-1 truncate">
                                                            Aspecto inválido
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {invalidRatios.length > 0 && (platform === 'instagram' || platform === 'both') && (
                                            <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-center gap-2 text-sm text-destructive font-medium">
                                                    <AlertCircle size={16} />
                                                    <span>Formato incompatível com o Instagram</span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="gap-2 h-8"
                                                    onClick={handleAutoFix}
                                                    disabled={isAdapting}
                                                >
                                                    {isAdapting ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                                                    Adaptar Auto
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Caption */}
                            <div className="space-y-2">
                                <Label>Legenda</Label>
                                <Textarea
                                    placeholder="Escreva sua legenda..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    maxLength={maxCaptionLength}
                                    className="min-h-[150px] resize-none"
                                />
                                <div className="text-xs text-right text-muted-foreground">
                                    {caption.length} / {maxCaptionLength}
                                </div>
                            </div>

                            {/* Platform Selection */}
                            <div className="space-y-2">
                                <Label>Plataforma</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant={platform === 'instagram' ? 'default' : 'outline'}
                                        onClick={() => setPlatform('instagram')}
                                        className="flex-1 gap-2"
                                    >
                                        <Instagram size={18} /> Instagram
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={platform === 'facebook' ? 'default' : 'outline'}
                                        onClick={() => setPlatform('facebook')}
                                        className="flex-1 gap-2"
                                    >
                                        <Facebook size={18} /> Facebook
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={platform === 'both' ? 'default' : 'outline'}
                                        onClick={() => setPlatform('both')}
                                        className="flex-1 gap-2"
                                    >
                                        <div className="flex gap-1">
                                            <Instagram size={16} />
                                            <Facebook size={16} />
                                        </div>
                                        Ambos
                                    </Button>
                                </div>
                            </div>

                            {/* Account Selection */}
                            <div className="space-y-2">
                                <Label>Conta</Label>
                                <Select value={accountId} onValueChange={setAccountId}>
                                    <SelectTrigger className={isTokenExpired ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Selecione uma conta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableAccounts.map(account => {
                                            const expired = account.tokenExpiresAt && isPast(new Date(account.tokenExpiresAt));
                                            return (
                                                <SelectItem key={account.id} value={account.id} disabled={expired}>
                                                    <div className="flex items-center gap-2">
                                                        {account.username} ({account.platform})
                                                        {expired && <span className="text-[10px] text-destructive bg-destructive/10 px-1 rounded">Expirada</span>}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {isTokenExpired && (
                                    <p className="text-xs text-destructive flex items-center gap-1 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle size={12} /> Esta conta está com o token expirado. Por favor, reconecte-a no Gerenciador de Contas.
                                    </p>
                                )}
                                {!isTokenExpired && selectedAccount?.tokenExpiresAt && (
                                    (() => {
                                        const hoursLeft = Math.floor((new Date(selectedAccount.tokenExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60));
                                        if (hoursLeft < 48) {
                                            return (
                                                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                                    <AlertTriangle size={12} /> O token desta conta expira logo (em {hoursLeft}h).
                                                </p>
                                            );
                                        }
                                        return null;
                                    })()
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Date & Time */}
                                <div className="space-y-2">
                                    <Label>Data e Hora</Label>
                                    <div className="relative">
                                        <Input
                                            type="datetime-local"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={status} onValueChange={(val) => setStatus(val as Post['status'])}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Rascunho</SelectItem>
                                            <SelectItem value="scheduled">Agendado</SelectItem>
                                            <SelectItem value="published">Publicado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Area (Sidebar) */}
                    <div className="w-[350px] bg-muted/30 p-6 overflow-y-auto hidden md:block">
                        <Label className="mb-4 block">Visualização</Label>
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                {/* Mock Header */}
                                <div className="p-3 flex items-center gap-2 border-b">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="h-3 w-24 bg-muted rounded"></div>
                                    </div>
                                    <div className="h-4 w-4 bg-muted rounded"></div>
                                </div>

                                {/* Content */}
                                <div className="aspect-square bg-muted flex items-center justify-center relative bg-black">
                                    {images.length > 0 ? (
                                        isVideo(0) ? (
                                            <video src={images[0]} controls className="w-full h-full object-contain" />
                                        ) : (
                                            <img src={images[0]} alt="Preview" className="w-full h-full object-cover" />
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                                            <Film size={32} />
                                            <span className="text-xs">Mídia</span>
                                        </div>
                                    )}
                                    {images.length > 1 && (
                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                            +{images.length - 1}
                                        </div>
                                    )}
                                </div>

                                {/* Mock Actions */}
                                <div className="p-3 flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-muted"></div>
                                    <div className="w-6 h-6 rounded-full bg-muted"></div>
                                    <div className="w-6 h-6 rounded-full bg-muted"></div>
                                </div>

                                {/* Caption Preview */}
                                <div className="px-3 pb-4">
                                    <div className="text-sm text-foreground">
                                        <span className="font-semibold mr-2">username</span>
                                        {caption || <span className="text-foreground/50 italic">Sua legenda aparecerá aqui...</span>}
                                    </div>
                                </div>

                                <div className="px-3 pb-3 border-t bg-muted/10">
                                    <div className="flex items-center gap-2 text-xs text-foreground/80">
                                        {platform === 'instagram' && <Instagram size={14} />}
                                        {platform === 'facebook' && <Facebook size={14} />}
                                        {platform === 'both' && (
                                            <>
                                                <Instagram size={14} />
                                                <Facebook size={14} />
                                            </>
                                        )}
                                        <span>•</span>
                                        {scheduledDate ? (
                                            format(new Date(scheduledDate), "d/MM/yy HH:mm")
                                        ) : (
                                            "Data não definida"
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t shrink-0">
                    <div className="flex w-full justify-between items-center sm:justify-end gap-2">
                        <Button variant="ghost" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button variant="secondary" onClick={handlePublishNow} disabled={isPublishing || isTokenExpired}>
                            {isPublishing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Send size={16} className="mr-2" />}
                            {isPublishing ? 'Enviando...' : 'Publicar Agora'}
                        </Button>
                        <Button onClick={handleSubmit} disabled={isPublishing || isTokenExpired}>
                            {editPost ? 'Salvar Alterações' : 'Agendar Postagem'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
