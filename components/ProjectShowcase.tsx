import React, { useState, useMemo } from 'react';
import { MOCK_SHOWCASE_PROJECTS } from '../constants';
import type { ShowcaseProject } from '../types';
import { StorefrontIcon, LinkIcon, CodeBracketIcon } from './icons';

const ProjectCard: React.FC<{ project: ShowcaseProject }> = ({ project }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden transform transition-transform hover:-translate-y-1.5 duration-300">
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-800 text-lg">{project.title}</h3>
                <p className="text-sm text-gray-600 mt-1 flex-grow">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 my-4">
                    {project.techStack.map(tech => (
                        <span key={tech} className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">{tech}</span>
                    ))}
                </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/70 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img src={project.authorAvatarUrl} alt={project.author} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-xs font-semibold text-gray-700">{project.author}</span>
                </div>
                <div className="flex gap-2">
                    {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" title="Ver Demo" className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-gray-200">
                            <LinkIcon className="w-5 h-5" />
                        </a>
                    )}
                    {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" title="Código Fonte" className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-gray-200">
                            <CodeBracketIcon className="w-5 h-5" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};


export const ProjectShowcase: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTech, setSelectedTech] = useState('Todos');

    const allTechs = useMemo(() => {
        const techSet = new Set<string>();
        MOCK_SHOWCASE_PROJECTS.forEach(p => p.techStack.forEach(t => techSet.add(t)));
        return ['Todos', ...Array.from(techSet).sort()];
    }, []);

    const filteredProjects = useMemo(() => {
        return MOCK_SHOWCASE_PROJECTS
            .filter(project => selectedTech === 'Todos' || project.techStack.includes(selectedTech))
            .filter(project => project.title.toLowerCase().includes(searchTerm.toLowerCase()) || project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, selectedTech]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Vitrine de Projetos</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Explore projetos incríveis construídos com a ajuda do PromptEngine.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-0 z-10">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou descrição..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="flex-grow w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2"
                    />
                    <select
                        value={selectedTech}
                        onChange={e => setSelectedTech(e.target.value)}
                        className="w-full sm:w-auto text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2"
                    >
                        {allTechs.map(tech => <option key={tech} value={tech}>{tech}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))
                ) : (
                    <div className="md:col-span-2 lg:col-span-3 text-center py-16">
                        <StorefrontIcon className="w-16 h-16 mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-700">Nenhum projeto encontrado</h3>
                        <p className="text-sm text-gray-500 mt-1">Tente ajustar seus filtros de busca.</p>
                    </div>
                )}
            </div>
        </div>
    );
};