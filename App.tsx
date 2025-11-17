import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import { SchemaDisplay } from './components/SchemaDisplay';
import { SavedSchemasTable } from './components/SavedSchemasTable';
import { MOCK_SCHEMAS, MOCK_DOCUMENTS, MOCK_USER } from './constants';
import { generateDatabaseSchema } from './services/geminiService';
import type { ChatMessage, SchemaTable, GeneratedPrompt, Document, User } from './types';
import { AddIcon, PromptEngineIcon, MoonIcon, MailIcon, LockClosedIcon, GoogleIcon, SunIcon } from './components/icons';
import { PromptGenerator } from './components/PromptGenerator';
import { Dashboard } from './components/Dashboard';
import { PRDGenerator } from './components/PRDGenerator';
import { SuperPromptGenerator } from './components/SuperPromptGenerator';
import { IdeaCatalog } from './components/IdeaCatalog';
import { MyDocuments } from './components/MyDocuments';
import { Agents } from './components/Agents';
import { ProjectShowcase } from './components/ProjectShowcase';
import { Settings } from './components/Settings';

type Theme = 'light' | 'dark';

const MainApp: React.FC<{ user: User; onLogout: () => void; theme: Theme; setTheme: (theme: Theme) => void; }> = ({ user, onLogout, theme, setTheme }) => {
  const [activeView, setActiveView] = useState('Dashboard');
  const [initialPrdDescription, setInitialPrdDescription] = useState<string | undefined>(undefined);
  
  // State for Schema Generator
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState<SchemaTable[] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'ia', text: "Olá! Descreva a aplicação que você deseja criar, e eu gerarei um diagrama de banco de dados para você." }
  ]);
  const [error, setError] = useState<string | null>(null);

  // State for My Documents
  const [savedDocuments, setSavedDocuments] = useState<Document[]>(MOCK_DOCUMENTS);

  const handleSavePrd = (prdData: { title: string; content: string; industry: string; complexity: string; targetAudience: string; }) => {
    const newPrd: Document = {
        id: `prd-${Date.now()}`,
        title: `PRD: ${prdData.title}`,
        type: 'PRD',
        status: 'Finalizado',
        content: prdData.content,
        createdAt: new Intl.DateTimeFormat('pt-BR').format(new Date()),
        industry: prdData.industry,
        complexity: prdData.complexity,
        targetAudience: prdData.targetAudience,
        linkedPrompts: [],
    };
    setSavedDocuments(prev => [newPrd, ...prev]);
  };

  const handleSaveDocument = (prompt: GeneratedPrompt) => {
    const parentPrd = savedDocuments.find(doc => doc.id === prompt.prdId);

    const newDoc: Document = {
        id: prompt.id,
        title: prompt.title,
        type: prompt.type === 'Aplicativo' ? 'Prompt Aplicativo' : 'Prompt Landing Page',
        status: 'Finalizado',
        content: prompt.prompt,
        createdAt: prompt.createdAt,
        parentTitle: parentPrd ? parentPrd.title : 'PRD Desconhecido'
    };

    setSavedDocuments(prev => {
        const updatedDocs = prev.map(doc => {
            // Find the parent PRD and add the new prompt to its linkedPrompts
            if (doc.id === prompt.prdId) {
                return {
                    ...doc,
                    linkedPrompts: [
                        ...(doc.linkedPrompts || []),
                        { id: newDoc.id, title: 'Prompt para...' }
                    ]
                };
            }
            return doc;
        });
        // Add the new prompt document itself to the list
        return [newDoc, ...updatedDocs];
    });
};

  const handleDeleteDocument = (id: string) => {
    setSavedDocuments(prev => prev.filter(doc => doc.id !== id));
  };


  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = { from: 'user', text: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setSchema(null); 

    try {
      const newSchema = await generateDatabaseSchema(message);
      setSchema(newSchema);
      const iaMessage: ChatMessage = { from: 'ia', text: "Aqui está o schema de banco de dados gerado com base na sua descrição. Você pode ver as tabelas e colunas ao lado." };
      setMessages(prev => [...prev, iaMessage]);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
        const iaErrorMessage: ChatMessage = { from: 'ia', text: `Desculpe, não consegui gerar o schema. ${errorMessage}` };
        setMessages(prev => [...prev, iaErrorMessage]);
        setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const InitialView: React.FC<{ onSendMessage: (msg: string) => void; isLoading: boolean; }> = ({ onSendMessage, isLoading }) => {
    const [description, setDescription] = useState('');
    const [selectedPRD, setSelectedPRD] = useState('');

    const handleSendClick = () => {
      onSendMessage(description);
      setDescription('');
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendClick();
      }
    }

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Comece descrevendo seu app</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Por exemplo: "Quero criar um sistema de e-commerce com usuários, produtos, carrinho de compras e pedidos"
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedPRD}
              onChange={(e) => setSelectedPRD(e.target.value)}
              className="flex-1 w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
            >
              <option value="">Selecione um PRD</option>
              <option value="1">PRD - E-commerce</option>
              <option value="2">PRD - App de Agendamento</option>
            </select>
            <button className="p-2.5 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <AddIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full font-bold text-sm">IA</div>
              <textarea
                  placeholder="Descreva seu app aqui para gerar o diagrama..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  rows={4}
                  className="w-full flex-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 p-2 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
              />
          </div>
          <div className="flex justify-end mt-2">
              <button
                onClick={handleSendClick}
                disabled={isLoading || !description.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto"></div>
                ) : (
                    'Gerar Diagrama'
                )}
              </button>
          </div>
        </div>
      </div>
    );
  };

  const ResultsView: React.FC<{
    schema: SchemaTable[] | null;
    messages: ChatMessage[];
    onSendMessage: (msg: string) => void;
    isLoading: boolean;
  }> = ({ schema, messages, onSendMessage, isLoading }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)]">
      <div className="lg:col-span-1 h-full">
        <SchemaDisplay schema={schema} isLoading={isLoading} />
      </div>
      <div className="lg:col-span-1 h-full">
        <ChatPanel messages={messages} onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );

  const handleNavigate = (view: string) => {
    if (activeView === 'Diagrama de Banco' && view !== 'Diagrama de Banco') {
        setSchema(null);
        setIsLoading(false);
        setMessages([{ from: 'ia', text: "Olá! Descreva a aplicação que você deseja criar, e eu gerarei um diagrama de banco de dados para você." }]);
        setError(null);
    }
    if (view !== 'Gerar PRD') {
      setInitialPrdDescription(undefined);
    }
    setActiveView(view);
  };

  const handleUseIdea = (ideaDescription: string) => {
    setInitialPrdDescription(ideaDescription);
    setActiveView('Gerar PRD');
  };
  
  const renderContent = () => {
    const prds = savedDocuments.filter(doc => doc.type === 'PRD');

    switch(activeView) {
      case 'Dashboard':
        return <Dashboard onNavigate={handleNavigate} user={user}/>;
      case 'Gerar PRD':
        return <PRDGenerator 
                    initialDescription={initialPrdDescription}
                    onSavePrd={handleSavePrd}
                    savedPrds={prds}
                />;
      case 'Diagrama de Banco':
        return (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Diagrama de Banco
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                  Gere schemas de banco de dados a partir de uma descrição de texto.
              </p>
            </div>

            {(!schema && !isLoading && !error) ? (
              <InitialView onSendMessage={handleSendMessage} isLoading={isLoading} />
            ) : (
              <ResultsView schema={schema} messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
            )}
            
            <div className="mt-6">
               <SavedSchemasTable schemas={MOCK_SCHEMAS} />
            </div>
          </div>
        );
      case 'Gerar Prompt':
        return <PromptGenerator prds={prds} onSaveDocument={handleSaveDocument} />;
      case 'Super Prompt':
        return <SuperPromptGenerator />;
      case 'Catálogo de Ideias':
        return <IdeaCatalog onUseIdea={handleUseIdea} />;
      case 'Meus Documentos':
        return <MyDocuments documents={savedDocuments} onDelete={handleDeleteDocument} />;
      case 'Agentes':
        return <Agents />;
      case 'Vitrine de Projetos':
        return <ProjectShowcase />;
      case 'Configurações':
        return <Settings user={user} theme={theme} setTheme={setTheme} />;
      default:
        return (
          <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{activeView}</h1>
              </div>
              <div className="mt-8 text-center bg-white dark:bg-gray-800 p-12 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Em Construção</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Esta funcionalidade ainda não está disponível.</p>
              </div>
          </div>
        );
    }
  };


  return (
    <div className="bg-[#f9f8f6] dark:bg-gray-900 h-screen overflow-hidden flex flex-col">
       <Sidebar 
          user={user}
          activeItem={activeView} 
          onItemClick={handleNavigate}
          onLogout={onLogout}
      />
      <main className="sm:ml-64 h-full overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

const LoginPage: React.FC<{ onLogin: () => void, onGoogleLogin: () => void }> = ({ onLogin, onGoogleLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleStandardLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login check for any non-empty fields, or a specific test user
        if (email.trim() && password.trim()) {
            onLogin();
        } else {
            alert('Por favor, preencha o e-mail e a senha.');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <header className="absolute top-0 left-0 right-0 py-4 px-6 sm:px-8">
                <nav className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center space-x-3">
                        <PromptEngineIcon className="h-8 w-8 text-indigo-600" />
                        <span className="text-xl font-bold text-gray-800">PromptEngine</span>
                    </div>
                </nav>
            </header>

            <main className="flex flex-col items-center justify-center min-h-screen pt-24 pb-10 px-4">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-white rounded-full shadow-md mb-4">
                        <PromptEngineIcon className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">PromptEngine</h1>
                    <p className="text-gray-500 mt-2">Entre para acessar seus documentos</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <h2 className="text-2xl font-bold text-gray-800">Entrar</h2>
                    <p className="text-gray-500 mt-1 mb-6">Entre com sua conta para acessar seus documentos.</p>
                    
                    <form onSubmit={handleStandardLogin}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="seu@email.com" required />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Senha</label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" required />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
                            Entrar com Email
                        </button>
                    </form>

                    <div className="flex items-center my-6">
                        <hr className="flex-grow border-t border-gray-300" />
                        <span className="mx-4 text-xs font-medium text-gray-500">OU</span>
                        <hr className="flex-grow border-t border-gray-300" />
                    </div>

                    <button onClick={onGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <GoogleIcon className="h-5 w-5" />
                        Continuar com Google
                    </button>
                </div>
            </main>
        </div>
    );
}

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [theme, setThemeState] = useState<Theme>('light');
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        // Handle theme
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setThemeState(savedTheme);
        }
        
        // Handle user session
        try {
            const storedUserJson = sessionStorage.getItem('user');
            if (storedUserJson) {
                 const parsedUser = JSON.parse(storedUserJson);
                 if (parsedUser && parsedUser.name && parsedUser.email) {
                    setUser(parsedUser);
                 } else {
                    sessionStorage.removeItem('user');
                    setUser(null);
                 }
            } else {
                setUser(null);
            }
        } catch (e) {
            console.error("Falha ao processar sessão:", e);
            sessionStorage.removeItem('user');
            setUser(null);
        } finally {
            setCheckingSession(false);
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleLogin = () => {
        sessionStorage.setItem('user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        setUser(null);
    };

    if (checkingSession) {
        return null; // Render nothing while checking session to prevent flicker
    }

    return (
        <>
            {user ? (
                <MainApp user={user} onLogout={handleLogout} theme={theme} setTheme={setThemeState} />
            ) : (
                <LoginPage onLogin={handleLogin} onGoogleLogin={handleLogin} />
            )}
        </>
    );
};

export default App;