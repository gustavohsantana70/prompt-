import React, { useState, useEffect, type ReactNode, useMemo } from 'react';
import type { Document, Competitor, SchemaTable } from '../types';
import { generatePRD, generateCompetitorAnalysis, generateUIInterfaces, generateDbSchemaFromPrd, generateLogoImages, generatePrdDetails, generateUiFlowchart } from '../services/geminiService';
import { 
    DescriptionIcon, 
    SparkleIcon, 
    ArrowDownTrayIcon, 
    CheckCircleIcon,
    EditIcon,
    LinkIcon,
    XMarkIcon,
    LightbulbIcon,
    WidgetsIcon,
    StorageIcon,
    PaintBrushIcon,
    PencilIcon
} from './icons';

// FIX: Added 'mermaid' to the global window object to avoid TypeScript errors.
declare global {
    interface Window {
        mermaid: any;
    }
}


// Helper function to clean the AI's response
const cleanPrdContent = (rawContent: string): string => {
    // Find the first occurrence of a markdown header (e.g., "#", "##") at the beginning of a line.
    // Allow for zero or more spaces after the hash(es).
    const firstHeaderIndex = rawContent.search(/^#+\s*/m);

    if (firstHeaderIndex !== -1) {
        // If a header is found, return the content from that point onwards
        return rawContent.substring(firstHeaderIndex);
    }
    
    // Fallback for cases where the response starts with a bolded title like **PRD: ...**
    const prdIndex = rawContent.indexOf('PRD:');
    if (prdIndex !== -1) {
        const lineStartIndex = rawContent.lastIndexOf('\n', prdIndex) + 1;
        return rawContent.substring(lineStartIndex);
    }
    
    // If no clear header is found, return the original content as a fallback.
    return rawContent;
};


const MarkdownRenderer: React.FC<{ markdown: string }> = ({ markdown }) => {
    const toHtml = (text: string) => {
        if (!text) return '';
        const lines = text.split('\n');
        let html = '';
        let inList = false;

        const closeList = () => {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
        };

        for (const line of lines) {
            let processedLine = line;

            // Handle empty lines for spacing
            if (processedLine.trim() === '') {
                closeList();
                continue;
            }

            // Bold and Italic
            processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');

            // List items
            if (processedLine.trim().startsWith('* ')) {
                if (!inList) {
                    html += '<ul class="list-disc pl-6 space-y-2 my-4">';
                    inList = true;
                }
                html += `<li>${processedLine.trim().substring(2)}</li>`;
                continue;
            }
            
            // Numbered list items
            if (processedLine.trim().match(/^\d+\.\s/)) {
                 if (!inList) {
                    html += '<ol class="list-decimal pl-6 space-y-2 my-4">';
                    inList = true;
                }
                html += `<li>${processedLine.trim().substring(processedLine.indexOf('.') + 2)}</li>`;
                continue;
            }
            
            closeList();

            // Headers
            if (processedLine.startsWith('### ')) {
                html += `<h3 class="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-gray-100">${processedLine.substring(4)}</h3>`;
            } else if (processedLine.startsWith('## ')) {
                html += `<h2 class="text-xl font-bold mt-8 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">${processedLine.substring(3)}</h2>`;
            } else if (processedLine.startsWith('# ')) {
                html += `<h1 class="text-2xl font-bold mt-4 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">${processedLine.substring(2)}</h1>`;
            } else if (processedLine.trim() === '---') {
                html += '<hr class="my-6 border-gray-200 dark:border-gray-700"/>';
            } else {
                 if (processedLine.trim()) {
                    html += `<p class="my-4 leading-relaxed">${processedLine}</p>`;
                 }
            }
        }

        closeList();
        return html;
    };

    return (
        <div 
            className="text-gray-700 dark:text-gray-300 max-w-none"
            dangerouslySetInnerHTML={{ __html: toHtml(markdown) }} 
        />
    );
};

const FlowchartComponent: React.FC<{
    content: string | null;
    isLoading: boolean;
    error: string | null;
    onRegenerate: () => void;
}> = ({ content, isLoading, error, onRegenerate }) => {
    const [zoom, setZoom] = useState(1);
    const flowchartRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (content && flowchartRef.current) {
            flowchartRef.current.removeAttribute('data-processed');
            // FIX: Updated Mermaid initialization to use the `mermaidAPI` for rendering, which provides more control and avoids common race conditions with the simpler `mermaid.run()`.
            window.mermaid.mermaidAPI.render(
              'mermaid-graph',
              content,
              (svgCode: string) => {
                if (flowchartRef.current) {
                   flowchartRef.current.innerHTML = svgCode;
                }
              }
            );
        }
    }, [content]);

    if (isLoading) {
        return (
            <div className="text-center py-16">
                <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">Gerando fluxograma...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">A IA está mapeando a jornada do usuário.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-200">Erro ao gerar fluxograma</h3>
                <p className="text-sm text-red-600 dark:text-red-300 mt-2">{error}</p>
                <button onClick={onRegenerate} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Tentar Novamente</button>
            </div>
        );
    }
    
    if (content) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">－</button>
                        <button onClick={() => setZoom(1)} className="px-3 py-1 text-xs font-semibold rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Zoom: {Math.round(zoom * 100)}%</button>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">＋</button>
                    </div>
                     <button onClick={onRegenerate} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-500">Regerar Fluxograma</button>
                </div>
                 <div className="w-full overflow-auto p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[400px]">
                    <div ref={flowchartRef} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="transition-transform duration-200">
                       {/* Mermaid will render here */}
                    </div>
                </div>
            </div>
        )
    }

    return null;
};


