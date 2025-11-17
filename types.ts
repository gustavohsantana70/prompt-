import type { ReactNode } from 'react';
import type { PromptAnalysis } from './services/geminiService';

export interface SidebarItem {
  text: string;
  icon?: ReactNode;
  badge?: string;
  type?: 'item' | 'divider';
}

export interface ChatMessage {
  from: 'user' | 'ia';
  text: string;
}

export interface SavedSchema {
  id: number;
  title: string;
  desc: string;
  tables: number;
  chatMsgs: number;
  date: string;
}

export interface SchemaColumn {
    name: string;
    type: string;
    description: string;
}

export interface SchemaTable {
    name: string;
    description: string;
    columns: SchemaColumn[];
}

export interface PRD {
  id: string;
  title: string;
  content: string; 
}

export type PromptType = 'Aplicativo' | 'Landing Page';

export interface GeneratedPrompt {
  id: string;
  prdId: string;
  title: string;
  type: PromptType;
  createdAt: string;
  prompt: string; 
}

export interface SuperPrompt {
  id: string;
  title: string;
  goal: string;
  fullPrompt: string;
  analysis: PromptAnalysis | null;
  createdAt: string;
}

export type IdeaCategory = 'Web App' | 'Mobile App' | 'SaaS' | 'E-commerce' | 'AI/ML' | 'Games';
export type IdeaDifficulty = 'Fácil' | 'Médio' | 'Difícil';

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  difficulty: IdeaDifficulty;
  tags: string[];
}

export type DocumentType = 'PRD' | 'Prompt Aplicativo' | 'Prompt Landing Page';
export type DocumentStatus = 'Finalizado' | 'Rascunho';

export interface Document {
    id: string;
    title: string;
    type: DocumentType;
    status: DocumentStatus;
    content: string;
    createdAt: string;
    parentTitle?: string;
    linkedPrompts?: { id: string; title: string }[];
    industry?: string;
    complexity?: string;
    targetAudience?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  persona: string;
  icon: string; // The name of the icon component
}

export interface ShowcaseProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
  author: string;
  authorAvatarUrl: string;
}

export interface User {
  name: string;
  email: string;
  avatarInitial: string;
}

export interface Competitor {
  appName: string;
  platform: string;
  mainFeatures: string;
  popularity: string;
  pricingModel: string;
  link: string;
}