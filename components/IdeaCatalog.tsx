import React, { useState, useMemo, type ReactNode } from 'react';
import { MOCK_IDEAS } from '../constants';
import type { Idea, IdeaCategory, IdeaDifficulty } from '../types';
import { 
    LightbulbIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, CloudIcon, 
    ShoppingCartIcon, CpuChipIcon, PuzzlePieceIcon
} from './icons';

const CATEGORIES: IdeaCategory[] = ['Web App', 'Mobile App', 'SaaS', 'E-commerce', 'AI/ML', 'Games'];
const DIFFICULTIES: IdeaDifficulty[] = ['Fácil', 'Médio', 'Difícil'];

const categoryIcons: Record<IdeaCategory, ReactNode> = {
    'Web App': <ComputerDesktopIcon className="w-6 h-6 text-sky-600" />,
    'Mobile App': <DevicePhoneMobileIcon className="w-6 h-6 text-green-600" />,
    'SaaS': <CloudIcon className="w-6 h-6 text-indigo-600" />,
    'E-commerce': <ShoppingCartIcon className="w-6 h-6 text-amber-600" />,
    'AI/ML': <CpuChipIcon className="w-6 h-6 text-purple-600" />,
    'Games': <PuzzlePieceIcon className="w-6 h-6 text-red-600" />,
};

const difficultyColors: Record<IdeaDifficulty, string> = {
    'Fácil': 'bg-green-100 text-green-800',
    'Médio': 'bg-yellow-100 text-yellow-800',
    'Difícil': 'bg-red-100 text-red-800',
};

interface IdeaCatalogProps {
    onUseIdea: (description: string) => void;
}

const IdeaCard: React.FC<{ idea: Idea; onUse: () => void }> = ({ idea, onUse }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden transform transition-transform hover:-translate-y-1">
            <div className="p-5 flex-grow">
                <div className="flex items-start justify-between">
                    <h3 className="font-bold text-gray-800 pr-4">{idea.title}</h3>
                    <div className="flex-shrink-0">{categoryIcons[idea.category]}</div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{idea.description}</p>
            </div>
            <div className="px-5 pb-5 mt-auto">
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {idea.tags.map(tag => (
                        <span key={tag} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                </div>
                <div className="flex justify-between items-center">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${difficultyColors[idea.difficulty]}`}>
                        {idea.difficulty}
                    </span>
                    <button onClick={onUse} className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Usar esta Ideia
                    </button>
                </div>
            </div>
        </div>
    );
};

export const IdeaCatalog: React.FC<IdeaCatalogProps> = ({ onUseIdea }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<IdeaCategory | 'Todos'>('Todos');
    const [selectedDifficulty, setSelectedDifficulty] = useState<IdeaDifficulty | 'Todos'>('Todos');

    const filteredIdeas = useMemo(() => {
        return MOCK_IDEAS
            .filter(idea => selectedCategory === 'Todos' || idea.category === selectedCategory)
            .filter(idea => selectedDifficulty === 'Todos' || idea.difficulty === selectedDifficulty)
            .filter(idea => idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || idea.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, selectedCategory, selectedDifficulty]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Catálogo de Ideias</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Encontre inspiração para seu próximo projeto e comece a construir com um clique.
                </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou descrição..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2"
                    />
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value as any)}
                        className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2"
                    >
                        <option value="Todos">Todas as Categorias</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={selectedDifficulty}
                        onChange={e => setSelectedDifficulty(e.target.value as any)}
                        className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2"
                    >
                        <option value="Todos">Todas as Dificuldades</option>
                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredIdeas.length > 0 ? (
                    filteredIdeas.map(idea => (
                        <IdeaCard key={idea.id} idea={idea} onUse={() => onUseIdea(idea.description)} />
                    ))
                ) : (
                    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-16">
                        <LightbulbIcon className="w-16 h-16 mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-700">Nenhuma ideia encontrada</h3>
                        <p className="text-sm text-gray-500 mt-1">Tente ajustar seus filtros de busca.</p>
                    </div>
                )}
            </div>
        </div>
    );
};