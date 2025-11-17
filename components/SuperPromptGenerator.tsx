import React, { useState, useEffect, useMemo, type ReactNode } from 'react';
import { analyzeAndRefinePrompt, type PromptAnalysis } from '../services/geminiService';
import type { SuperPrompt } from '../types';
import { MOCK_SUPER_PROMPTS } from '../constants';
import { 
    SparkleIcon, ClipboardIcon, ClipboardCheckIcon, LightbulbIcon, CheckCircleIcon, 
    ChevronDownIcon, DescriptionIcon, WrenchScrewdriverIcon, ArrowDownTrayIcon,
    EditIcon, DeleteIcon, EyeIcon
} from './icons';


const ConfigModule: React.FC<{
    title: string;
    icon: ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: ReactNode;
}> = ({ title, icon, isOpen, onToggle, children }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
            onClick={onToggle}
            className="w-full flex justify-between items-center p-3 bg-gray-50/70 hover:bg-gray-100"
        >
            <div className="flex items-center space-x-3">
                {icon}
                <h2 className="font-semibold text-sm text-gray-800">{title}</h2>
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
            <div className="p-4 bg-white space-y-4">
                {children}
            </div>
        )}
    </div>
);


const PromptAnalysisResult: React.FC<{ analysis: PromptAnalysis }> = ({ analysis }) => {
     const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-700 bg-green-100 border-green-200';
        if (score >= 50) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
        return 'text-red-700 bg-red-100 border-red-200';
    }
    const scoreColor = getScoreColor(analysis.score);

    return (
        <div className="mt-4 space-y-4">
            <div className={`p-4 rounded-lg border ${scoreColor}`}>
                <h4 className="font-semibold">Pontuação de Eficácia: {analysis.score}/100</h4>
                <p className="text-sm mt-1">{analysis.justification}</p>
            </div>
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Sugestões de Melhoria</h4>
                <ul className="space-y-2">
                    {analysis.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start space-x-2.5">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700">{s}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


export const SuperPromptGenerator: React.FC = () => {
    // Builder state
    const [title, setTitle] = useState('');
    const [goal, setGoal] = useState('');
    const [persona, setPersona] = useState('');
    const [context, setContext] = useState('');
    const [task, setTask] = useState('');
    const [outputFormat, setOutputFormat] = useState('');
    const [examples, setExamples] = useState('');
    const [constraints, setConstraints] = useState('');
    const [assembledPrompt, setAssembledPrompt] = useState('');
    
    // Library state
    const [prompts, setPrompts] = useState<SuperPrompt[]>(MOCK_SUPER_PROMPTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    // API state
    const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Accordion state
    const [openSections, setOpenSections] = useState({
        core: true,
        details: true,
        examples: false,
    });

    useEffect(() => {
        const parts = [
            persona && `**👤 PERSONA:**\nAssuma o papel de ${persona}.`,
            context && `**CONTEXTO:**\n${context}`,
            task && `**📝 TAREFA:**\n${task}`,
            outputFormat && `**📄 FORMATO DE SAÍDA:**\n${outputFormat}`,
            examples && `**👍 EXEMPLOS:**\n${examples}`,
            constraints && `**❌ RESTRIÇÕES:**\n${constraints}`,
        ];
        const fullPrompt = parts.filter(Boolean).join('\n\n');
        setAssembledPrompt(fullPrompt);
    }, [persona, context, task, outputFormat, examples, constraints]);

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };
    
    const resetBuilder = () => {
        setTitle('');
        setGoal('');
        setPersona('');
        setContext('');
        setTask('');
        setOutputFormat('');
        setExamples('');
        setConstraints('');
        setAnalysis(null);
        setAnalysisError(null);
        setEditingId(null);
    };

    const handleAnalyze = async () => {
        if (!goal.trim()) return;
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysis(null);
        try {
            const promptToAnalyze = `**🎯 OBJETIVO:**\n${goal}\n\n${assembledPrompt}`;
            const result = await analyzeAndRefinePrompt(promptToAnalyze);
            setAnalysis(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
            setAnalysisError(errorMessage);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleSave = () => {
        const fullPromptWithGoal = `**🎯 OBJETIVO:**\n${goal}\n\n${assembledPrompt}`;
        if (editingId) {
            // Update existing prompt
            setPrompts(prompts.map(p => p.id === editingId ? {
                ...p,
                title,
                goal,
                fullPrompt: fullPromptWithGoal,
                analysis,
            } : p));
        } else {
            // Add new prompt
            const newPrompt: SuperPrompt = {
                id: `sp-${Date.now()}`,
                title: title || `Prompt - ${new Date().toLocaleTimeString()}`,
                goal,
                fullPrompt: fullPromptWithGoal,
                analysis,
                createdAt: new Intl.DateTimeFormat('pt-BR').format(new Date()),
            };
            setPrompts(prev => [newPrompt, ...prev]);
        }
        resetBuilder();
    };

    const handleEdit = (prompt: SuperPrompt) => {
        setEditingId(prompt.id);
        setTitle(prompt.title);
        setGoal(prompt.goal);
        setAnalysis(prompt.analysis);

        // Deconstruct the full prompt
        const deconstructed = { persona: '', context: '', task: '', outputFormat: '', examples: '', constraints: ''};
        const sections = prompt.fullPrompt.split('\n\n**');
        sections.forEach(sec => {
            if (sec.includes('PERSONA:**')) deconstructed.persona = sec.split(':**\n')[1].replace('Assuma o papel de ','');
            if (sec.includes('CONTEXTO:**')) deconstructed.context = sec.split(':**\n')[1];
            if (sec.includes('TAREFA:**')) deconstructed.task = sec.split(':**\n')[1];
            if (sec.includes('FORMATO DE SAÍDA:**')) deconstructed.outputFormat = sec.split(':**\n')[1];
            if (sec.includes('EXEMPLOS:**')) deconstructed.examples = sec.split(':**\n')[1];
            if (sec.includes('RESTRIÇÕES:**')) deconstructed.constraints = sec.split(':**\n')[1];
        });
        setPersona(deconstructed.persona);
        setContext(deconstructed.context);
        setTask(deconstructed.task);
        setOutputFormat(deconstructed.outputFormat);
        setExamples(deconstructed.examples);
        setConstraints(deconstructed.constraints);
    };
    
    const handleDelete = (id: string) => {
        setPrompts(prompts.filter(p => p.id !== id));
    };

    const handleCopy = (promptText: string, id: string) => {
        navigator.clipboard.writeText(promptText);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredPrompts = useMemo(() => {
        return prompts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [prompts, searchTerm]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Super Prompt</h1>
                <p className="text-sm text-gray-500 mt-1">Construa, analise e gerencie prompts de nível profissional com IA.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                {/* Left Column: Studio */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
                    <div className="flex justify-between items-center">
                         <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <WrenchScrewdriverIcon className="w-6 h-6 text-indigo-500" />
                            Prompt Studio
                        </h3>
                        <button onClick={resetBuilder} className="text-xs font-semibold text-indigo-600 hover:underline">Limpar</button>
                    </div>
                   
                    <input type="text" placeholder="Dê um título para seu prompt..." value={title} onChange={e => setTitle(e.target.value)} className="w-full text-sm text-gray-900 font-semibold bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5" />
                    
                    <ConfigModule title="1. Objetivo Principal" icon={<DescriptionIcon className="w-5 h-5 text-indigo-600" />} isOpen={openSections.core} onToggle={() => toggleSection('core')}>
                        <textarea placeholder="O que você quer que a IA faça? Ex: Gerar 5 ideias de nome para uma startup de café." value={goal} onChange={e => setGoal(e.target.value)} rows={3} className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md p-2.5" />
                    </ConfigModule>
                    
                    <ConfigModule title="2. Detalhes do Prompt" icon={<SparkleIcon className="w-5 h-5 text-sky-600" />} isOpen={openSections.details} onToggle={() => toggleSection('details')}>
                        <textarea placeholder="Persona (Ex: Especialista em Marketing)" value={persona} onChange={e => setPersona(e.target.value)} rows={2} className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md p-2.5" />
                        <textarea placeholder="Contexto e Informações" value={context} onChange={e => setContext(e.target.value)} rows={4} className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md p-2.5" />
                        <textarea placeholder="Tarefa e Instruções" value={task} onChange={e => setTask(e.target.value)} rows={4} className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md p-2.5" />
                        <textarea placeholder="Formato da Saída (Ex: JSON, Markdown...)" value={outputFormat} onChange={e => setOutputFormat(e.target.value)} rows={2} className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md p-2.5" />
                    </ConfigModule>

                    <ConfigModule title="3. Exemplos e Restrições" icon={<LightbulbIcon className="w-5 h-5 text-amber-600" />} isOpen={openSections.examples} onToggle={() => toggleSection('examples')}>
                         <textarea placeholder="Exemplos (few-shot)" value={examples} onChange={e => setExamples(e.target.value)} rows={3} className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md p-2.5" />
                         <textarea placeholder="Restrições (o que evitar)" value={constraints} onChange={e => setConstraints(e.target.value)} rows={2} className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md p-2.5" />
                    </ConfigModule>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                         <button onClick={handleAnalyze} disabled={isAnalyzing || !goal.trim()} className="flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2">
                            {isAnalyzing ? <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"></div> : <SparkleIcon className="w-5 h-5" />}
                            <span>{isAnalyzing ? 'Analisando...' : 'Analisar Prompt'}</span>
                        </button>
                        <button onClick={handleSave} disabled={!goal.trim()} className="flex-1 px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>{editingId ? 'Atualizar Prompt' : 'Salvar na Biblioteca'}</span>
                        </button>
                    </div>

                    {analysisError && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{analysisError}</div>}
                    {analysis && <PromptAnalysisResult analysis={analysis} />}

                </div>

                {/* Right Column: Library */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                     <div className="p-4 border-b space-y-4">
                        <h3 className="font-semibold text-gray-800 text-lg">Biblioteca de Prompts</h3>
                        <input type="text" placeholder="Buscar na biblioteca..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                     <div className="overflow-y-auto max-h-[70vh]">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pontuação</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPrompts.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.title}</td>
                                        <td className="px-4 py-3">
                                            {p.analysis ? (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.analysis.score >= 80 ? 'bg-green-100 text-green-800' : p.analysis.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {p.analysis.score} / 100
                                                </span>
                                            ) : (
                                                 <span className="text-xs text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 flex gap-1">
                                            <button onClick={() => handleEdit(p)} title="Editar" className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-gray-100"><EditIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleCopy(p.fullPrompt, p.id)} title="Copiar" className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-gray-100">
                                                {copiedId === p.id ? <ClipboardCheckIcon className="w-4 h-4 text-green-600"/> : <ClipboardIcon className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} title="Excluir" className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100"><DeleteIcon className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};