import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { SchemaTable, PromptType, Competitor } from '../types';

const schemaDefinition = {
    type: Type.OBJECT,
    properties: {
        tables: {
            type: Type.ARRAY,
            description: "List of tables in the database.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "Name of the table, should be plural and in snake_case (e.g., 'users', 'products')."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A brief description of what this table stores."
                    },
                    columns: {
                        type: Type.ARRAY,
                        description: "List of columns in the table.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: {
                                    type: Type.STRING,
                                    description: "Name of the column, in snake_case (e.g., 'user_id', 'first_name')."
                                },
                                type: {
                                    type: Type.STRING,
                                    description: "The SQL data type of the column (e.g., 'INTEGER', 'VARCHAR(255)', 'TEXT', 'BOOLEAN', 'TIMESTAMP')."
                                },
                                description: {
                                    type: Type.STRING,
                                    description: "A brief description of the column's purpose."
                                }
                            },
                            required: ["name", "type", "description"]
                        }
                    }
                },
                required: ["name", "description", "columns"]
            }
        }
    },
    required: ["tables"]
};

// Function to get the AI client, assuming the API key is provided by the environment.
const getAiClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};


export const generateDatabaseSchema = async (description: string): Promise<SchemaTable[]> => {
    try {
        const ai = getAiClient();

        const prompt = `
            Based on the following application description, generate a detailed SQL database schema.
            The schema should be well-structured, follow best practices, and include tables, columns with appropriate data types, and brief descriptions for each table and column.
            Ensure primary keys (like 'id') and foreign keys (like 'user_id') are included where relevant.

            Application Description: "${description}"

            Please return the schema in the specified JSON format.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schemaDefinition,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (parsedJson && Array.isArray(parsedJson.tables)) {
             return parsedJson.tables as SchemaTable[];
        }
        
        console.error("Generated JSON does not match expected format:", parsedJson);
        throw new Error("Falha ao gerar um schema válido. O formato da resposta estava incorreto.");

    } catch (error) {
        console.error("Error generating database schema:", error);
        throw new Error("Ocorreu um erro ao comunicar com o serviço de IA. Por favor, verifique sua conexão e tente novamente.");
    }
};

export const generatePrompt = async (description: string): Promise<string> => {
    try {
        const ai = getAiClient();

        const systemInstruction = `You are a world-class Prompt Engineering expert. Your mission is to transform a user's simple idea into a comprehensive, professional-grade prompt suitable for advanced LLMs like Google Gemini.

When you receive a user's goal, you must expand upon it to create a detailed and highly effective prompt. The generated prompt MUST be structured with the following Markdown sections:

1.  **Persona:** Define a clear and relevant role for the AI to adopt (e.g., "Assuma o papel de um copywriter sênior especializado em marketing de tecnologia B2B.").
2.  **Contexto:** Elaborate on the user's initial description. Add essential background details, target audience, and any relevant information that would help the AI better understand the scenario. Make reasonable assumptions if necessary.
3.  **Tarefa:** Provide a clear, step-by-step description of the task the AI needs to perform. Be explicit and unambiguous.
4.  **Formato de Saída:** Specify the output format with extreme clarity. Don't just say "uma lista"; instead, define the structure precisely. For example: "Retorne a resposta como um objeto JSON com as chaves 'titulo' (string) e 'pontos_chave' (array de strings)." or "Formate a saída em Markdown, com um título H2 e uma lista numerada."
5.  **Exemplos:** This is crucial. Provide at least one concrete 'few-shot' example, showing a sample input and the corresponding desired output. This will guide the AI on the expected quality and structure.
6.  **Restrições:** List any constraints or things the AI should avoid (e.g., "Não use linguagem excessivamente formal.", "Limite a resposta a 200 palavras.").

Your final output should be ONLY the generated prompt, ready to be copied and pasted by the user.`;

        const userPrompt = `Here is my goal: "${description}"

Please generate an optimized prompt for me.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        return response.text;

    } catch (error) {
        console.error("Error generating prompt:", error);
        throw new Error("Ocorreu um erro ao comunicar com o serviço de IA. Por favor, verifique sua conexão e tente novamente.");
    }
};

