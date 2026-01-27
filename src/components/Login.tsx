import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Instagram, Facebook, ShieldCheck } from 'lucide-react';

interface LoginProps {
    onLogin: () => void;
    onLoginGuest: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onLoginGuest }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md border-primary/20 shadow-2xl backdrop-blur-sm bg-card/80">
                <CardHeader className="text-center space-y-4 pb-8">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            Social Spark
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            Gerenciador profissional para redes sociais
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Button
                            className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                            onClick={onLogin}
                        >
                            <Instagram className="mr-2 w-5 h-5" />
                            Entrar com Instagram
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Ou</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-12 text-base font-medium"
                            onClick={onLogin}
                        >
                            <Facebook className="mr-2 w-5 h-5 text-blue-600" />
                            Entrar com Facebook
                        </Button>

                        <div className="relative pt-2">
                            <div className="relative flex justify-center text-xs">
                                <button
                                    onClick={onLoginGuest}
                                    className="text-muted-foreground hover:text-primary transition-colors underline decoration-dotted underline-offset-4"
                                >
                                    Login sem autenticação (Modo Desenvolvedor)
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-center text-muted-foreground px-4 leading-relaxed">
                        Ao continuar, você concorda em conectar sua conta do Meta para permitir o gerenciamento de suas postagens.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
