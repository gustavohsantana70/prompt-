import React from 'react';
import { SIDEBAR_ITEMS, MOCK_IDEAS } from '../constants';
import { PromptEngineIcon, LightbulbIcon, LogoutIcon } from './icons';
import type { User } from '../types';

interface SidebarProps {
  user: User;
  activeItem: string;
  onItemClick: (itemText: string) => void;
  onLogout: () => void;
}

const SidebarContent: React.FC<SidebarProps> = ({ user, activeItem, onItemClick, onLogout }) => {
    const truncateEmail = (email: string) => {
        const [localPart, domain] = email.split('@');
        if (localPart.length > 10) {
            return `${localPart.substring(0, 7)}...@${domain}`;
        }
        return email;
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-[#f9f8f6] dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-r border-gray-200/80 dark:border-gray-700/50">
            {/* Header */}
            <div className="h-16 flex-shrink-0 flex items-center px-4">
                <div className="flex items-center space-x-3">
                    <PromptEngineIcon className="h-7 w-7 text-gray-700 dark:text-gray-300" />
                    <span className="text-xl font-bold text-gray-800 dark:text-gray-100">PromptEngine</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-1">
                {SIDEBAR_ITEMS.map((item) => {
                    if (item.type === 'divider') {
                        return (
                             <h3 key={item.text} className="px-3 pt-4 pb-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{item.text}</h3>
                        );
                    }
                    
                     const isActive = item.text === activeItem;
                     return (
                        <a
                            key={item.text}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onItemClick(item.text);
                            }}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group ${
                                isActive
                                    ? 'bg-gray-200/60 text-gray-900 dark:bg-gray-700/50 dark:text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 hover:text-gray-900 dark:hover:bg-gray-700/50 dark:hover:text-white'
                            }`}
                        >
                            {item.icon}
                            <span className="ml-3 flex-1">{item.text}</span>
                            {item.badge && (
                                <span className={`ml-auto inline-block py-0.5 px-2 text-xs font-semibold rounded-full ${
                                    isActive ? 'text-indigo-700 bg-white' : 'text-indigo-600 bg-indigo-100 dark:bg-indigo-500 dark:text-white'
                                }`}>
                                    {item.badge}
                                </span>
                            )}
                        </a>
                    );
                })}
            </nav>

            {/* Bottom Cards */}
            <div className="p-4 mt-auto flex-shrink-0 space-y-4">
                 {/* Ideias Card */}
                <div 
                    className="p-3 bg-[#fdf3e6] dark:bg-yellow-900/20 rounded-lg text-center cursor-pointer transition-colors hover:bg-[#fcecdb] dark:hover:bg-yellow-900/30"
                    onClick={() => onItemClick('Catálogo de Ideias')}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <LightbulbIcon className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
                        <span className="font-semibold text-gray-800 dark:text-gray-100">Ideias Cadastradas</span>
                        <span className="font-bold text-sm text-gray-900 bg-white/70 dark:bg-gray-700 dark:text-gray-100 px-2 py-0.5 rounded-md">{MOCK_IDEAS.length}</span>
                    </div>
                    <span className="text-xs text-yellow-800/80 dark:text-yellow-500/80 mt-1 block">Ver catálogo de ideias</span>
                </div>
                 {/* Profile Card */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">{user.avatarInitial}</div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{truncateEmail(user.email)}</p>
                        </div>
                    </div>
                     <button onClick={onLogout} className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold text-white bg-gray-800 dark:bg-gray-700 rounded-md hover:bg-gray-900 dark:hover:bg-gray-600">
                        <LogoutIcon className="h-4 w-4" />
                        <span>Sair</span>
                    </button>
                </div>
            </div>
        </div>
    );
};


export const Sidebar: React.FC<SidebarProps> = ({ user, activeItem, onItemClick, onLogout }) => {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 flex-shrink-0 hidden sm:flex sm:flex-col sm:h-full" aria-label="Sidebar">
      <SidebarContent user={user} activeItem={activeItem} onItemClick={onItemClick} onLogout={onLogout} />
    </aside>
  );
};