const PRDResultView: React.FC<{
    prd: { title: string; content: string; industry: string; targetAudience: string };
    onEdit: () => void;
    competitors: Competitor[] | null;
    isFetchingCompetitors: boolean;
    competitorError: string | null;
    fetchCompetitors: () => void;
    uiInterfaces: string | null;
    isFetchingUi: boolean;
    uiError: string | null;
    fetchUiInterfaces: () => void;
    dbSchema: SchemaTable[] | null;
    isFetchingDbSchema: boolean;
    dbSchemaError: string | null;
    fetchDbSchema: () => void;
    logoImages: string[] | null;
    isFetchingLogoImages: boolean;
    logoImagesError: string | null;
    fetchLogoImages: () => void;
    prdDetails: string | null;
    isFetchingDetails: boolean;
    detailsError: string | null;
    fetchPrdDetails: () => void;
    flowchartContent: string | null;
    isFetchingFlowchart: boolean;
    flowchartError: string | null;
    fetchFlowchart: () => void;
}> = ({ 
    prd, 
    onEdit, 
    competitors, 
    isFetchingCompetitors, 
    competitorError, 
    fetchCompetitors, 
    uiInterfaces, 
    isFetchingUi, 
    uiError, 
    fetchUiInterfaces, 
    dbSchema, 
    isFetchingDbSchema, 
    dbSchemaError, 
    fetchDbSchema,
    logoImages,
    isFetchingLogoImages,
    logoImagesError,
    fetchLogoImages,
    prdDetails,
    isFetchingDetails,
    detailsError,
    fetchPrdDetails,
    flowchartContent,
    isFetchingFlowchart,
    flowchartError,
    fetchFlowchart
}) => {
    const [activeTab, setActiveTab] = useState('Documento');
    const [activeInterfaceTab, setActiveInterfaceTab] = useState('Telas e Componentes');
    const creationDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());

    useEffect(() => {
        if (activeTab === 'Inspirações' && !competitors && !isFetchingCompetitors && !competitorError) {
            fetchCompetitors();
        }
        if (activeTab === 'Interface' && activeInterfaceTab === 'Telas e Componentes' && !uiInterfaces && !isFetchingUi && !uiError) {
            fetchUiInterfaces();
        }
        if (activeTab === 'Interface' && activeInterfaceTab === 'Fluxograma' && !flowchartContent && !isFetchingFlowchart && !flowchartError) {
            fetchFlowchart();
        }
        if (activeTab === 'Banco de Dados' && !dbSchema && !isFetchingDbSchema && !dbSchemaError) {
            fetchDbSchema();
        }
        if (activeTab === 'Logotipo' && !logoImages && !isFetchingLogoImages && !logoImagesError) {
            fetchLogoImages();
        }
        if (activeTab === 'Detalhes' && !prdDetails && !isFetchingDetails && !detailsError) {
            fetchPrdDetails();
        }
    }, [
        activeTab, activeInterfaceTab,
        competitors, isFetchingCompetitors, competitorError, fetchCompetitors, 
        uiInterfaces, isFetchingUi, uiError, fetchUiInterfaces,
        flowchartContent, isFetchingFlowchart, flowchartError, fetchFlowchart,
        dbSchema, isFetchingDbSchema, dbSchemaError, fetchDbSchema,
        logoImages, isFetchingLogoImages, logoImagesError, fetchLogoImages,
        prdDetails, isFetchingDetails, detailsError, fetchPrdDetails
    ]);

    const tabs = [
        { name: 'Documento', icon: <DescriptionIcon className="w-4 h-4" /> },
        { name: 'Inspirações', icon: <LightbulbIcon className="w-4 h-4" /> },
        { name: 'Interface', icon: <WidgetsIcon className="w-4 h-4" /> },
        { name: 'Banco de Dados', icon: <StorageIcon className="w-4 h-4" /> },
        { name: 'Logotipo', icon: <PaintBrushIcon className="w-4 h-4" /> },
        { name: 'Detalhes', icon: <PencilIcon className="w-4 h-4" /> },
    ];

    const renderInspirations = () => {
        if (isFetchingCompetitors) {
            return (
                <div className="text-center py-16">
                    <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">Buscando concorrentes...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">A IA está analisando o mercado.</p>
                </div>
            );
        }
        if (competitorError) {
             return (
                <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-200">Erro ao buscar concorrentes</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-2">{competitorError}</p>
                    <button onClick={fetchCompetitors} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Tentar Novamente</button>
                </div>
            );
        }
        if (competitors) {
            return (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Resultados da pesquisa de concorrentes para auxiliar no desenvolvimento do seu aplicativo.</p>
                        <button onClick={fetchCompetitors} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Atualizar Pesquisa</button>
                    </div>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Nome do App</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Plataforma</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Principais Funcionalidades</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Popularidade</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Free Trial/Gratuito</th>
                                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Link</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {competitors.map((comp, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{comp.appName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{comp.platform}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 min-w-[250px]">{comp.mainFeatures}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{comp.popularity}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{comp.pricingModel}</td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                                            <a href={comp.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Visitar</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
        return null; // Initial state before anything is fetched
    };
    
    const renderInterfaces = () => {
        if (isFetchingUi && activeInterfaceTab === 'Telas e Componentes') {
            return (
                <div className="text-center py-16">
                    <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">Gerando ideias de interface...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">A IA está desenhando a experiência do usuário.</p>
                </div>
            );
        }
        if (uiError && activeInterfaceTab === 'Telas e Componentes') {
             return (
                <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-200">Erro ao gerar interface</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-2">{uiError}</p>
                    <button onClick={fetchUiInterfaces} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Tentar Novamente</button>
                </div>
            );
        }
        return (
             <div>
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveInterfaceTab('Telas e Componentes')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeInterfaceTab === 'Telas e Componentes' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Telas e Componentes</button>
                        <button onClick={() => setActiveInterfaceTab('Fluxograma')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeInterfaceTab === 'Fluxograma' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Fluxograma</button>
                    </nav>
                </div>
                 {activeInterfaceTab === 'Telas e Componentes' && uiInterfaces && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Sugestões de UI/UX geradas pela IA para guiar o design.</p>
                            <button onClick={fetchUiInterfaces} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Atualizar Sugestões</button>
                        </div>
                        <MarkdownRenderer markdown={uiInterfaces} />
                    </div>
                )}
                 {activeInterfaceTab === 'Fluxograma' && (
                    <FlowchartComponent content={flowchartContent} isLoading={isFetchingFlowchart} error={flowchartError} onRegenerate={fetchFlowchart} />
                )}
            </div>
        );
    };

    const renderDbSchema = () => {
        if (isFetchingDbSchema) {
            return (
                <div className="text-center py-16">
                    <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">Gerando schema do banco de dados...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">A IA está projetando sua estrutura de dados.</p>
                </div>
            );
        }
        if (dbSchemaError) {
             return (
                <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-200">Erro ao gerar schema</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-2">{dbSchemaError}</p>
                    <button onClick={fetchDbSchema} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Tentar Novamente</button>
                </div>
            );
        }
        if (dbSchema) {
            return (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Estrutura de banco de dados sugerida com base no PRD.</p>
                        <button onClick={fetchDbSchema} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Regerar Schema</button>
                    </div>
                     {dbSchema.map((table, tableIndex) => (
                        <div key={tableIndex} className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <div className="p-3 bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{table.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{table.description}</p>
                            </div>
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {table.columns.map((column, colIndex) => (
                                    <div key={colIndex} className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                                        <div className="col-span-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{column.name}</p>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono bg-indigo-100/60 dark:bg-indigo-900/40 inline-block px-1 rounded">{column.type}</p>
                                        </div>
                                        <div className="md:col-span-2 text-sm text-gray-600 dark:text-gray-300">
                                            {column.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null; // Initial state
    };
    
    const renderLogoImages = () => {
        if (isFetchingLogoImages) {
            return (
                <div className="text-center py-16">
                    <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">Gerando conceitos de logotipo...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">A IA está desenhando sua identidade visual. Isso pode levar um minuto.</p>
                </div>
            );
        }
        if (logoImagesError) {
             return (
                <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-200">Erro ao gerar logotipos</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-2">{logoImagesError}</p>
                    <button onClick={fetchLogoImages} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Tentar Novamente</button>
                </div>
            );
        }
        if (logoImages) {
            return (
                 <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Conceitos de logotipo gerados pela IA para o seu projeto.</p>
                        <button onClick={fetchLogoImages} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Regerar Conceitos</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {logoImages.map((base64Image, index) => (
                            <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                <img 
                                    src={`data:image/png;base64,${base64Image}`} 
                                    alt={`Conceito de logotipo ${index + 1}`}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderDetails = () => {
        if (isFetchingDetails) {
            return (
                <div className="text-center py-16">
                    <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">Gerando detalhes estratégicos...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">A IA está atuando como Gerente de Produto.</p>
                </div>
            );
        }
        if (detailsError) {
             return (
                <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-200">Erro ao gerar detalhes</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-2">{detailsError}</p>
                    <button onClick={fetchPrdDetails} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Tentar Novamente</button>
                </div>
            );
        }
        if (prdDetails) {
            return (
                 <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Análise estratégica gerada pela IA para guiar o desenvolvimento.</p>
                        <button onClick={fetchPrdDetails} className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">Atualizar Análise</button>
                    </div>
                    <MarkdownRenderer markdown={prdDetails} />
                </div>
            );
        }
        return null;
    };


    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col flex-1">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">PRD: {prd.title}</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Criado em {creationDate}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={onEdit} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600">
                        <EditIcon className="w-4 h-4" />
                        Editar
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600">
                        <LinkIcon className="w-4 h-4" />
                        Compartilhar
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 border border-red-700 rounded-md hover:bg-red-700">
                        <XMarkIcon className="w-4 h-4" />
                        Excluir
                    </button>
                </div>
            </div>

            {/* Sub-header & Tabs */}
            <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">PRD para {prd.industry} - {prd.targetAudience}</p>
                <div className="flex flex-wrap items-center">
                    {tabs.map(tab => (
                        <button 
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap
                                ${activeTab === tab.name 
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`
                            }
                        >
                            {tab.icon}
                            <span className="hidden sm:inline">{tab.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                {activeTab === 'Documento' && <MarkdownRenderer markdown={prd.content} />}
                {activeTab === 'Inspirações' && renderInspirations()}
                {activeTab === 'Interface' && renderInterfaces()}
                {activeTab === 'Banco de Dados' && renderDbSchema()}
                {activeTab === 'Logotipo' && renderLogoImages()}
                {activeTab === 'Detalhes' && renderDetails()}
            </div>
        </div>
    );
}

const PRDFormView: React.FC<{
    title: string;
    setTitle: (s: string) => void;
    description: string;
    setDescription: (s: string) => void;
    industry: string;
    setIndustry: (s: string) => void;
    targetAudience: string;
    setTargetAudience: (s: string) => void;
    complexity: string;
    setComplexity: (s: string) => void;
    handleGenerate: () => void;
    isGenerateDisabled: boolean;
    isLoading: boolean;
    error: string | null;
}> = ({ title, setTitle, description, setDescription, industry, setIndustry, targetAudience, setTargetAudience, complexity, setComplexity, handleGenerate, isGenerateDisabled, isLoading, error }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="space-y-1 mb-2">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <DescriptionIcon className="w-6 h-6 text-indigo-500" />
                Gerador de PRD
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Transforme sua ideia em um Documento de Requisitos de Produto detalhado.
            </p>
        </div>
        
        <div className="space-y-4">
            <div>
                <label htmlFor="prd-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título do PRD</label>
                <input id="prd-title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: App de Marketplace de Serviços Locais" className="w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md p-2.5" />
            </div>
            <div>
                <label htmlFor="prd-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição Geral do Produto</label>
                <textarea id="prd-desc" value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Descreva o que seu produto faz, para quem é e qual problema ele resolve." className="w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md p-2.5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="prd-industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Indústria</label>
                    <select id="prd-industry" value={industry} onChange={e => setIndustry(e.target.value)} className="w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md p-2.5">
                        <option value="" disabled>Selecione a indústria</option>
                        <option>Tecnologia</option>
                        <option>Saúde</option>
                        <option>Educação</option>
                        <option>Finanças</option>
                        <option>Varejo</option>
                        <option>Alimentação</option>
                        <option>Transporte</option>
                        <option>Turismo</option>
                        <option>Entretenimento</option>
                        <option>Esportes</option>
                        <option>Mídia</option>
                        <option>Negócios</option>
                        <option>Produtividade</option>
                        <option>Outro</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="prd-audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Público-Alvo</label>
                    <select id="prd-audience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md p-2.5">
                        <option value="" disabled>Selecione o público-alvo</option>
                        <option>Consumidores gerais</option>
                        <option>Profissionais</option>
                        <option>Empresas</option>
                        <option>Estudantes</option>
                        <option>Educadores</option>
                        <option>Crianças</option>
                        <option>Idosos</option>
                        <option>Famílias</option>
                        <option>Entusiastas de tecnologia</option>
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="prd-complexity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Complexidade do Projeto</label>
                <select id="prd-complexity" value={complexity} onChange={e => setComplexity(e.target.value)} className="w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md p-2.5">
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                    <option>Muito Alta</option>
                </select>
            </div>
        </div>
        
        {error && <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 text-red-800 dark:text-red-200 rounded-lg p-3 text-sm"><p className="font-semibold">Erro ao gerar PRD</p><p>{error}</p></div>}
        
        <div className="flex justify-end pt-2">
            <button onClick={handleGenerate} disabled={isGenerateDisabled} className="px-6 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto">
               {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparkleIcon className="w-5 h-5" />}
                <span>{isLoading ? 'Gerando...' : 'Gerar PRD com IA'}</span>
            </button>
        </div>
    </div>
);

interface PRDGeneratorProps {
    initialDescription?: string;
    onSavePrd: (prdData: {
        title: string;
        content: string;
        industry: string;
        complexity: string;
        targetAudience: string;
    }) => void;
    savedPrds: Document[];
}

export const PRDGenerator: React.FC<PRDGeneratorProps> = ({ initialDescription, onSavePrd, savedPrds }) => {
    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [industry, setIndustry] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [complexity, setComplexity] = useState('Média');

    // UI/API state
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inspirations state
    const [competitors, setCompetitors] = useState<Competitor[] | null>(null);
    const [isFetchingCompetitors, setIsFetchingCompetitors] = useState(false);
    const [competitorError, setCompetitorError] = useState<string | null>(null);

    // UI state
    const [uiInterfaces, setUiInterfaces] = useState<string | null>(null);
    const [isFetchingUi, setIsFetchingUi] = useState(false);
    const [uiError, setUiError] = useState<string | null>(null);
    
    // Flowchart state
    const [flowchartContent, setFlowchartContent] = useState<string | null>(null);
    const [isFetchingFlowchart, setIsFetchingFlowchart] = useState(false);
    const [flowchartError, setFlowchartError] = useState<string | null>(null);

    // Database Schema state
    const [dbSchema, setDbSchema] = useState<SchemaTable[] | null>(null);
    const [isFetchingDbSchema, setIsFetchingDbSchema] = useState(false);
    const [dbSchemaError, setDbSchemaError] = useState<string | null>(null);
    
    // Logo Images state
    const [logoImages, setLogoImages] = useState<string[] | null>(null);
    const [isFetchingLogoImages, setIsFetchingLogoImages] = useState(false);
    const [logoImagesError, setLogoImagesError] = useState<string | null>(null);

    // Details state
    const [prdDetails, setPrdDetails] = useState<string | null>(null);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    
    // Saved PRDs list state
    const [searchTerm, setSearchTerm] = useState('');
    const [industryFilter, setIndustryFilter] = useState('Todas as indústrias');

    useEffect(() => {
        if (initialDescription) {
            setDescription(initialDescription);
        }
    }, [initialDescription]);
    
    const handleLoadPrd = (prd: Document) => {
        setTitle(prd.title.replace('PRD: ', ''));
        setIndustry(prd.industry || '');
        setTargetAudience(prd.targetAudience || '');
        setComplexity(prd.complexity || 'Média');
        setGeneratedContent(prd.content);
        
        // Reset all sub-tab states
        setCompetitors(null);
        setUiInterfaces(null);
        setDbSchema(null);
        setLogoImages(null);
        setPrdDetails(null);
        setFlowchartContent(null);
    };

    const filteredPrds = useMemo(() => {
        return savedPrds
            .filter(prd => industryFilter === 'Todas as indústrias' || prd.industry === industryFilter)
            .filter(prd => prd.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [savedPrds, searchTerm, industryFilter]);

    const allIndustries = useMemo(() => {
        const industries = new Set(savedPrds.map(p => p.industry).filter(Boolean));
        return ['Todas as indústrias', ...Array.from(industries)];
    }, [savedPrds]);

    const fetchCompetitors = async () => {
        if (!generatedContent) return;
        setIsFetchingCompetitors(true);
        setCompetitorError(null);
        try {
            const result = await generateCompetitorAnalysis(generatedContent);
            setCompetitors(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setCompetitorError(errorMessage);
        } finally {
            setIsFetchingCompetitors(false);
        }
    };

    const fetchUiInterfaces = async () => {
        if (!generatedContent) return;
        setIsFetchingUi(true);
        setUiError(null);
        try {
            const result = await generateUIInterfaces(generatedContent);
            setUiInterfaces(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setUiError(errorMessage);
        } finally {
            setIsFetchingUi(false);
        }
    };
    
     const fetchFlowchart = async () => {
        if (!generatedContent) return;
        setIsFetchingFlowchart(true);
        setFlowchartError(null);
        try {
            const result = await generateUiFlowchart(generatedContent);
            setFlowchartContent(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setFlowchartError(errorMessage);
        } finally {
            setIsFetchingFlowchart(false);
        }
    };

    const fetchDbSchema = async () => {
        if (!generatedContent) return;
        setIsFetchingDbSchema(true);
        setDbSchemaError(null);
        try {
            const result = await generateDbSchemaFromPrd(generatedContent);
            setDbSchema(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setDbSchemaError(errorMessage);
        } finally {
            setIsFetchingDbSchema(false);
        }
    };

    const fetchLogoImages = async () => {
        if (!generatedContent) return;
        setIsFetchingLogoImages(true);
        setLogoImagesError(null);
        try {
            const result = await generateLogoImages(generatedContent);
            setLogoImages(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setLogoImagesError(errorMessage);
        } finally {
            setIsFetchingLogoImages(false);
        }
    };

    const fetchPrdDetails = async () => {
        if (!generatedContent) return;
        setIsFetchingDetails(true);
        setDetailsError(null);
        try {
            const result = await generatePrdDetails(generatedContent);
            setPrdDetails(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setDetailsError(errorMessage);
        } finally {
            setIsFetchingDetails(false);
        }
    };

    const handleGenerate = async () => {
        if (!title || !description || !industry || !targetAudience) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedContent('');
        setCompetitors(null);
        setCompetitorError(null);
        setUiInterfaces(null);
        setUiError(null);
        setFlowchartContent(null);
        setFlowchartError(null);
        setDbSchema(null);
        setDbSchemaError(null);
        setLogoImages(null);
        setLogoImagesError(null);
        setPrdDetails(null);
        setDetailsError(null);

        try {
            const content = await generatePRD({ title, description, industry, targetAudience, complexity });
            const cleanedContent = cleanPrdContent(content);
            setGeneratedContent(cleanedContent);

            // Auto-save on generation
            onSavePrd({
                title,
                content: cleanedContent,
                industry,
                complexity,
                targetAudience,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setGeneratedContent('');
        setCompetitors(null);
        setCompetitorError(null);
        setUiInterfaces(null);
        setUiError(null);
        setFlowchartContent(null);
        setFlowchartError(null);
        setDbSchema(null);
        setDbSchemaError(null);
        setLogoImages(null);
        setLogoImagesError(null);
        setPrdDetails(null);
        setDetailsError(null);
        // Keep form fields populated for editing
    };

    const isGenerateDisabled = !title || !description || !industry || !targetAudience || isLoading;

    return (
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
            {isLoading && !generatedContent && (
                 <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="w-8 h-8 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                    <p className="mt-4 font-semibold text-gray-700 dark:text-gray-200">A IA está escrevendo seu PRD...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Isso pode levar alguns instantes.</p>
                </div>
            )}
            
            {!isLoading && generatedContent ? (
                <PRDResultView 
                    prd={{ title, content: generatedContent, industry, targetAudience }}
                    onEdit={handleEdit}
                    competitors={competitors}
                    isFetchingCompetitors={isFetchingCompetitors}
                    competitorError={competitorError}
                    fetchCompetitors={fetchCompetitors}
                    uiInterfaces={uiInterfaces}
                    isFetchingUi={isFetchingUi}
                    uiError={uiError}
                    fetchUiInterfaces={fetchUiInterfaces}
                    flowchartContent={flowchartContent}
                    isFetchingFlowchart={isFetchingFlowchart}
                    flowchartError={flowchartError}
                    fetchFlowchart={fetchFlowchart}
                    dbSchema={dbSchema}
                    isFetchingDbSchema={isFetchingDbSchema}
                    dbSchemaError={dbSchemaError}
                    fetchDbSchema={fetchDbSchema}
                    logoImages={logoImages}
                    isFetchingLogoImages={isFetchingLogoImages}
                    logoImagesError={logoImagesError}
                    fetchLogoImages={fetchLogoImages}
                    prdDetails={prdDetails}
                    isFetchingDetails={isFetchingDetails}
                    detailsError={detailsError}
                    fetchPrdDetails={fetchPrdDetails}
                />
            ) : !isLoading && (
                 <div className="space-y-8">
                    <PRDFormView 
                        title={title} setTitle={setTitle}
                        description={description} setDescription={setDescription}
                        industry={industry} setIndustry={setIndustry}
                        targetAudience={targetAudience} setTargetAudience={setTargetAudience}
                        complexity={complexity} setComplexity={setComplexity}
                        handleGenerate={handleGenerate}
                        isGenerateDisabled={isGenerateDisabled}
                        isLoading={isLoading}
                        error={error}
                    />
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">PRDs Gerados</h2>
                            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="Buscar PRDs..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="flex-grow w-full text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
                                />
                                <select
                                    value={industryFilter}
                                    onChange={e => setIndustryFilter(e.target.value)}
                                    className="w-full sm:w-auto text-sm text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                                >
                                    {allIndustries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Título</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Indústria</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Complexidade</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Criado em</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredPrds.map(prd => (
                                        <tr key={prd.id} onClick={() => handleLoadPrd(prd)} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{prd.title.replace('PRD: ', '')}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{prd.industry}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{prd.complexity}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{prd.createdAt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};