interface PRDGenerationParams {
    title: string;
    description: string;
    industry: string;
    targetAudience: string;
    complexity: string;
}

export const generatePRD = async ({ title, description, industry, targetAudience, complexity }: PRDGenerationParams): Promise<string> => {
    try {
        const ai = getAiClient();

        const systemInstruction = `Você é um Gerente de Produto Sênior de classe mundial, especialista em criar Documentos de Requisitos de Produto (PRDs) claros, abrangentes e acionáveis. Sua tarefa é pegar a ideia de um produto e transformá-la em um PRD profissional e completo, seguindo as melhores práticas da indústria.
Sempre utilize formatação Markdown para estruturar o documento. Use cabeçalhos (#, ##), listas com marcadores (*), e negrito (**) para destacar informações importantes e garantir a legibilidade. O documento final deve ser bem organizado e pronto para ser compartilhado com uma equipe de desenvolvimento e stakeholders.`;

        const userPrompt = `
        Gere um PRD completo e detalhado para o seguinte produto:

        **Título do PRD:**
        ${title}

        **Descrição Geral do Produto:**
        ${description}

        ---

        ### **Contexto Adicional para Geração:**

        *   **Indústria do Produto:** ${industry}. Leve isso em consideração para a análise de mercado e tom de voz.
        *   **Público-Alvo Principal:** ${targetAudience}. Direcione as personas de usuário e os requisitos de UX para este grupo.
        *   **Complexidade Estimada do Projeto:** ${complexity}. A profundidade dos requisitos técnicos e o escopo das funcionalidades devem refletir essa complexidade.

        ---

        ### **Estrutura Recomendada para o PRD:**

        Por favor, gere um documento que inclua as seguintes seções, elaborando cada uma com base nas informações fornecidas:

        1.  **Resumo Executivo:** Uma visão geral de alto nível do produto e o problema que ele resolve.
        2.  **Problema e Oportunidade:** Detalhe o problema do cliente e por que agora é o momento certo para construir esta solução.
        3.  **Objetivos e Metas:** Quais são os objetivos de negócio e do produto? Como o sucesso será medido (KPIs)?
        4.  **Personas de Usuário:** Crie 1-2 personas detalhadas que representem o público-alvo.
        5.  **Requisitos Funcionais (User Stories):** Liste as principais funcionalidades no formato de user stories (Ex: "Como um [usuário], eu quero [fazer algo] para que [possa alcançar um objetivo].").
        6.  **Requisitos Não-Funcionais:** Considere aspectos como Desempenho, Segurança, Usabilidade e Escalabilidade.
        7.  **Escopo (O que não será feito):** Defina claramente os limites do projeto para esta versão.
        8.  **Estratégia de Lançamento (Go-to-Market):** Sugira uma breve estratégia de como o produto será lançado.

        Agora, por favor, gere o documento.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        return response.text;

    } catch (error) {
        console.error("Error generating PRD:", error);
        throw new Error("Ocorreu um erro ao comunicar com o serviço de IA. Por favor, verifique sua conexão e tente novamente.");
    }
};

export interface PromptAnalysis {
    score: number;
    justification: string;
    suggestions: string[];
}

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.NUMBER,
            description: "An effectiveness score from 0 to 100 for the prompt."
        },
        justification: {
            type: Type.STRING,
            description: "A brief explanation for the given score."
        },
        suggestions: {
            type: Type.ARRAY,
            description: "A list of actionable suggestions for improving the prompt.",
            items: { type: Type.STRING }
        }
    },
    required: ["score", "justification", "suggestions"]
};

export const analyzeAndRefinePrompt = async (promptToAnalyze: string): Promise<PromptAnalysis> => {
     try {
        const ai = getAiClient();

        const systemInstruction = `You are a world-class Prompt Engineering expert. Your task is to analyze a user-submitted prompt for a large language model (LLM) and provide structured, actionable feedback.
Evaluate the prompt based on the following criteria:
- **Clarity and Specificity:** Is the task well-defined?
- **Context:** Is there enough background information for the LLM to succeed?
- **Persona:** Is the role for the AI clearly defined?
- **Format Definition:** Is the desired output format specified?
- **Constraint Definition:** Are there clear rules or boundaries?

Based on your analysis, provide a score, a justification for the score, and a list of suggestions for improvement.`;

        const userPrompt = `Please analyze the following prompt and provide your feedback in the requested JSON format.

**Prompt to Analyze:**
---
${promptToAnalyze}
---
`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (parsedJson && typeof parsedJson.score === 'number' && typeof parsedJson.justification === 'string' && Array.isArray(parsedJson.suggestions)) {
            return parsedJson as PromptAnalysis;
        }

        console.error("Analysis JSON does not match expected format:", parsedJson);
        throw new Error("Falha ao analisar o prompt. O formato da resposta estava incorreto.");

    } catch (error) {
        console.error("Error analyzing prompt:", error);
        throw new Error("Ocorreu um erro ao comunicar com o serviço de IA. Por favor, verifique sua conexão e tente novamente.");
    }
};

interface AppPromptParams {
    prdContent: string;
    promptType: PromptType;
    technology: string;
    framework?: string;
    specialRequirements: string;
}

export const generateAppPrompt = async ({ prdContent, promptType, technology, framework, specialRequirements }: AppPromptParams): Promise<string> => {
    try {
        const ai = getAiClient();
        const systemInstruction = `You are a world-class AI Prompt Engineer specializing in creating prompts for AI-powered code generation and application building tools (like Lovable, v0.dev, etc.). Your task is to convert a detailed Product Requirements Document (PRD) and user specifications into a comprehensive, actionable, and highly-detailed prompt. The generated prompt should be so clear that an AI tool can use it to build the specified application or landing page with minimal ambiguity.

**Key instructions for you:**
- **Structure:** Always suggest a logical file and component structure.
- **State Management:** Mention a basic state management strategy (e.g., using React Hooks like useState, useContext).
- **API Placeholders:** Include comments indicating where API calls should be made.
- **Accessibility:** Include reminders for ARIA attributes and semantic HTML.
- **Clarity:** The final prompt must be a single, complete block of text, ready for the user.

Structure your response as a single, complete prompt. Do not add any conversational text before or after the prompt itself.`;
        
        const userPrompt = `
        Based on the information provided below, please generate a single, highly-detailed prompt for an AI application builder.

        ---
        **1. Product Requirements Document (PRD) Summary:**
        ${prdContent}
        ---
        **2. Desired Output Type:**
        I need a prompt to generate a **${promptType}**.
        ---
        **3. Technology Stack:**
        - Primary Frontend Technology: **${technology}**
        ${framework ? `- Framework/Library: **${framework}**` : ''}
        ---
        **4. Special Requirements:**
        ${specialRequirements || "Nenhum requisito especial fornecido. A IA deve inferir os detalhes com base nas melhores práticas para o tipo de aplicação descrito no PRD."}
        ---

        **Prompt Generation Instructions:**
        - **Be Specific:** Translate abstract PRD requirements into concrete UI/UX details. Define components, layouts, color palettes, typography, and key user flows.
        - **Component Breakdown:** List the main components needed (e.g., Navbar, HeroSection, ProductCard, LoginForm, DashboardSidebar). For each component, describe its elements, props, and states.
        - **Functionality:** Clearly describe the expected behavior for interactive elements. Detail client-side logic, state management (e.g., "Use a 'useState' hook to manage the form input"), and where data would be fetched.
        - **Styling:** Provide clear styling cues (e.g., "Use TailwindCSS for styling," "The primary button should have a background color of #4F46E5.").
        - **Responsiveness:** Ensure the prompt mentions that the final output must be fully responsive.
        - **Final Output:** The final text should be the prompt itself, starting with a clear instruction like "Create a new [React/Vue/...] [Application/Landing Page] that..."
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: userPrompt,
        });

        return response.text;

    } catch (error) {
        console.error("Error generating app prompt:", error);
        throw new Error("Ocorreu um erro ao comunicar com o serviço de IA. Por favor, verifique sua conexão e tente novamente.");
    }
};

