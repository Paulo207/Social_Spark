import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 mb-6">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        Termos de Serviço
                    </h1>
                    <p className="text-gray-400">Última atualização: 29 de janeiro de 2026</p>
                </div>

                <div className="prose prose-invert prose-lg max-w-none">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Aceitação dos Termos</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Ao acessar e usar a plataforma Social Spark ("Serviço"), você concorda em cumprir e estar
                            vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos,
                            não poderá usar nosso Serviço.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Descrição do Serviço</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            A Social Spark é uma plataforma de gerenciamento de redes sociais que permite aos usuários:
                        </p>
                        <ul className="text-gray-300 space-y-2">
                            <li>• Agendar e publicar conteúdo em múltiplas redes sociais</li>
                            <li>• Analisar métricas e desempenho de suas contas</li>
                            <li>• Gerenciar múltiplas contas de redes sociais em um só lugar</li>
                            <li>• Utilizar recursos de inteligência artificial para otimização de conteúdo</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">3. Registro e Conta</h2>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">3.1 Elegibilidade</h3>
                        <p className="text-gray-300 mb-4">
                            Você deve ter pelo menos 18 anos de idade para usar este Serviço. Ao criar uma conta,
                            você declara que tem idade legal para celebrar um contrato vinculativo.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">3.2 Informações da Conta</h3>
                        <p className="text-gray-300 mb-4">Você concorda em:</p>
                        <ul className="text-gray-300 space-y-2">
                            <li>• Fornecer informações precisas, atuais e completas</li>
                            <li>• Manter a segurança de sua senha e conta</li>
                            <li>• Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                            <li>• Ser responsável por todas as atividades que ocorrem em sua conta</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Uso Aceitável</h2>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">4.1 Você Concorda em NÃO:</h3>
                        <ul className="text-gray-300 space-y-2 mb-6">
                            <li>• Violar qualquer lei ou regulamento aplicável</li>
                            <li>• Publicar conteúdo ilegal, ofensivo, difamatório ou prejudicial</li>
                            <li>• Fazer spam ou enviar mensagens não solicitadas</li>
                            <li>• Violar direitos de propriedade intelectual de terceiros</li>
                            <li>• Tentar obter acesso não autorizado ao Serviço</li>
                            <li>• Interferir ou interromper o funcionamento do Serviço</li>
                            <li>• Usar o Serviço para fins fraudulentos ou enganosos</li>
                            <li>• Revender ou redistribuir o Serviço sem autorização</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">4.2 Conformidade com Plataformas</h3>
                        <p className="text-gray-300">
                            Você deve cumprir os termos de serviço de todas as plataformas de redes sociais conectadas
                            (Instagram, Facebook, Twitter, LinkedIn, etc.).
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">5. Conteúdo do Usuário</h2>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">5.1 Propriedade</h3>
                        <p className="text-gray-300 mb-4">
                            Você mantém todos os direitos sobre o conteúdo que cria e publica através do Serviço.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">5.2 Licença para Nós</h3>
                        <p className="text-gray-300 mb-4">
                            Ao usar o Serviço, você nos concede uma licença mundial, não exclusiva, livre de royalties
                            para usar, armazenar, processar e exibir seu conteúdo exclusivamente para fornecer e melhorar
                            o Serviço.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">5.3 Responsabilidade</h3>
                        <p className="text-gray-300">
                            Você é o único responsável pelo conteúdo que publica. Não somos responsáveis por qualquer
                            conteúdo de usuário e não endossamos opiniões expressas por usuários.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">6. Planos e Pagamentos</h2>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">6.1 Assinaturas</h3>
                        <p className="text-gray-300 mb-4">
                            Oferecemos diferentes planos de assinatura. Os detalhes de cada plano, incluindo recursos
                            e preços, estão disponíveis em nosso site.
                        </p>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">6.2 Faturamento</h3>
                        <ul className="text-gray-300 space-y-2 mb-6">
                            <li>• As assinaturas são cobradas antecipadamente de forma recorrente</li>
                            <li>• Você autoriza cobranças automáticas no método de pagamento fornecido</li>
                            <li>• Os preços podem ser alterados mediante aviso prévio de 30 dias</li>
                        </ul>

                        <h3 className="text-xl font-semibold mb-3 text-purple-400">6.3 Cancelamento e Reembolsos</h3>
                        <ul className="text-gray-300 space-y-2">
                            <li>• Você pode cancelar sua assinatura a qualquer momento</li>
                            <li>• O cancelamento entra em vigor no final do período de faturamento atual</li>
                            <li>• Não oferecemos reembolsos para períodos parciais de assinatura</li>
                            <li>• Oferecemos garantia de reembolso de 14 dias para novos usuários</li>
                        </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">7. Propriedade Intelectual</h2>
                        <p className="text-gray-300 mb-4">
                            O Serviço e todo o seu conteúdo original, recursos e funcionalidades são de propriedade
                            exclusiva da Social Spark e estão protegidos por leis de direitos autorais, marcas registradas
                            e outras leis de propriedade intelectual.
                        </p>
                        <p className="text-gray-300">
                            Você não pode copiar, modificar, distribuir, vender ou alugar qualquer parte do Serviço
                            sem nossa permissão expressa por escrito.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">8. Limitação de Responsabilidade</h2>
                        <p className="text-gray-300 mb-4">
                            O Serviço é fornecido "como está" e "conforme disponível". Não garantimos que o Serviço
                            será ininterrupto, seguro ou livre de erros.
                        </p>
                        <p className="text-gray-300 mb-4">
                            Na extensão máxima permitida por lei, a Social Spark não será responsável por quaisquer
                            danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, mas não
                            se limitando a, perda de lucros, dados, uso ou outras perdas intangíveis.
                        </p>
                        <p className="text-gray-300">
                            Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">9. Indenização</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Você concorda em indenizar e isentar a Social Spark de qualquer reivindicação, dano,
                            obrigação, perda, responsabilidade, custo ou dívida, e despesas (incluindo honorários
                            advocatícios) decorrentes de: (a) seu uso do Serviço; (b) violação destes Termos;
                            (c) violação de direitos de terceiros.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">10. Rescisão</h2>
                        <p className="text-gray-300 mb-4">
                            Podemos suspender ou encerrar sua conta e acesso ao Serviço imediatamente, sem aviso prévio
                            ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar estes Termos.
                        </p>
                        <p className="text-gray-300">
                            Após a rescisão, seu direito de usar o Serviço cessará imediatamente. Se desejar encerrar
                            sua conta, você pode simplesmente descontinuar o uso do Serviço.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">11. Modificações do Serviço</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, o
                            Serviço (ou qualquer parte dele) com ou sem aviso prévio. Não seremos responsáveis perante
                            você ou terceiros por qualquer modificação, suspensão ou descontinuação do Serviço.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">12. Lei Aplicável</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar
                            suas disposições sobre conflito de leis. Qualquer disputa relacionada a estes Termos será
                            resolvida nos tribunais competentes do Brasil.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">13. Alterações nos Termos</h2>
                        <p className="text-gray-300 leading-relaxed">
                            Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos você
                            sobre alterações significativas por e-mail ou através de um aviso em nosso Serviço. O uso
                            continuado do Serviço após tais alterações constitui sua aceitação dos novos Termos.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                        <h2 className="text-2xl font-bold mb-4 text-white">14. Disposições Gerais</h2>
                        <ul className="text-gray-300 space-y-2">
                            <li>• <strong className="text-white">Acordo Integral:</strong> Estes Termos constituem o acordo integral entre você e a Social Spark</li>
                            <li>• <strong className="text-white">Renúncia:</strong> A falha em fazer cumprir qualquer direito não constitui renúncia</li>
                            <li>• <strong className="text-white">Divisibilidade:</strong> Se alguma disposição for considerada inválida, as demais permanecerão em vigor</li>
                            <li>• <strong className="text-white">Cessão:</strong> Você não pode ceder estes Termos sem nosso consentimento prévio por escrito</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold mb-4 text-white">15. Contato</h2>
                        <p className="text-gray-300 mb-4">
                            Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
                        </p>
                        <div className="text-gray-300 space-y-2">
                            <p>
                                <strong className="text-white">E-mail Legal:</strong>{' '}
                                <a href="mailto:legal@socialspark.app" className="text-purple-400 hover:text-purple-300">
                                    legal@socialspark.app
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
