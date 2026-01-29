
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ShieldCheck, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import PhoneInput from 'react-phone-number-input';

interface LoginProps {
    onLogin: (identifier: string, password: string) => Promise<boolean>;
    onRegister: (name: string, password: string, email?: string, phone?: string) => Promise<boolean>;
    onLoginGuest: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister, onLoginGuest }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form States
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmitLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const identifier = email || phone;
        if (!identifier || !password) {
            setError('Preencha os campos obrigatórios.');
            setIsLoading(false);
            return;
        }

        try {
            const success = await onLogin(identifier, password);
            if (!success) {
                // Error is handled by calling component or hook usually, but here we can set generic
                // Actually useAuth sets internal error but returns boolean.
                // For better UX, useAuth could throw or return error string.
                // Assuming boolean false means generic error for now if not captured globally.
                setError('Credenciais inválidas ou erro no servidor.');
            }
        } catch (err) {
            setError('Ocorreu um erro ao tentar entrar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!name || !password || (!email && !phone)) {
            setError('Preencha os campos obrigatórios.');
            setIsLoading(false);
            return;
        }

        try {
            const success = await onRegister(name, password, email, phone);
            if (!success) {
                setError('Falha ao cadastrar. Verifique os dados ou tente outro email/telefone.');
            }
        } catch (err) {
            setError('Ocorreu um erro ao cadastrar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md border-primary/20 shadow-2xl backdrop-blur-sm bg-card/80">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            Social Spark
                        </CardTitle>
                        <CardDescription>
                            Acesse sua conta para continuar
                        </CardDescription>
                    </div>
                </CardHeader>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 px-6">
                        <TabsTrigger value="login">Entrar</TabsTrigger>
                        <TabsTrigger value="register">Cadastrar</TabsTrigger>
                    </TabsList>

                    <CardContent className="pt-6">
                        <TabsContent value="login">
                            <form onSubmit={handleSubmitLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-identifier">Email ou Telefone</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="login-identifier"
                                            placeholder="exemplo@email.com"
                                            className="pl-9"
                                            value={email} // Simpler to just use email state for identifier input for now, or unified state
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="login-password">Senha</Label>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="login-password"
                                            type="password"
                                            className="pl-9"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Entrar
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={handleSubmitRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reg-name">Nome Completo</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="reg-name"
                                            placeholder="Seu nome"
                                            className="pl-9"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reg-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="reg-email"
                                            type="email"
                                            placeholder="seumail@exemplo.com"
                                            className="pl-9"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reg-phone">Telefone (Opcional)</Label>
                                    <div className="phone-input-custom">
                                        <PhoneInput
                                            international
                                            defaultCountry="BR"
                                            value={phone}
                                            onChange={setPhone}
                                            placeholder="Digite seu telefone"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">Senha</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="reg-password"
                                            type="password"
                                            className="pl-9"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Criar Conta
                                </Button>
                            </form>
                        </TabsContent>
                    </CardContent>

                    <CardFooter className="justify-center border-t p-4 bg-muted/20">
                        <button
                            onClick={onLoginGuest}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors underline decoration-dotted underline-offset-4"
                        >
                            Modo Desenvolvedor (Guest)
                        </button>
                    </CardFooter>
                </Tabs>
            </Card>
        </div>
    );
};