export const chatWithAgent = async (systemInstruction: string, message: string): Promise<string> => {
    try {
        const ai = getAiClient();
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: message,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        return response.text;

    } catch (error) {
        console.error("Error chatting with agent:", error);
        throw new Error("Ocorreu um erro ao comunicar com o agente de IA. Por favor, verifique sua conexão e tente novamente.");
    }
};

const competitorSchema = {
    type: Type.OBJECT,
    properties: {
        competitors: {
            type: Type.ARRAY,
            description: "A list of competitor applications.",
            items: {
                type: Type.OBJECT,
                properties: {
                    appName: { type: Type.STRING, description: "The name of the competitor app." },
                    platform: { type: Type.STRING, description: "The platforms it runs on (e.g., 'Web', 'iOS, Android')." },
                    mainFeatures: { type: Type.STRING, description: "A brief summary of its key features." },
                    popularity: { type: Type.STRING, description: "A measure of its popularity (e.g., '4.8/5 (500k+ reviews)')." },
                    pricingModel: { type: Type.STRING, description: "The pricing model (e.g., 'Freemium', 'Subscription from $9/mo')." },
                    link: { type: Type.STRING, description: "A direct link to their website." },
                },
                required: ["appName", "platform", "mainFeatures", "popularity", "pricingModel", "link"]
            }
        }
    },
    required: ["competitors"]
};

