import React, { useState, useMemo, type ReactNode } from 'react';
import type { Document, DocumentType } from '../types';
import { 
    DescriptionIcon, ClipboardIcon, ClipboardCheckIcon, EyeIcon, XMarkIcon, DeleteIcon,
    CodeIcon, Squares2X2Icon, Bars3Icon, ArrowsUpDownIcon
} from './icons';

const ViewDocumentModal: React.FC<{ document: Document; onClose: () => void }> = ({ document, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{document.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                             <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                document.type === 'PRD' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>{document.type}</span>
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                document.status === 'Finalizado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>{document.status}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-md font-sans leading-relaxed">{document.content}</pre>
                </div>
            </div>
        </div>
    );
};

const typeColors: Record<DocumentType, { bg: string; text: string; }> = {
    'PRD': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'Prompt Aplicativo': { bg: 'bg-purple-100', text: 'text-purple-800' },
    'Prompt Landing Page': { bg: 'bg-teal-100', text: 'text-teal-800' },
};

const statusColors: Record<Document['status'], string> = {
    'Finalizado': 'bg-green-100 text-green-800',
    'Rascunho': 'bg-yellow-100 text-yellow-800',
};

const DocumentCard: React.FC<{
    doc: Document;
    onCopy: (doc: Document) => void;
    onDelete: (id: string) => void;
    onView: (doc: Document) => void;
    copiedId: string | null;
}> = ({ doc, onCopy, onDelete, onView, copiedId }) => {
    const icon = doc.type === 'PRD' 
        ? <DescriptionIcon className="w-10 h-10 text-white/80" /> 
        : <CodeIcon className="w-10 h-10 text-white/80" />;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="h-32 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                {icon}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeColors[doc.type].bg} ${typeColors[doc.type].text}`}>{doc.type}</span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[doc.status]}`}>{doc.status}</span>
                </div>
                <h3 className="font-bold text-gray-800 mt-2">{doc.title}</h3>
                {doc.parentTitle && <p className="text-xs text-gray-500 mt-1">{doc.parentTitle}</p>}
                
                {doc.linkedPrompts && doc.linkedPrompts.length > 0 && (
                     <div className="mt-3 space-y-1.5">
                        {doc.linkedPrompts.map(p => (
                            <div key={p.id} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                <CodeIcon className="w-3 h-3 text-gray-500" />
                                <span>{p.title}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="mt-auto pt-4 flex justify-between items-center">
                    <p className="text-xs text-gray-400">{doc.createdAt}</p>
                    <div className="flex gap-1">
                         <button onClick={() => onCopy(doc)} title="Copiar" className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-gray-100">
                            {copiedId === doc.id ? <ClipboardCheckIcon className="w-4 h-4 text-green-600"/> : <ClipboardIcon className="w-4 h-4" />}
                        </button>
                        <button onClick={() => onView(doc)} title="Visualizar" className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-gray-100">
                            <EyeIcon className="w-4 h-4" />
                        </button>
                         <button onClick={() => onDelete(doc.id)} title="Excluir" className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100">
                            <DeleteIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


interface MyDocumentsProps {
    documents: Document[];
    onDelete: (id: string) => void;
}

export const MyDocuments: React.FC<MyDocumentsProps> = ({ documents, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'Todos' | DocumentType>('Todos');
    const [sortOrder, setSortOrder] = useState<'Mais recentes' | 'Mais antigos' | 'Alfabética'>('Mais recentes');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (doc: Document) => {
        navigator.clipboard.writeText(doc.content);
        setCopiedId(doc.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const sortedAndFilteredDocuments = useMemo(() => {
        const filtered = documents
            .filter(p => activeFilter === 'Todos' || p.type.includes(activeFilter))
            .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

        switch (sortOrder) {
            case 'Mais antigos':
                return filtered.sort((a, b) => new Date(a.createdAt.split('/').reverse().join('-')).getTime() - new Date(b.createdAt.split('/').reverse().join('-')).getTime());
            case 'Alfabética':
                 return filtered.sort((a, b) => a.title.localeCompare(b.title));
            case 'Mais recentes':
            default:
                return filtered.sort((a, b) => new Date(b.createdAt.split('/').reverse().join('-')).getTime() - new Date(a.createdAt.split('/').reverse().join('-')).getTime());
        }
    }, [documents, activeFilter, searchTerm, sortOrder]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {viewingDocument && <ViewDocumentModal document={viewingDocument} onClose={() => setViewingDocument(null)} />}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Meus Documentos</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Gerencie e acesse todos os seus PRDs e prompts em um só lugar.
                </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                 <div className="flex flex-col sm:flex-row gap-2 justify-between">
                    <input type="text" placeholder="Pesquisar documentos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="sm:flex-grow w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2" />
                    <div className="flex gap-2">
                        <select value={activeFilter} onChange={e => setActiveFilter(e.target.value as any)} className="w-full sm:w-auto text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2">
                            <option value="Todos">Todos os tipos</option>
                            <option value="PRD">PRD</option>
                            <option value="Prompt">Prompt</option>
                        </select>
                         <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className="w-full sm:w-auto text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2">
                            <option>Mais recentes</option>
                            <option>Mais antigos</option>
                            <option>Alfabética</option>
                        </select>
                        <div className="flex items-center bg-gray-100 p-1 rounded-md">
                            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/50'}`}><Squares2X2Icon className="w-5 h-5"/></button>
                            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-white/50'}`}><Bars3Icon className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>
            </div>

             {sortedAndFilteredDocuments.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedAndFilteredDocuments.map(doc => (
                            <DocumentCard key={doc.id} doc={doc} onCopy={handleCopy} onDelete={onDelete} onView={setViewingDocument} copiedId={copiedId} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {sortedAndFilteredDocuments.map(doc => (
                                     <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{doc.title}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[doc.type].bg} ${typeColors[doc.type].text}`}>{doc.type}</span></td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[doc.status]}`}>{doc.status}</span></td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{doc.createdAt}</td>
                                        <td className="px-4 py-3 flex gap-1">
                                            <button onClick={() => handleCopy(doc)} title="Copiar" className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-gray-100">{copiedId === doc.id ? <ClipboardCheckIcon className="w-4 h-4 text-green-600"/> : <ClipboardIcon className="w-4 h-4" />}</button>
                                            <button onClick={() => setViewingDocument(doc)} title="Visualizar" className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-md hover:bg-gray-100"><EyeIcon className="w-4 h-4" /></button>
                                            <button onClick={() => onDelete(doc.id)} title="Excluir" className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-gray-100"><DeleteIcon className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
             ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                    <DescriptionIcon className="w-16 h-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-700">Nenhum documento encontrado</h3>
                    <p className="text-sm text-gray-500 mt-1">Tente ajustar seus filtros ou crie um novo documento.</p>
                </div>
            )}
        </div>
    );
};