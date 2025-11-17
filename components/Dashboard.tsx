import React from 'react';
import { MOCK_SCHEMAS } from '../constants';
import { StorageIcon, CodeIcon, DescriptionIcon, SparkleIcon } from './icons';
import type { User } from '../types';

interface DashboardProps {
  user: User;
  onNavigate: (view: string) => void;
}

// Mock data for recent activities
const recentActivities = [
  { id: 1, type: 'schema', text: 'Schema "E-commerce" foi criado.', time: '2h atrás' },
  { id: 2, type: 'prompt', text: 'Prompt para "App de barbearia" foi gerado.', time: '5h atrás' },
  { id: 3, type: 'schema', text: 'Schema "Rede Social" foi atualizado.', time: '1 dia atrás' },
  { id: 4, type: 'prd', text: 'PRD para "Clone do Instagram" foi criado.', time: '2 dias atrás' },
];

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        Bem-vindo de volta, {user.name.split(' ')[0]}!
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Aqui está um resumo de sua atividade recente.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                 <StatCard 
                    icon={<StorageIcon className="h-6 w-6 text-indigo-700 dark:text-indigo-300" />} 
                    label="Schemas Criados" 
                    value="03" 
                    color="bg-indigo-100 dark:bg-indigo-500/20" 
                />
                <StatCard 
                    icon={<CodeIcon className="h-6 w-6 text-sky-700 dark:text-sky-300" />} 
                    label="Prompts Gerados" 
                    value="12" 
                    color="bg-sky-100 dark:bg-sky-500/20" 
                />
                <StatCard 
                    icon={<DescriptionIcon className="h-6 w-6 text-amber-700 dark:text-amber-300" />} 
                    label="Documentos Salvos" 
                    value="05" 
                    color="bg-amber-100 dark:bg-amber-500/20" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content: Quick Actions and Recent Schemas */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Ações Rápidas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => onNavigate('Diagrama de Banco')} className="text-left p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg space-y-1 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:bg-gray-700">
                                <div className="flex items-center space-x-2">
                                    <StorageIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400"/>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">Gerar Diagrama de Banco</h4>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Crie um schema de banco de dados a partir de uma descrição.</p>
                            </button>
                             <button onClick={() => onNavigate('Gerar Prompt')} className="text-left p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg space-y-1 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:bg-gray-700">
                                <div className="flex items-center space-x-2">
                                    <SparkleIcon className="h-5 w-5 text-sky-600 dark:text-sky-400"/>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-100">Gerar Prompt Otimizado</h4>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Transforme uma ideia simples em um prompt detalhado para IA.</p>
                            </button>
                        </div>
                    </div>
                    
                    {/* Recent Schemas */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                         <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">Schemas Recentes</h3>
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('Diagrama de Banco'); }} className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                                Ver todos
                            </a>
                        </div>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                           {MOCK_SCHEMAS.map(schema => (
                               <li key={schema.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                   <div>
                                       <p className="font-medium text-gray-800 dark:text-gray-100">{schema.title}</p>
                                       <p className="text-sm text-gray-500 dark:text-gray-400">{schema.tables} tabelas - {schema.date}</p>
                                   </div>
                                   <button onClick={() => onNavigate('Diagrama de Banco')} className="px-3 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-100 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">Abrir</button>
                               </li>
                           ))}
                        </ul>
                    </div>
                </div>

                {/* Sidebar content: Recent Activity */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Atividade Recente</h3>
                    </div>
                     <div className="p-4 space-y-4">
                        {recentActivities.map(activity => (
                             <div key={activity.id} className="flex items-start space-x-3">
                                 <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    {activity.type === 'schema' && <StorageIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />}
                                    {activity.type === 'prompt' && <CodeIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />}
                                    {activity.type === 'prd' && <DescriptionIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />}
                                 </div>
                                 <div>
                                     <p className="text-sm text-gray-700 dark:text-gray-200">{activity.text}</p>
                                     <p className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</p>
                                 </div>
                             </div>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};