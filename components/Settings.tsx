import React, { useState } from 'react';
import type { User } from '../types';
import { SunIcon, MoonIcon } from './icons';

type Theme = 'light' | 'dark';

interface SettingsProps {
    user: User;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const SettingsCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        <div className="p-6 space-y-6">
            {children}
        </div>
    </div>
);

export const Settings: React.FC<SettingsProps> = ({ user, theme, setTheme }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Configurações</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gerencie suas informações de perfil e preferências.
                </p>
            </div>

            <SettingsCard title="Perfil">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center font-bold text-3xl text-indigo-700 dark:text-indigo-300">
                        {user.avatarInitial}
                    </div>
                    <div>
                        <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                            Alterar foto
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, GIF ou PNG. 1MB max.</p>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200" />
                </div>
                 <div className="flex justify-end pt-2">
                    <button className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Salvar Alterações</button>
                </div>
            </SettingsCard>

            <SettingsCard title="Tema">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aparência</label>
                    <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                        <button onClick={() => setTheme('light')} className={`w-1/2 flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-md transition-colors ${ theme === 'light' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50' }`}>
                            <SunIcon className="w-5 h-5" />Claro
                        </button>
                        <button onClick={() => setTheme('dark')} className={`w-1/2 flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-md transition-colors ${ theme === 'dark' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50' }`}>
                           <MoonIcon className="w-5 h-5" />Escuro
                        </button>
                    </div>
                </div>
            </SettingsCard>
            
            <SettingsCard title="Alterar Senha">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha Atual</label>
                    <input type="password" placeholder="••••••••" className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha</label>
                    <input type="password" placeholder="••••••••" className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Nova Senha</label>
                    <input type="password" placeholder="••••••••" className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200" />
                </div>
                 <div className="flex justify-end pt-2">
                    <button className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Alterar Senha</button>
                </div>
            </SettingsCard>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 p-6">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Zona de Perigo</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">A exclusão da sua conta é uma ação permanente e não pode ser desfeita. Todos os seus dados, incluindo PRDs e prompts, serão removidos.</p>
                <div className="mt-4">
                     <button className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">Excluir minha conta</button>
                </div>
            </div>
        </div>
    );
};