import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MOCK_AGENTS } from '../constants';
import { chatWithAgent } from '../services/geminiService';
import type { Agent, ChatMessage } from '../types';
import { 
    AgentIcon, CodeIcon, PencilIcon, LightbulbIcon, SendIcon, UserCircleIcon, 
    PlusCircleIcon, SparkleIcon, XMarkIcon 
} from './icons';

// Mapping of icon names (string) to their actual components
const iconMap: { [key: string]: React.ComponentType<{ className: string }> } = {
    CodeIcon,
    PencilIcon,
    LightbulbIcon,
    SparkleIcon,
    AgentIcon,
};
const availableIcons = Object.keys(iconMap);

const AgentModal: React.FC<{
    agent: Partial<Agent> | null;
    onClose: () => void;
    onSave: (agent: Agent) => void;
}> = ({ agent, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Agent>>({
        name: '',
        description: '',
        persona: '',
        icon: availableIcons[0],
        ...agent
    });

    const handleSave = () => {
        // Basic validation
        if (!formData.name || !formData.description || !formData.persona) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        onSave({
            id: formData.id || `agent-${Date.now()}`,
            name: formData.name,
            description: formData.description,
            persona: formData.persona,
            icon: formData.icon || availableIcons[0],
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg text-gray-800">{agent?.id ? 'Editar Agente' : 'Criar Novo Agente'}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Agente</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Revisor de Código" className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md p-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Ex: Ajuda a revisar e melhorar código Python." className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md p-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Persona (Instrução do Sistema)</label>
                        <textarea value={formData.persona} onChange={e => setFormData({...formData, persona: e.target.value})} rows={6} placeholder="Você é um engenheiro de software sênior..." className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md p-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
                        <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-md">
                            {availableIcons.map(iconName => {
                                const Icon = iconMap[iconName];
                                const isSelected = formData.icon === iconName;
                                return (
                                    <button key={iconName} onClick={() => setFormData({...formData, icon: iconName})} className={`p-2 rounded-md transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-indigo-100'}`}>
                                        <Icon className="w-6 h-6" />
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
                 <div className="p-4 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Salvar Agente</button>
                </div>
            </div>
        </div>
    )
}

export const Agents: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Partial<Agent> | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const selectedAgent = useMemo(() => agents.find(a => a.id === selectedAgentId), [agents, selectedAgentId]);

    const handleSelectAgent = (agentId: string) => {
        setSelectedAgentId(agentId);
        const agent = agents.find(a => a.id === agentId);
        setChatMessages([{ from: 'ia', text: `Olá! Eu sou ${agent?.name}. Como posso te ajudar hoje?` }]);
    };
    
    const handleSendMessage = async () => {
        if (!currentMessage.trim() || !selectedAgent) return;

        const userMessage: ChatMessage = { from: 'user', text: currentMessage };
        setChatMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsLoading(true);

        try {
            const responseText = await chatWithAgent(selectedAgent.persona, userMessage.text);
            const iaMessage: ChatMessage = { from: 'ia', text: responseText };
            setChatMessages(prev => [...prev, iaMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            const iaErrorMessage: ChatMessage = { from: 'ia', text: `Desculpe, ocorreu um erro. ${errorMessage}` };
            setChatMessages(prev => [...prev, iaErrorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSaveAgent = (agentToSave: Agent) => {
        const index = agents.findIndex(a => a.id === agentToSave.id);
        if (index > -1) {
            // Update
            const updatedAgents = [...agents];
            updatedAgents[index] = agentToSave;
            setAgents(updatedAgents);
        } else {
            // Create
            setAgents(prev => [agentToSave, ...prev]);
        }
        setIsModalOpen(false);
        setEditingAgent(null);
    };

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col">
            {isModalOpen && <AgentModal agent={editingAgent} onClose={() => { setIsModalOpen(false); setEditingAgent(null); }} onSave={handleSaveAgent} />}

            <div>
                <h1 className="text-2xl font-bold text-gray-800">Meus Agentes</h1>
                <p className="text-sm text-gray-500 mt-1">Crie e converse com IAs especializadas para diferentes tarefas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 flex-1">
                {/* Agent List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                     <div className="p-4 border-b">
                        <button onClick={() => { setEditingAgent(null); setIsModalOpen(true); }} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                           <PlusCircleIcon className="w-5 h-5" />
                           Criar Novo Agente
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {agents.map(agent => {
                            const Icon = iconMap[agent.icon] || AgentIcon;
                            const isSelected = selectedAgentId === agent.id;
                            return (
                                <button key={agent.id} onClick={() => handleSelectAgent(agent.id)} className={`w-full text-left p-3 flex items-start gap-3 rounded-lg transition-colors ${isSelected ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}>
                                    <div className={`p-2 rounded-md ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                      <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800">{agent.name}</h4>
                                        <p className="text-xs text-gray-500">{agent.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Panel */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
                    {!selectedAgent ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
                            <AgentIcon className="w-20 h-20 text-gray-300" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-700">Selecione um Agente</h3>
                            <p className="text-sm">Selecione um agente na lista ou crie um novo para começar a conversar.</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b flex items-center gap-3">
                                <div className="p-2 bg-indigo-500 text-white rounded-md">
                                    {(iconMap[selectedAgent.icon] || AgentIcon)({ className: "w-6 h-6" })}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{selectedAgent.name}</h3>
                                    <p className="text-xs text-gray-500">{selectedAgent.description}</p>
                                </div>
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
                                <div className="space-y-4">
                                    {chatMessages.map((msg, i) => {
                                        const AgentIconComponent = iconMap[selectedAgent.icon] || AgentIcon;
                                        return (
                                            <div key={i} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                                                {msg.from === 'ia' && (
                                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full"><AgentIconComponent className="w-5 h-5"/></div>
                                                )}
                                                <div className={`max-w-md px-4 py-2 rounded-lg ${msg.from === 'ia' ? 'bg-white border border-gray-200' : 'bg-indigo-500 text-white'}`}>
                                                    <p className="text-sm">{msg.text}</p>
                                                </div>
                                                {msg.from === 'user' && (
                                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-300 text-gray-700 rounded-full"><UserCircleIcon className="w-6 h-6" /></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {isLoading && (
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full">{(iconMap[selectedAgent.icon] || AgentIcon)({ className: "w-5 h-5" })}</div>
                                            <div className="max-w-md px-4 py-2 rounded-lg bg-white border border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></span>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            </div>
                            
                             <div className="p-4 border-t">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Converse com ${selectedAgent.name}...`}
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                        disabled={isLoading}
                                        className="flex-1 w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isLoading || !currentMessage.trim()}
                                        className="p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SendIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};