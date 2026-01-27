import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getSettings, saveSettings } from '../services/api';
import { Save, Shield, Settings as SettingsIcon, Zap, Image as ImageIcon, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const Settings: React.FC = () => {
    const [appId, setAppId] = useState('');
    const [appSecret, setAppSecret] = useState('');
    const [token, setToken] = useState('');
    const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
    const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('');
    const [message, setMessage] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);
    const [isPremium] = useState(true); // Simulando plano premium

    useEffect(() => {
        getSettings().then(settings => {
            setAppId(settings.appId || '');
            setAppSecret(settings.appSecret || '');
            setToken(settings.token || '');
            setCloudinaryCloudName(settings.cloudinaryCloudName || '');
            setCloudinaryUploadPreset(settings.cloudinaryUploadPreset || '');

            if (settings.appId && settings.appSecret) {
                setIsConfigured(true);
            }
        });
    }, []);

    const handleSave = async () => {
        const currentSettings = await getSettings();
        await saveSettings({
            ...currentSettings,
            appId,
            appSecret,
            token,
            cloudinaryCloudName,
            cloudinaryUploadPreset
        });

        setIsConfigured(!!appId && !!appSecret);
        setMessage('Configurações salvas com sucesso!');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <SettingsIcon size={24} />
                        </div>
                        <h1 className="text-3xl font-bold gradient-text">Configurações</h1>
                    </div>
                    <p className="text-muted-foreground ml-1">Gerencie as credenciais e conexões do Social Spark</p>
                </div>

                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-secondary text-sm font-medium">
                        {isPremium ? (
                            <>
                                <Zap size={14} className="text-amber-500 fill-amber-500" />
                                <span className="text-amber-700">Plano Premium</span>
                            </>
                        ) : (
                            <span className="text-muted-foreground">Plano Free</span>
                        )}
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${isConfigured ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-red-500/10 border-red-500/20 text-red-700'}`}>
                        {isConfigured ? (
                            <>
                                <CheckCircle size={14} />
                                API Configurada
                            </>
                        ) : (
                            <>
                                <AlertCircle size={14} />
                                API Pendente
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-primary/10 shadow-lg shadow-primary/5">
                        <CardHeader className="border-b bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Shield className="text-primary" size={20} />
                                <CardTitle>Meta Graph API</CardTitle>
                            </div>
                            <CardDescription>
                                Credenciais do aplicativo no Facebook Developers. Essencial para publicação automática.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        App ID
                                        <div className="group relative">
                                            <Info size={12} className="text-muted-foreground cursor-help" />
                                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-popover text-popover-foreground text-[10px] rounded border shadow-xl z-50">
                                                ID numérico do seu aplicativo no Meta for Developers.
                                            </div>
                                        </div>
                                    </label>
                                    <Input
                                        placeholder="Ex: 1234567890"
                                        value={appId}
                                        onChange={(e) => setAppId(e.target.value)}
                                        className="bg-muted/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">App Secret</label>
                                    <Input
                                        placeholder="Ex: a1b2c3d4e5..."
                                        type="password"
                                        value={appSecret}
                                        onChange={(e) => setAppSecret(e.target.value)}
                                        className="bg-muted/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">User Access Token (Curto Prazo)</label>
                                <Input
                                    placeholder="EAAP..."
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    className="font-mono text-xs bg-muted/30"
                                />
                                <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                                    <Info size={12} className="shrink-0 mt-0.5" />
                                    <span>Se fornecido com App ID e Secret, o app tentará converter para um token de 60 dias automaticamente.</span>
                                </p>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <Button onClick={handleSave} className="gap-2 px-6">
                                    <Save size={16} />
                                    Salvar Credenciais API
                                </Button>
                                {message && (
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                                        <CheckCircle size={16} />
                                        {message}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/10 shadow-lg shadow-primary/5">
                        <CardHeader className="border-b bg-muted/30">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="text-primary" size={20} />
                                <CardTitle>Imagens & Mídia</CardTitle>
                            </div>
                            <CardDescription>
                                Configurações do Cloudinary para suporte a postagem do Instagram.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Cloud Name</label>
                                    <Input
                                        placeholder="Ex: dxyz12345"
                                        value={cloudinaryCloudName}
                                        onChange={(e) => setCloudinaryCloudName(e.target.value)}
                                        className="bg-muted/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Upload Preset (Unsigned)</label>
                                    <Input
                                        placeholder="Ex: ml_default"
                                        value={cloudinaryUploadPreset}
                                        onChange={(e) => setCloudinaryUploadPreset(e.target.value)}
                                        className="bg-muted/30"
                                    />
                                </div>
                            </div>
                            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-start gap-3">
                                <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    O Instagram exige que imagens enviadas via API estejam hospedadas em uma URL pública acessível. O Social Spark usa o Cloudinary para garantir que suas fotos locais possam ser publicadas no Instagram.
                                </p>
                            </div>
                            <div className="pt-2">
                                <Button onClick={handleSave} variant="secondary" className="gap-2">
                                    <Save size={16} />
                                    Salvar Configurações de Mídia
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Dicas Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="p-3 bg-background/60 rounded border">
                                <p className="font-semibold text-xs uppercase text-muted-foreground mb-1">Passo 1: Meta Dev</p>
                                <p className="text-xs">Pegue o ID e Secret em <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" className="underline font-medium">Meta for Devs</a>.</p>
                            </div>
                            <div className="p-3 bg-background/60 rounded border">
                                <p className="font-semibold text-xs uppercase text-muted-foreground mb-1">Passo 2: Token</p>
                                <p className="text-xs">Gere um User Token no Explorer com <code>instagram_basic</code> e <code>pages_show_list</code>.</p>
                            </div>
                            <div className="p-3 bg-background/60 rounded border">
                                <p className="font-semibold text-xs uppercase text-muted-foreground mb-1">Passo 3: Cloudinary</p>
                                <p className="text-xs">Configure um "Unsigned Preset" em <a href="https://cloudinary.com/" target="_blank" rel="noreferrer" className="underline font-medium">Cloudinary Settings</a>.</p>
                            </div>
                            <div className="mt-4 p-4 bg-primary text-primary-foreground rounded-xl shadow-lg">
                                <p className="font-bold flex items-center gap-2 mb-2">
                                    <Zap size={16} />
                                    Suporte Premium
                                </p>
                                <p className="text-xs opacity-90">
                                    Precisa de ajuda com as configurações? Nossa equipe pode configurar tudo para você via acesso remoto.
                                </p>
                                <Button size="sm" variant="secondary" className="w-full mt-3 text-[10px] h-8 bg-white/20 border-white/30 text-white hover:bg-white/30">
                                    Abrir Ticket de Suporte
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