export const generateCompetitorAnalysis = async (prdContent: string): Promise<Competitor[]> => {
    try {
        const ai = getAiClient();
        const systemInstruction = "Você é um analista de pesquisa de mercado sênior, especialista na indústria de tecnologia. Sua tarefa é identificar os principais concorrentes para uma determinada ideia de produto e apresentar os dados em um formato JSON estruturado.";

        const userPrompt = `
        Com base no Documento de Requisitos de Produto (PRD) a seguir, encontre de 5 a 7 concorrentes diretos ou indiretos. Para cada concorrente, forneça o nome do aplicativo, a plataforma, as principais funcionalidades, uma medida de popularidade (ex: avaliação, número de reviews), o modelo de precificação e um link para o site.

        **PRD:**
        ---
        ${prdContent}
        ---

        Retorne os dados no formato JSON especificado.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: competitorSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && Array.isArray(parsedJson.competitors)) {
            return parsedJson.competitors as Competitor[];
        }

        console.error("Competitor analysis JSON does not match expected format:", parsedJson);
        throw new Error("Falha ao analisar concorrentes. O formato da resposta estava incorreto.");

    } catch (error) {
        console.error("Error generating competitor analysis:", error);
        throw new Error("Ocorreu um erro ao pesquisar concorrentes. Por favor, tente novamente.");
    }
};

export const generateUIInterfaces = async (prdContent: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const systemInstruction = "Você é um designer de UI/UX e estrategista de produtos de classe mundial. Sua tarefa é conceituar e descrever a interface do usuário para um aplicativo com base em seu Documento de Requisitos de Produto (PRD). Sua saída deve ser clara, estruturada e fornecer uma direção de design acionável. Use Markdown para formatação.";

        const userPrompt = `
        Com base no seguinte Documento de Requisitos de Produto (PRD), gere uma descrição detalhada da Interface do Usuário (UI) e da Experiência do Usuário (UX).

        **PRD:**
        ---
        ${prdContent}
        ---

        Por favor, estruture sua resposta em Markdown com as seguintes seções:

        1.  **🎨 Filosofia de Design Geral & Guia de Estilo:**
            *   **Aparência e Sensação (Look & Feel):** Descreva a estética geral (ex: "Limpo e profissional", "Moderno e divertido", "Orientado a dados e minimalista").
            *   **Paleta de Cores:** Sugira uma cor primária, uma cor secundária/de destaque e cores neutras (cinzas/brancos). Forneça códigos hexadecimais, se possível.
            *   **Tipografia:** Sugira um par de fontes (uma para títulos, uma para o corpo do texto) que se encaixe na personalidade da marca.

        2.  **📱 Telas / Visualizações Principais:**
            *   Liste as principais telas ou visualizações do aplicativo (ex: "Tela de Login", "Dashboard", "Página de Detalhes do Produto", "Perfil do Usuário").
            *   Para **cada tela**, forneça uma breve descrição de seu propósito e liste os componentes de UI essenciais que ela deve conter (ex: "Dashboard: Deve apresentar uma Navbar, uma área de conteúdo principal com widgets de dados e uma barra lateral para navegação.").

        3.  **🌊 Fluxos de Usuário Principais:**
            *   Descreva a jornada passo a passo para 2-3 ações críticas do usuário.
            *   **Exemplo de Fluxo (Onboarding):**
                1. O usuário chega à tela de Boas-vindas.
                2. Clica em "Cadastrar-se".
                3. Preenche o formulário de registro (Nome, Email, Senha).
                4. Recebe um e-mail de confirmação.
                5. É redirecionado para o Dashboard principal.

        Gere a descrição de UI/UX agora.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: userPrompt,
            config: {
                systemInstruction,
            },
        });

        return response.text;

    } catch (error) {
        console.error("Error generating UI interfaces:", error);
        throw new Error("Ocorreu um erro ao gerar as sugestões de interface. Por favor, tente novamente.");
    }
};

