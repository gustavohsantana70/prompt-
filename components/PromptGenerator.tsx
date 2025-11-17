import React, { useState } from 'react';
import { generateAppPrompt } from '../services/geminiService';
import type { GeneratedPrompt, PromptType, Document } from '../types';
import { 
    SparkleIcon, ClipboardIcon, ClipboardCheckIcon, CodeIcon, GlobeAltIcon, 
    CheckCircleIcon, ArrowDownTrayIcon, PromptEngineIcon
} from './icons';

const techFrameworks: Record<string, string[]> = {
    'JavaScript': ['React', 'Angular', 'Vue.js', 'Next.js', 'Svelte', 'SvelteKit', 'NestJS + React', 'Solid.js', 'Astro'],
    'TypeScript': ['React', 'Angular', 'Vue.js', 'Next.js', 'Svelte', 'SvelteKit', 'NestJS + React', 'Solid.js', 'Astro'],
    'Python': ['Django', 'Flask', 'FastAPI'],
    'Java': ['Spring', 'JavaFX'],
    'C#': ['.NET', 'ASP.NET Core'],
    'C++': [],
    'Go': ['Gin'],
    'Ruby': ['Ruby on Rails'],
    'PHP': ['Laravel', 'Symfony'],
};

interface PromptGeneratorProps {
    onSaveDocument: (prompt: GeneratedPrompt) => void;
    prds: Document[];
}

export const PromptGenerator: React.FC<PromptGeneratorProps> = ({ onSaveDocument, prds }) => {
    // Form State
    const [selectedPrdId, setSelectedPrdId] = useState('');
    const [promptType, setPromptType] = useState<PromptType>('Aplicativo');
    const [technology, setTechnology] = useState('');
    const [framework, setFramework] = useState('');
    const [specialRequirements, setSpecialRequirements] = useState('');
    
    // UI State
    const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(null);

    // API State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    const handleGenerate = async () => {
        const selectedPrd = prds.find(p => p.id === selectedPrdId);
        if (!selectedPrd) return;
        
        setIsLoading(true);
        setError(null);
        setGeneratedPrompt(null);
        setCopied(false);
        setShowSaveSuccess(false);
        
        try {
            const newPromptText = await generateAppPrompt({
                prdContent: selectedPrd.content,
                promptType,
                technology,
                framework,
                specialRequirements,
            });

            const newPrompt: GeneratedPrompt = {
                id: `p-${Date.now()}`,
                prdId: selectedPrd.id,
                title: `Prompt ${promptType}: ${selectedPrd.title.replace('PRD: ', '')}`,
                type: promptType,
                createdAt: new Intl.DateTimeFormat('pt-BR').format(new Date()),
                prompt: newPromptText,
            };
            setGeneratedPrompt(newPrompt);
            
            // Automatically save the document
            onSaveDocument(newPrompt);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 3000);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isGenerateDisabled = !selectedPrdId || !technology || isLoading;
    const buttonIcon = promptType === 'Aplicativo' ? <CodeIcon className="w-5 h-5" /> : <GlobeAltIcon className="w-5 h-5" />;

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                {/* Left Column: Generator Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                    <div className="space-y-1 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <PromptEngineIcon className="w-6 h-6 text-indigo-500" />
                            Gerar Prompt para Ferramentas de IA
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                           Transforme seu PRD em prompts otimizados para ferramentas de criação de aplicativos com IA (como Lovable).
                        </p>
                    </div>

                    <div className="space-y-4 flex-grow">
                        <div>
                            <label htmlFor="prd-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selecione um PRD</label>
                            <select id="prd-select" value={selectedPrdId} onChange={e => setSelectedPrdId(e.target.value)} className="w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5">
                                <option value="" disabled>Escolha um PRD para gerar o prompt</option>
                                {prds.map(prd => <option key={prd.id} value={prd.id}>{prd.title}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Prompt</label>
                            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                <button onClick={() => setPromptType('Aplicativo')} className={`w-1/2 flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-md transition-colors ${ promptType === 'Aplicativo' ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' }`}><CodeIcon className="w-4 h-4" />Aplicativo</button>
                                <button onClick={() => setPromptType('Landing Page')} className={`w-1/2 flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-md transition-colors ${ promptType === 'Landing Page' ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' }`}><GlobeAltIcon className="w-4 h-4" />Landing Page</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tech-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tecnologia Frontend</label>
                                <select id="tech-select" value={technology} onChange={e => { setTechnology(e.target.value); setFramework(''); }} className="w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5">
                                    <option value="" disabled>Selecione a tecnologia</option>
                                    {Object.keys(techFrameworks).map(tech => <option key={tech} value={tech}>{tech}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="framework-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Framework/Biblioteca</label>
                                <select id="framework-select" value={framework} onChange={e => setFramework(e.target.value)} disabled={!technology || techFrameworks[technology]?.length === 0} className="w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5 disabled:bg-gray-100 dark:disabled:bg-gray-700">
                                    <option value="">{technology ? 'Selecione o framework' : 'Selecione uma tecnologia primeiro'}</option>
                                    {technology && techFrameworks[technology]?.map(fw => <option key={fw} value={fw}>{fw}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="special-requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requisitos Especiais</label>
                            <textarea
                                id="special-requirements"
                                placeholder="Ex: Funcionalidades específicas, estilo visual, restrições técnicas, integrações necessárias (limite de 2.000 caracteres)..."
                                value={specialRequirements}
                                onChange={e => setSpecialRequirements(e.target.value)}
                                rows={5}
                                className="w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5"
                                maxLength={2000}
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button onClick={handleGenerate} disabled={isGenerateDisabled} className="px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto">
                            {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : buttonIcon}
                            <span>{isLoading ? 'Gerando...' : `Gerar Prompt para ${promptType}`}</span>
                        </button>
                    </div>
                </div>

                {/* Right Column: Generated Prompt */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full">
                    <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Resultado do Prompt</h3>
                         {showSaveSuccess && (
                            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-semibold">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>Salvo em "Meus Documentos"!</span>
                            </div>
                        )}
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                                <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">A IA está criando seu prompt...</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Isso pode levar alguns instantes.</p>
                            </div>
                        )}
                        {error && <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 rounded-lg p-4 text-sm"><p className="font-semibold">Erro ao gerar prompt</p><p>{error}</p></div>}
                        
                        {generatedPrompt && (
                            <div>
                                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md font-sans">{generatedPrompt.prompt}</pre>
                                <div className="flex justify-end mt-4">
                                     <button onClick={handleCopy} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                                        {copied ? <><ClipboardCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400"/> Copiado!</> : <><ClipboardIcon className="w-5 h-5"/> Copiar Prompt</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isLoading && !generatedPrompt && !error && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                <SparkleIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                                <h4 className="font-semibold text-gray-700 dark:text-gray-200">Seu prompt gerado aparecerá aqui</h4>
                                <p className="text-sm">Preencha o formulário à esquerda para começar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};