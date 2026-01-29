import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/50 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-6 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-6 py-16 max-w-4xl">
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Política de Privacidade
                    </h1>
                    <p className="text-gray-400">Última atualização: 29 de janeiro de 2026</p>
                </div>

                <div className="prose prose-invert prose-lg max-w-none">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Introdução</h2>
                        <p className="text-gray-300 leading-relaxed">
                            A Social Spark ("nós", "nosso" ou "nos") está comprometida em proteger sua privacidade.
                            Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas
                            informações quando você usa nossa plataforma de gerenciamento de redes sociais.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Informações que Coletamos</h2>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">2.1 Informações Fornecidas por Você</h3>
                        <ul className="text-gray-300 space-y-2 mb-6">
                            <li>• Nome, e-mail e informações de contato</li>
                            <li>• Credenciais de contas de redes sociais (tokens de acesso)</li>
                            <li>• Conteúdo que você cria e agenda através da plataforma</li>
                            <li>• Informações de pagamento (processadas por terceiros seguros)</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">2.2 Informações Coletadas Automaticamente</h3>
                        <ul className="text-gray-300 space-y-2">
                            <li>• Dados de uso da plataforma (páginas visitadas, recursos utilizados)</li>
                            <li>• Informações do dispositivo (tipo, sistema operacional, navegador)</li>
                            <li>• Endereço IP e dados de localização</li>
                            <li>• Cookies e tecnologias similares</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">3. Como Usamos Suas Informações</h2>
                        <p className="text-gray-300 mb-4">Utilizamos suas informações para:</p>
                        <ul className="text-gray-300 space-y-2">
                            <li>• Fornecer, operar e manter nossa plataforma</li>
                            <li>• Processar e gerenciar suas publicações em redes sociais</li>
                            <li>• Melhorar, personalizar e expandir nossos serviços</li>
                            <li>• Comunicar com você sobre atualizações, suporte e marketing</li>
                            <li>• Analisar métricas e gerar insights sobre suas redes sociais</li>
                            <li>• Detectar, prevenir e resolver problemas técnicos ou de segurança</li>
                            <li>• Cumprir obrigações legais e regulatórias</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Compartilhamento de Informações</h2>
                        <p className="text-gray-300 mb-4">Podemos compartilhar suas informações com:</p>
                        <ul className="text-gray-300 space-y-2">
                            <li>• <strong className="text-white">Plataformas de Redes Sociais:</strong> Para publicar conteúdo em seu nome</li>
                            <li>• <strong className="text-white">Provedores de Serviços:</strong> Que nos auxiliam na operação da plataforma</li>
                            <li>• <strong className="text-white">Processadores de Pagamento:</strong> Para processar transações</li>
                            <li>• <strong className="text-white">Autoridades Legais:</strong> Quando exigido por lei ou para proteger nossos direitos</li>
                        </ul>
                        <p className="text-gray-300 mt-4">
                            <strong className="text-white">Não vendemos</strong> suas informações pessoais a terceiros.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">5. Segurança dos Dados</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger
                            suas informações contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
                        </p>
                        <ul className="text-gray-300 space-y-2 mt-4">
                            <li>• Criptografia de dados em trânsito e em repouso</li>
                            <li>• Controles de acesso rigorosos</li>
                            <li>• Monitoramento contínuo de segurança</li>
                            <li>• Auditorias regulares de segurança</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">6. Seus Direitos</h2>
                        <p className="text-gray-300 mb-4">Você tem o direito de:</p>
                        <ul className="text-gray-300 space-y-2">
                            <li>• Acessar suas informações pessoais</li>
                            <li>• Corrigir dados imprecisos ou incompletos</li>
                            <li>• Solicitar a exclusão de suas informações</li>
                            <li>• Exportar seus dados em formato portável</li>
                            <li>• Opor-se ao processamento de suas informações</li>
                            <li>• Revogar consentimento a qualquer momento</li>
                        </ul>
                        <p className="text-gray-300 mt-4">
                            Para exercer esses direitos, entre em contato conosco através do e-mail:
                            <a href="mailto:privacy@socialspark.app" className="text-purple-400 hover:text-purple-300 ml-1">
                                privacy@socialspark.app
                            </a>
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">7. Cookies e Tecnologias Similares</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso
                            da plataforma e personalizar conteúdo. Você pode controlar o uso de cookies através das
                            configurações do seu navegador.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">8. Retenção de Dados</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos
                            descritos nesta política, a menos que um período de retenção mais longo seja exigido ou
                            permitido por lei.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">9. Transferências Internacionais</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Suas informações podem ser transferidas e mantidas em servidores localizados fora do seu
                            país de residência. Garantimos que tais transferências sejam realizadas de acordo com as
                            leis de proteção de dados aplicáveis.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">10. Menores de Idade</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Nossa plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente
                            informações de menores. Se você acredita que coletamos informações de um menor, entre em
                            contato conosco imediatamente.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">11. Alterações nesta Política</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre
                            quaisquer alterações significativas através de e-mail ou aviso em nossa plataforma. O uso
                            continuado da plataforma após tais alterações constitui sua aceitação da política atualizada.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold mb-4 text-white">12. Contato</h2>
                        <p className="text-gray-300 mb-4">
                            Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco:
                        </p>
                        <div className="text-gray-300 space-y-2">
                            <p>
                                <strong className="text-white">E-mail:</strong>{' '}
                                <a href="mailto:privacy@socialspark.app" className="text-purple-400 hover:text-purple-300">
                                    privacy@socialspark.app
                                </a>
                            </p>
                            <p>
                                <strong className="text-white">E-mail de Suporte:</strong>{' '}
                                <a href="mailto:support@socialspark.app" className="text-purple-400 hover:text-purple-300">
                                    support@socialspark.app
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-xl py-8">
                <div className="container mx-auto px-6 text-center text-gray-400 text-sm">
                    <p>© 2026 Social Spark. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};
