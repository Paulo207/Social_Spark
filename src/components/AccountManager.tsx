import React, { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Instagram, Facebook, CheckCircle, XCircle, Trash2, Loader2, Key, AlertCircle, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import type { SocialAccount } from '../types';
import { graphApiService, type GraphApiPage } from '../services/graphApi';
import { getSettings } from '../services/api';
import { differenceInHours, isPast, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './AccountManager.css';

interface AccountManagerProps {
    accounts: SocialAccount[];
    onAddAccount: (account: Omit<SocialAccount, 'id'>) => void;
    onRemoveAccount: (accountId: string) => void;
}

export const AccountManager: React.FC<AccountManagerProps> = ({
    accounts,
    onAddAccount,
    onRemoveAccount
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Manual Mode State
    const [platform, setPlatform] = useState<'instagram' | 'facebook'>('instagram');
    const [username, setUsername] = useState('');

    // API Mode State
    const [mode, setMode] = useState<'manual' | 'api'>('manual');
    const [apiToken, setApiToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [foundAccounts, setFoundAccounts] = useState<{ page: GraphApiPage, selected: boolean, type: 'facebook' | 'instagram', token: string, expiresIn?: number }[]>([]);

    // Load token when modal opens
    React.useEffect(() => {
        const loadToken = async () => {
            if (isModalOpen && !apiToken) {
                const settings = await getSettings();
                if (settings?.token) {
                    setApiToken(settings.token);
                }
            }
        };
        loadToken();
    }, [isModalOpen, apiToken]);

    const globalAlerts = useMemo(() => {
        const alerts: { type: 'error' | 'warning', message: string, accountId: string }[] = [];
        const now = new Date();

        accounts.forEach(acc => {
            if (acc.tokenExpiresAt) {
                const expiresAt = new Date(acc.tokenExpiresAt);
                if (isPast(expiresAt)) {
                    alerts.push({
                        type: 'error',
                        message: `Token da conta ${acc.username} expirou. Reconecte a conta.`,
                        accountId: acc.id
                    });
                } else {
                    const hoursLeft = differenceInHours(expiresAt, now);
                    if (hoursLeft < 48) {
                        alerts.push({
                            type: 'warning',
                            message: `Token da conta ${acc.username} expira em ${hoursLeft} horas.`,
                            accountId: acc.id
                        });
                    }
                }
            }
        });
        return alerts;
    }, [accounts]);

    const handleAddAccount = () => {
        if (!username) {
            alert('Por favor, insira um nome de usuário');
            return;
        }

        const newAccount: Omit<SocialAccount, 'id'> = {
            platform,
            username,
            profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            isConnected: true,
            followers: Math.floor(Math.random() * 50000) + 1000,
        };

        onAddAccount(newAccount);
        resetModal();
    };

    const handleFetchAccounts = async () => {
        let token = apiToken;
        if (!token) {
            // Try to load token from stored settings
            const settings = await getSettings();
            token = settings?.token || '';
            setApiToken(token);
        }
        if (!token) {
            setError('Por favor, insira um token de acesso');
            return;
        }

        setIsLoading(true);
        setError('');
        setFoundAccounts([]);

        try {
            const settings = await getSettings();
            let tokenToUse = token; // token from above logic
            let expiresIn: number | undefined;

            if (settings.appId && settings.appSecret) {
                try {
                    const exchangeData = await graphApiService.exchangeForLongLivedToken(token, settings.appId, settings.appSecret);
                    tokenToUse = exchangeData.access_token;
                    expiresIn = exchangeData.expires_in;
                } catch (exchangeError) {
                    console.warn('Falha na troca de token, tentando com token original', exchangeError);
                }
            }

            await graphApiService.validateToken(tokenToUse);
            const pages = await graphApiService.fetchAccounts(tokenToUse);

            const accountsFound: { page: GraphApiPage, selected: boolean, type: 'facebook' | 'instagram', token: string, expiresIn?: number }[] = [];

            pages.forEach(page => {
                // Add Facebook Page
                accountsFound.push({
                    page: page,
                    selected: true,
                    type: 'facebook',
                    token: page.access_token || tokenToUse, // Prefer page access token if available
                    expiresIn: page.access_token ? undefined : expiresIn // Only assume user token expiration if using user token
                });

                // Add Linked Instagram Account
                if (page.instagram_business_account) {
                    accountsFound.push({
                        page: page,
                        selected: true,
                        type: 'instagram',
                        token: tokenToUse, // User token usually needed here unless we have page token
                        expiresIn: expiresIn
                    });
                }
            });

            if (accountsFound.length === 0) {
                setError('Nenhuma conta encontrada vinculada a este token.');
            }

            setFoundAccounts(accountsFound);
        } catch (err: any) {
            setError(err.message || 'Erro ao buscar contas');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestToken = async () => {
        if (!apiToken.trim()) {
            setError('Por favor, insira um token de acesso primeiro');
            return;
        }

        setIsTesting(true);
        setError('');
        setSuccessMessage('');

        try {
            const validation = await graphApiService.validateToken(apiToken);
            if (validation.valid) {
                setSuccessMessage(`✅ Token válido! Conectado como: ${validation.name}`);
            } else {
                setError(`❌ Token inválido: ${validation.error}`);
            }
        } catch (err: any) {
            setError('Erro ao testar token: ' + err.message);
        } finally {
            setIsTesting(false);
        }
    };

    const handleImportAccounts = () => {
        const selected = foundAccounts.filter(a => a.selected);

        selected.forEach(item => {
            let newAccount: Omit<SocialAccount, 'id'>;
            const tokenExpiresAt = item.expiresIn ? new Date(Date.now() + item.expiresIn * 1000) : undefined;

            if (item.type === 'facebook') {
                newAccount = {
                    platform: 'facebook',
                    username: item.page.name,
                    profileImage: item.page.picture?.data.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.page.name}`,
                    isConnected: true,
                    followers: item.page.fan_count || 0,
                    accessToken: item.token,
                    originalResponse: item.page,
                    pageId: item.page.id,
                    lastSync: new Date(),
                    tokenExpiresAt
                };
            } else {
                // Instagram
                newAccount = {
                    platform: 'instagram',
                    username: item.page.instagram_business_account?.username || item.page.name,
                    profileImage: item.page.instagram_business_account?.profile_picture_url || item.page.picture?.data.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.page.name}`,
                    isConnected: true,
                    followers: item.page.instagram_business_account?.followers_count || 0,
                    accessToken: item.token,
                    originalResponse: item.page,
                    igUserId: item.page.instagram_business_account?.id,
                    lastSync: new Date(),
                    tokenExpiresAt
                };
            }

            onAddAccount(newAccount);
        });

        setIsModalOpen(false);
        resetModal();
    };


    const resetModal = () => {
        // Reset state
        setUsername('');
        setApiToken('');
        setFoundAccounts([]);
        setError('');
        setMode('manual');
        setIsModalOpen(false);
    };

    const toggleAccountSelection = (index: number) => {
        setFoundAccounts(prev => prev.map((item, i) =>
            i === index ? { ...item, selected: !item.selected } : item
        ));
    };

    const getPlatformIcon = (platform: 'instagram' | 'facebook') => {
        return platform === 'instagram' ? <Instagram size={24} /> : <Facebook size={24} />;
    };

    const getPlatformColor = (platform: 'instagram' | 'facebook') => {
        return platform === 'instagram' ? 'var(--color-secondary)' : 'var(--color-info)';
    };

    const getExpirationStatus = (account: SocialAccount) => {
        if (!account.tokenExpiresAt) return null;
        const now = new Date();
        const expiresAt = new Date(account.tokenExpiresAt);

        if (isPast(expiresAt)) {
            return {
                status: 'expired',
                label: 'Token Expirado',
                color: 'text-red-600',
                bg: 'bg-red-50',
                icon: <AlertCircle size={14} className="mr-1" />
            };
        }

        const hoursLeft = differenceInHours(expiresAt, now);
        if (hoursLeft < 48) {
            return {
                status: 'warning',
                label: `Expira em ${hoursLeft}h`,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                icon: <AlertTriangle size={14} className="mr-1" />
            };
        }

        return {
            status: 'ok',
            label: `Expira em ${formatDistanceToNow(expiresAt, { locale: ptBR })}`,
            color: 'text-green-600',
            bg: 'bg-green-50',
            icon: <CheckCircle size={14} className="mr-1" />
        };
    };

    return (
        <div className="account-manager">
            <div className="account-header">
                <div>
                    <h1 className="gradient-text">Contas Conectadas</h1>
                    <p className="account-subtitle">Gerencie suas contas de redes sociais</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                >
                    <div className="flex items-center gap-2">
                        <Plus size={20} />
                        Adicionar Conta
                    </div>
                </Button>
            </div>

            {globalAlerts.length > 0 && (
                <div className="mb-6 space-y-2">
                    {globalAlerts.map((alert, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-lg flex items-center justify-between border ${alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}
                        >
                            <div className="flex items-center gap-3">
                                {alert.type === 'error' ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
                                <span className="font-medium">{alert.message}</span>
                            </div>
                            <Button
                                variant={alert.type === 'error' ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => setIsModalOpen(true)}
                                className={alert.type === 'warning' ? 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300' : ''}
                            >
                                <RefreshCw size={14} className="mr-2" /> Reconectar
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <div className="accounts-grid">
                {accounts.map(account => {
                    const tokenStatus = getExpirationStatus(account);

                    return (
                        <Card key={account.id} className={`account-card ${tokenStatus?.status === 'expired' ? 'border-red-300 ring-2 ring-red-100' : ''}`}>
                            <CardContent className="p-6">
                                <div className="account-card-header">
                                    <div
                                        className="account-platform-badge"
                                        style={{ background: getPlatformColor(account.platform) }}
                                    >
                                        {getPlatformIcon(account.platform)}
                                    </div>
                                    <button
                                        className="account-remove-btn"
                                        onClick={() => onRemoveAccount(account.id)}
                                        title="Remover conta"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="account-profile">
                                    <img
                                        src={account.profileImage}
                                        alt={account.username}
                                        className="account-avatar"
                                    />
                                    <div className="account-title-container">
                                        <h3 className="account-username">{account.username}</h3>
                                        {account.isConnected && <div className="status-led-indicator" title="Ativo" />}
                                    </div>
                                    <p className="account-platform-name">
                                        {account.platform === 'instagram' ? 'Instagram' : 'Facebook'}
                                    </p>
                                </div>

                                <div className="account-stats">
                                    <div className="account-stat">
                                        <p className="stat-value">{account.followers?.toLocaleString() || 0}</p>
                                        <p className="stat-label">Seguidores</p>
                                    </div>
                                </div>

                                <div className="account-status space-y-2">
                                    {account.isConnected ? (
                                        <div className="status-badge-group">
                                            <div className="status-badge status-connected">
                                                <CheckCircle size={16} />
                                                Conectado
                                            </div>
                                            {account.lastSync && (
                                                <span className="last-sync-text">
                                                    Sincronizado: {new Date().getTime() - new Date(account.lastSync).getTime() < 60000
                                                        ? 'agora'
                                                        : new Date(account.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="status-badge status-disconnected">
                                            <XCircle size={16} />
                                            Desconectado
                                        </div>
                                    )}

                                    {/* Token Expiration Status */}
                                    {tokenStatus && (
                                        <div className={`flex items-center text-xs px-2 py-1.5 rounded-md ${tokenStatus.bg} ${tokenStatus.color}`}>
                                            {tokenStatus.icon}
                                            <span className="font-medium">{tokenStatus.label}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {accounts.length === 0 && (
                    <Card className="empty-accounts">
                        <CardContent className="p-8 text-center">
                            <p>Nenhuma conta conectada</p>
                            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                                Conectar primeira conta
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Add Account Dialog */}
            <Dialog open={isModalOpen} onOpenChange={(open) => !open && resetModal()}>
                <DialogContent className={mode === 'api' && foundAccounts.length > 0 ? "sm:max-w-2xl" : "sm:max-w-md"}>
                    <DialogHeader>
                        <DialogTitle>Adicionar Conta</DialogTitle>
                        <DialogDescription className="sr-only">
                            Conecte suas contas do Facebook e Instagram para começar a agendar.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="add-account-form pt-4">
                        <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg w-full">
                            <button
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'manual' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setMode('manual')}
                            >
                                Manual (Exemplo)
                            </button>
                            <button
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'api' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                onClick={() => setMode('api')}
                            >
                                Graph API Import
                            </button>
                        </div>

                        {mode === 'manual' ? (
                            <>
                                <div className="platform-selection">
                                    <Label className="input-label">Plataforma</Label>
                                    <div className="platform-options">
                                        <button
                                            className={`platform-option ${platform === 'instagram' ? 'active' : ''}`}
                                            onClick={() => setPlatform('instagram')}
                                        >
                                            <Instagram size={24} />
                                            Instagram
                                        </button>
                                        <button
                                            className={`platform-option ${platform === 'facebook' ? 'active' : ''}`}
                                            onClick={() => setPlatform('facebook')}
                                        >
                                            <Facebook size={24} />
                                            Facebook
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <Label className="text-sm font-medium">Nome de Usuário</Label>
                                    <Input
                                        placeholder="@seu_usuario"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>

                                <DialogFooter className="mt-6">
                                    <Button variant="ghost" onClick={resetModal}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleAddAccount}>
                                        Conectar Conta
                                    </Button>
                                </DialogFooter>
                            </>
                        ) : (
                            <div className="space-y-4">
                                {!foundAccounts.length ? (
                                    <>
                                        <div className="account-instructions mb-4">
                                            <h4 className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
                                                <Key size={16} /> 📋 Como obter seus tokens:
                                            </h4>
                                            <ol className="text-xs space-y-2 list-decimal list-inside text-muted-foreground bg-secondary/30 p-4 rounded-lg">
                                                <li>Acesse o <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="underline font-medium">Graph API Explorer</a>.</li>
                                                <li>Selecione seu App no dropdown e gere um Token.</li>
                                                <li>Certifique-se de incluir <code className="bg-secondary px-1 rounded">instagram_basic</code> e <code className="bg-secondary px-1 rounded">pages_show_list</code>.</li>
                                                <li>Copie o token e cole abaixo.</li>
                                            </ol>
                                            <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded flex items-start gap-2">
                                                <AlertCircle size={14} className="text-amber-600 mt-0.5" />
                                                <p className="text-[10px] text-amber-700">
                                                    <strong>Importante:</strong> Se configurado nas Configurações, o app tentará gerar automaticamente um token de longa duração (60 dias).
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="token" className="text-sm font-medium">User Access Token</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="token"
                                                    placeholder="EAA..."
                                                    value={apiToken}
                                                    onChange={(e) => setApiToken(e.target.value)}
                                                    className="font-mono text-xs"
                                                    type="password"
                                                />
                                                <Button
                                                    variant="outline"
                                                    onClick={handleTestToken}
                                                    disabled={isTesting || !apiToken}
                                                    className="shrink-0 gap-2"
                                                >
                                                    {isTesting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                                    Testar
                                                </Button>
                                            </div>
                                            {successMessage && <p className="text-xs text-green-600 font-medium">{successMessage}</p>}
                                            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                                        </div>

                                        <DialogFooter className="mt-4">
                                            <Button variant="ghost" onClick={resetModal}>
                                                Cancelar
                                            </Button>
                                            <Button onClick={handleFetchAccounts} disabled={isLoading}>
                                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Buscar Contas
                                            </Button>
                                        </DialogFooter>
                                    </>
                                ) : (
                                    <>
                                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                                            {foundAccounts.map((item, index) => (
                                                <div
                                                    key={`${item.page.id}-${item.type}`}
                                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${item.selected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                                                    onClick={() => toggleAccountSelection(index)}
                                                >
                                                    <div className={`w-4 h-4 mr-3 rounded-full border flex items-center justify-center ${item.selected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                                                        {item.selected && <CheckCircle size={10} className="text-primary-foreground" />}
                                                    </div>

                                                    <div className="w-10 h-10 rounded-full bg-muted mr-3 overflow-hidden flex-shrink-0">
                                                        {item.type === 'facebook' && item.page.picture?.data.url ? (
                                                            <img src={item.page.picture.data.url} alt={item.page.name} className="w-full h-full object-cover" />
                                                        ) : item.type === 'instagram' && item.page.instagram_business_account?.profile_picture_url ? (
                                                            <img src={item.page.instagram_business_account.profile_picture_url} alt={item.page.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                                {item.type === 'facebook' ? <Facebook size={16} /> : <Instagram size={16} />}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm truncate">
                                                            {item.type === 'facebook' ? item.page.name : item.page.instagram_business_account?.username}
                                                        </h4>
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            {item.type === 'facebook' ? <Facebook size={12} className="mr-1" /> : <Instagram size={12} className="mr-1" />}
                                                            {item.type === 'facebook' ? 'Facebook Page' : 'Instagram Business'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <DialogFooter className="mt-4">
                                            <Button variant="ghost" onClick={() => setFoundAccounts([])}>
                                                Voltar
                                            </Button>
                                            <Button onClick={handleImportAccounts}>
                                                Importar ({foundAccounts.filter(a => a.selected).length})
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