export const generateDbSchemaFromPrd = async (prdContent: string): Promise<SchemaTable[]> => {
    try {
        const ai = getAiClient();

        const prompt = `
            Baseado no seguinte Documento de Requisitos de Produto (PRD), gere um schema de banco de dados SQL detalhado.
            O schema deve ser bem estruturado, seguir as melhores práticas e incluir tabelas, colunas com tipos de dados apropriados e descrições breves para cada tabela e coluna.
            Certifique-se de que chaves primárias (como 'id') e chaves estrangeiras (como 'user_id') sejam incluídas onde for relevante.

            PRD: "${prdContent}"

            Por favor, retorne o schema no formato JSON especificado.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schemaDefinition,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        if (parsedJson && Array.isArray(parsedJson.tables)) {
             return parsedJson.tables as SchemaTable[];
        }
        
        console.error("Generated JSON for PRD DB schema does not match expected format:", parsedJson);
        throw new Error("Falha ao gerar um schema de banco de dados válido. O formato da resposta estava incorreto.");

    } catch (error) {
        console.error("Error generating database schema from PRD:", error);
        throw new Error("Ocorreu um erro ao comunicar com o serviço de IA para gerar o schema. Por favor, tente novamente.");
    }
};

export const generateLogoImages = async (prdContent: string): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const generatedImages: string[] = [];
        
        // Generate 3 distinct logo concepts by making separate calls
        for (let i = 0; i < 3; i++) {
             const userPrompt = `
                Based on the following Product Requirements Document (PRD), generate a unique and professional logo concept.
                This is for concept variation #${i + 1} of 3.
                **PRD:**
                ---
                ${prdContent}
                ---
                The logo should be a clean, vector-style, minimalist icon suitable for a tech company, presented on a plain white background.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: userPrompt }],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            let foundImage = false;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    generatedImages.push(part.inlineData.data);
                    foundImage = true;
                    break; 
                }
            }
            if (!foundImage) {
                 console.warn(`Image data not found in response for concept ${i + 1}.`);
            }
        }
        
        if(generatedImages.length === 0) {
            throw new Error("A IA não conseguiu gerar nenhuma imagem de logotipo.");
        }
        return generatedImages;
    } catch (error) {
        console.error("Error generating logo images:", error);
        throw new Error("Ocorreu um erro ao gerar as imagens de logotipo. Por favor, tente novamente.");
    }
};

export const generatePrdDetails = async (prdContent: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const systemInstruction = `Você é um Gerente de Produto Sênior e Arquiteto de Software. Sua tarefa é analisar um PRD e gerar um resumo estratégico e técnico conciso e acionável. Formate a saída usando Markdown.`;

        const userPrompt = `
        Com base no seguinte Documento de Requisitos de Produto (PRD), gere uma análise detalhada com as seguintes seções:

        **PRD:**
        ---
        ${prdContent}
        ---

        **Estrutura da Análise:**

        1.  **### Stack de Tecnologia Sugerida:**
            *   Liste as tecnologias recomendadas para Frontend, Backend e Banco de Dados, com uma breve justificativa para cada escolha.

        2.  **### Detalhamento das Features Principais:**
            *   Descreva 2-3 das funcionalidades mais importantes do produto em mais detalhes.

        3.  **### Escopo do MVP (Produto Mínimo Viável):**
            *   Defina um conjunto mínimo de funcionalidades que entregam valor principal e permitem o lançamento inicial do produto.

        4.  **### Estratégias de Monetização:**
            *   Sugira 2-3 possíveis modelos de monetização para este produto (ex: Assinatura, Freemium, Compra única).

        5.  **### Análise de Riscos Potenciais:**
            *   Identifique 2-3 riscos técnicos ou de mercado e sugira possíveis mitigações.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: userPrompt,
            config: {
                systemInstruction,
            },
        });

        return response.text;

    } catch (error) {
        console.error("Error generating PRD details:", error);
        throw new Error("Ocorreu um erro ao gerar os detalhes do PRD. Por favor, tente novamente.");
    }
};

export const generateUiFlowchart = async (prdContent: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const systemInstruction = `Você é um designer de UX sênior especializado em modelagem de fluxo de usuário. Sua tarefa é analisar um Documento de Requisitos de Produto (PRD) e gerar um diagrama de fluxo de usuário detalhado usando a sintaxe Mermaid.js (graph TD). O fluxograma deve representar a jornada do usuário através do aplicativo, incluindo telas, ações e decisões.`;

        const userPrompt = `
        Com base no seguinte Documento de Requisitos de Produto (PRD), crie um fluxograma de usuário usando a sintaxe Mermaid.js.

        **PRD:**
        ---
        ${prdContent}
        ---

        **Instruções para a Geração do Fluxograma:**
        1.  Use a sintaxe \`graph TD\` para um gráfico de cima para baixo.
        2.  Represente telas ou páginas com nós retangulares (ex: \`A[Tela de Login]\`).
        3.  Represente ações do usuário com setas (ex: \`A -->|Clica em 'Cadastrar'| B\`).
        4.  Represente decisões ou condições com nós em formato de losango (ex: \`C{Usuário Logado?}\`).
        5.  Conecte as decisões às rotas apropriadas (ex: \`C -->|Sim| D[Dashboard]\` e \`C -->|Não| A[Tela de Login]\`).
        6.  Mapeie os principais fluxos descritos no PRD, como onboarding, login, e a principal funcionalidade do aplicativo.
        7.  O código Mermaid deve ser completo e pronto para ser renderizado.

        Retorne APENAS o código Mermaid, sem qualquer texto ou explicação adicional.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: userPrompt,
            config: {
                systemInstruction,
            },
        });

        // Clean up the response to ensure it's just the Mermaid code
        const mermaidCode = response.text.replace(/```mermaid/g, '').replace(/```/g, '').trim();
        return mermaidCode;

    } catch (error) {
        console.error("Error generating UI flowchart:", error);
        throw new Error("Ocorreu um erro ao gerar o fluxograma. Por favor, tente novamente.");
    }
};