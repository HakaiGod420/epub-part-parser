import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadTranslationContextSettings } from './chapterContext';
import { openRouterService, OpenRouterSettings } from './openRouterService';
import { deepSeekService, DeepSeekSettings } from './deepSeekService';

export type TranslationProvider = 'google' | 'openrouter' | 'deepseek';

export interface AIConfig {
  topP?: number;
  temperature?: number;
  thinkingBudget?: number;
  maxOutputTokens?: number;
}

export interface TranslationSettings {
  provider: TranslationProvider;
  apiKey: string;
  model: string;
  systemInstruction: string;
  aiConfig: AIConfig;
}

export interface TranslationProviderSettings {
  currentProvider: TranslationProvider;
  googleSettings: TranslationSettings;
  openRouterSettings: OpenRouterSettings;
  deepSeekSettings: DeepSeekSettings;
}

export const GEMINI_MODELS = [
  'gemini-3-pro-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-live',
  'gemini-2.0-flash-live'
];

export const DEFAULT_AI_CONFIG: AIConfig = {
  topP: 0.95,
  temperature: 1.0,
  thinkingBudget: -1,
  maxOutputTokens: 8192,
};

export const DEFAULT_SYSTEM_INSTRUCTION = `Core Objective
Your primary function is to translate Korean fictional narratives (web novels, short stories, etc.) into masterful English. The final output should be so fluid and natural that it reads as if it were originally crafted in English, while remaining deeply faithful to the author's original voice, style, and intent.

Guiding Principles
These principles will guide your translation process, ordered by importance.

1. Authenticity & Intent (The "Spirit" of the Law)
This is your most crucial directive. Your goal is not a rigid, word-for-word translation, but a faithful transfer of meaning, tone, character voice, and authorial intent.

Preserve the Core: Never add, omit, or summarize information. The reader must receive the full story as the author wrote it.

Capture the Mood: If the original text is tense, make the English tense. If it's humorous, make it funny. The emotional core of a scene must be preserved.

Maintain Character Voice: Ensure each character's dialogue is consistent. An elder who speaks formally should not suddenly use modern slang. A shy character's speech should reflect their personality.

2. Fluency & Enhancement (The "Readability" Factor)
While preserving intent is key, the final text must not be awkward. You are empowered to improve and adapt the text for a native English-speaking audience.

Sentence Restructuring: Do not feel bound to the original Korean sentence structure. Reorganize clauses and phrases to create elegant, impactful English sentences.

Quality Enhancement: If the source text contains awkward phrasing, repetitive wording, or minor grammatical errors that are clearly unintentional, you should refine and polish the prose in your translation. Elevate low-quality writing to be clear, engaging, and well-written English while preserving the original meaning. Make sentences flow naturally and read smoothly.

Vocabulary Choice: Use a rich and varied English vocabulary that best captures the nuance of the original Korean words. For example, instead of always translating "걸었다" as "walked," consider context and use "strolled," "trudged," "paced," or "marched" where appropriate.

3. Contextual & Cultural Adaptation
This is where true artistry comes in. Direct translations often fail when it comes to culture-specific elements.

Idioms and Puns: Find a functionally equivalent English idiom or rework the sentence to convey the intended meaning of a pun. Do not translate them literally.

Honorifics: Instead of directly translating terms like "-nim" or "-ssi," convey the level of respect or formality through dialogue. For example, a formal address might be translated as "Sir," "Ma'am," or simply by using more formal English sentence structures. If a specific title is critical to the plot, you may include it and provide a brief, seamless explanation.

Cultural Nuances: For concepts unique to Korean culture, find the closest English equivalent or rephrase the sentence to make the meaning clear without pulling the reader out of the story.

4. Absolute Neutrality (Uncensored Content)
You will translate all content without judgment or alteration. The source material is fiction. This includes themes, scenes, and dialogue that may be mature, violent, or sexual. Do not censor, soften, or add any disclaimers or moral commentary.

Formatting for an Immersive Experience
Proper formatting is essential for readability.

Paragraphs for Pacing: Break up long walls of text into shorter, digestible paragraphs. Use paragraph length to control the pacing of the story—shorter for action, longer for description. Add paragraph breaks where natural pauses occur in the narrative.

Dialogue Formatting (CRITICAL):

Use standard English quotation marks (" ").

EVERY piece of dialogue from a different speaker MUST start on a new line. Never place multiple speakers' dialogue on the same line.

Incorrect: "Hello," she said. "Hi there," he replied.
Correct:
"Hello," she said.
"Hi there," he replied.

Even short exchanges must follow this rule:
Incorrect: "Yes." "No." "Maybe."
Correct:
"Yes."
"No."
"Maybe."

Dialogue tags and actions related to a speaker stay on the same line as their dialogue.

Internal Monologue: Thoughts or internal reflections should be italicized to distinguish them from narration.
*I can't believe he just said that,* she thought.

Scene Breaks (IMPORTANT - USE SPARINGLY):
Only use scene break markers (***) for SIGNIFICANT transitions:
- Major time skips (hours, days, weeks later)
- Complete location changes (moving to a different setting)
- POV (Point of View) changes between characters

DO NOT use scene breaks for:
- Minor pauses in conversation
- Small moments of silence
- Brief transitions within the same scene
- Emotional beats or dramatic pauses

Format for scene breaks:
[blank line]
***
[blank line]

Example of proper scene break usage:
...and with that, he left the room.

***

Three years later, the city was a different place.

Emphasis & Special Text:

Use italics for words the author intended to emphasize.

Onomatopoeia and sound effects (e.g., *Thump*, *Crash*, *Whoosh*) should also be italicized.

Additional Directives
Point of View (POV): The translation must accurately reflect the narrative's perspective, as it can vary. Distinguish between first-person, third-person, or other POVs as needed.

Completeness: You must translate all provided text without skipping any parts or words. Every piece of the original content must be present in the final English version.

External Resources: Utilize any provided dictionaries or glossaries, including character names, gender-specific terms, or unique vocabulary, to ensure consistency and accuracy.

Chapter Names: If the source text includes a chapter name, it should be included and formatted appropriately. If no chapter name is provided, do not create one.

Scope: The final output must be a direct translation into English. Do not create new content, continue the story, or alter the original narrative.

Final Output: The final translated text should contain only the narrative itself. Any dictionaries, glossaries, or other external information used for the translation process should not be included in the response.

Final Mandate
Act as a transparent yet intelligent bridge between the Korean author and the English reader. Prioritize authentic intent over literal translation, ensure the final text is fluent and beautifully written, and format it for a seamless reading experience.`;

export const TABLE_FORMATTING_INSTRUCTION = `

Enhanced Table & Structured Information Formatting
When encountering structured information such as status screens, character stats, system notifications, inventory lists, skill descriptions, or any tabular data (commonly found in game system novels), apply the following enhanced formatting:

1. **Status Screens & Character Stats**: Format character information, levels, attributes, and stats in clean, organized layouts:
   - Use consistent spacing and alignment
   - Group related information logically
   - Preserve hierarchical structure (main stats, sub-stats, etc.)
   - Example format:
     Name: [Character Name]
     Level: [Number]
     Class: [Class Name]
     
     Attributes:
     • Strength: [Value]
     • Agility: [Value]
     • Intelligence: [Value]

2. **System Notifications & Messages**: Format game system messages, notifications, and prompts clearly:
   - Use consistent formatting for similar types of messages
   - Distinguish between different message types (alerts, confirmations, rewards)
   - Preserve any special formatting that indicates importance

3. **Inventory & Item Lists**: Format item lists, inventories, and equipment clearly:
   - Use bullet points or numbered lists appropriately
   - Include item quantities, descriptions, and properties in a readable format
   - Group similar items when logical

4. **Skill Trees & Abilities**: Format skill descriptions, ability lists, and progression trees:
   - Use clear headings for skill categories
   - Include prerequisites, costs, and effects in organized manner
   - Preserve any branching or hierarchical relationships

5. **Tables & Data**: For any tabular information:
   - Maintain column alignment where possible
   - Use consistent spacing between columns
   - Preserve row and column relationships
   - Use dividers or spacing to separate sections when needed

The goal is to make structured information as readable and visually organized as possible while maintaining all original information and meaning.`;

export class TranslationService {
  private genAI: GoogleGenerativeAI | null = null;
  private settings: TranslationSettings | null = null;
  private providerSettings: TranslationProviderSettings | null = null;

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    // Load legacy settings first for backward compatibility
    const storedSettings = localStorage.getItem('translationSettings');
    const providerSettings = localStorage.getItem('translationProviderSettings');
    
    if (providerSettings) {
      try {
        this.providerSettings = JSON.parse(providerSettings);
        this.updateCurrentSettings();
      } catch (error) {
        console.error('Failed to load provider settings:', error);
      }
    } else if (storedSettings) {
      // Migrate legacy settings
      try {
        const parsedSettings = JSON.parse(storedSettings);
        const googleSettings = {
          provider: 'google' as TranslationProvider,
          ...parsedSettings,
          aiConfig: { ...DEFAULT_AI_CONFIG, ...(parsedSettings.aiConfig || {}) }
        };
        
        this.providerSettings = {
          currentProvider: 'google',
          googleSettings,
          openRouterSettings: {
            apiKey: '',
            model: '',
            baseUrl: 'https://openrouter.ai/api/v1',
            siteUrl: 'https://epub-parser.local',
            siteName: 'EPUB Parser'
          },
          deepSeekSettings: {
            apiKey: '',
            model: 'deepseek-chat',
            baseUrl: 'https://api.deepseek.com'
          }
        };
        
        this.saveProviderSettings(this.providerSettings);
        this.updateCurrentSettings();
      } catch (error) {
        console.error('Failed to migrate legacy settings:', error);
      }
    }
  }

  private updateCurrentSettings(): void {
    if (!this.providerSettings) return;

    if (this.providerSettings.currentProvider === 'google') {
      this.settings = this.providerSettings.googleSettings;
      if (this.settings?.apiKey) {
        this.genAI = new GoogleGenerativeAI(this.settings.apiKey);
      }
    } else if (this.providerSettings.currentProvider === 'openrouter') {
      // Convert OpenRouter settings to TranslationSettings format for compatibility
      const orSettings = this.providerSettings.openRouterSettings;
      this.settings = {
        provider: 'openrouter',
        apiKey: orSettings.apiKey,
        model: orSettings.model,
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
        aiConfig: DEFAULT_AI_CONFIG
      };
      openRouterService.saveSettings(orSettings);
    } else if (this.providerSettings.currentProvider === 'deepseek') {
      // Convert DeepSeek settings to TranslationSettings format for compatibility
      const dsSettings = this.providerSettings.deepSeekSettings;
      this.settings = {
        provider: 'deepseek',
        apiKey: dsSettings.apiKey,
        model: dsSettings.model,
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
        aiConfig: DEFAULT_AI_CONFIG
      };
      deepSeekService.saveSettings(dsSettings);
    }
  }

  public saveSettings(settings: TranslationSettings): void {
    // Ensure aiConfig has all required properties with defaults
    const settingsWithDefaults = {
      ...settings,
      aiConfig: { ...DEFAULT_AI_CONFIG, ...settings.aiConfig }
    };
    
    if (!this.providerSettings) {
      this.providerSettings = {
        currentProvider: settings.provider || 'google',
        googleSettings: settingsWithDefaults,
        openRouterSettings: {
          apiKey: '',
          model: '',
          baseUrl: 'https://openrouter.ai/api/v1',
          siteUrl: 'https://epub-parser.local',
          siteName: 'EPUB Parser'
        },
        deepSeekSettings: {
          apiKey: '',
          model: 'deepseek-chat',
          baseUrl: 'https://api.deepseek.com'
        }
      };
    }

    if (settings.provider === 'google') {
      this.providerSettings.googleSettings = settingsWithDefaults;
      this.genAI = new GoogleGenerativeAI(settings.apiKey);
    } else if (settings.provider === 'openrouter') {
      // Update OpenRouter settings
      const orSettings = {
        apiKey: settings.apiKey,
        model: settings.model,
        baseUrl: 'https://openrouter.ai/api/v1',
        siteUrl: 'https://epub-parser.local',
        siteName: 'EPUB Parser'
      };
      this.providerSettings.openRouterSettings = orSettings;
      openRouterService.saveSettings(orSettings);
    } else if (settings.provider === 'deepseek') {
      // Update DeepSeek settings
      const dsSettings = {
        apiKey: settings.apiKey,
        model: settings.model,
        baseUrl: 'https://api.deepseek.com'
      };
      this.providerSettings.deepSeekSettings = dsSettings;
      deepSeekService.saveSettings(dsSettings);
    }

    this.providerSettings.currentProvider = settings.provider || 'google';
    this.settings = settingsWithDefaults;
    this.saveProviderSettings(this.providerSettings);
  }

  private saveProviderSettings(settings: TranslationProviderSettings): void {
    localStorage.setItem('translationProviderSettings', JSON.stringify(settings));
  }

  public getSettings(): TranslationSettings | null {
    return this.settings;
  }

  public getProviderSettings(): TranslationProviderSettings | null {
    return this.providerSettings;
  }

  public getCurrentProvider(): TranslationProvider {
    return this.providerSettings?.currentProvider || 'google';
  }

  public switchProvider(provider: TranslationProvider): void {
    if (!this.providerSettings) return;
    
    this.providerSettings.currentProvider = provider;
    this.saveProviderSettings(this.providerSettings);
    this.updateCurrentSettings();
  }

  public isConfigured(): boolean {
    const provider = this.getCurrentProvider();
    if (provider === 'google') {
      return !!(this.settings?.apiKey && this.settings?.model);
    } else if (provider === 'openrouter') {
      return openRouterService.isConfigured();
    } else if (provider === 'deepseek') {
      return deepSeekService.isConfigured();
    }
    return false;
  }

  private buildSystemInstruction(): string {
    const baseInstruction = this.settings?.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION;
    const contextSettings = loadTranslationContextSettings();
    
    if (contextSettings.enhanceTableFormatting) {
      return baseInstruction + TABLE_FORMATTING_INSTRUCTION;
    }
    
    return baseInstruction;
  }

  public async translateText(text: string): Promise<string> {
    const provider = this.getCurrentProvider();
    
    if (provider === 'google') {
      if (!this.genAI || !this.settings) {
        throw new Error('Google translation service not configured. Please set up API key and model in settings.');
      }

      try {
        const aiConfig = this.settings.aiConfig || DEFAULT_AI_CONFIG;
        const generationConfig: any = {};
        
        if (aiConfig.topP !== undefined) generationConfig.topP = aiConfig.topP;
        if (aiConfig.temperature !== undefined) generationConfig.temperature = aiConfig.temperature;
        if (aiConfig.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = aiConfig.maxOutputTokens;
        
        const modelConfig: any = {
          model: this.settings.model,
          systemInstruction: this.buildSystemInstruction(),
          generationConfig
        };

        // Add thinking config if thinkingBudget is set
        if (aiConfig.thinkingBudget !== undefined && aiConfig.thinkingBudget !== -1) {
          modelConfig.thinkingConfig = {
            thinkingBudget: aiConfig.thinkingBudget
          };
        }

        const model = this.genAI.getGenerativeModel(modelConfig);
        const result = await model.generateContent(text);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error('Google translation error:', error);
        throw new Error(`Google translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (provider === 'openrouter') {
      try {
        return await openRouterService.translateText(text, this.buildSystemInstruction());
      } catch (error) {
        console.error('OpenRouter translation error:', error);
        throw error;
      }
    } else if (provider === 'deepseek') {
      try {
        return await deepSeekService.translateText(text, this.buildSystemInstruction());
      } catch (error) {
        console.error('DeepSeek translation error:', error);
        throw error;
      }
    } else {
      throw new Error('Translation service not configured. Please set up API key and model in settings.');
    }
  }

  public async translateTextStream(text: string, onChunk: (chunk: string) => void): Promise<void> {
    const provider = this.getCurrentProvider();
    
    if (provider === 'google') {
      if (!this.genAI || !this.settings) {
        throw new Error('Google translation service not configured. Please set up API key and model in settings.');
      }

      try {
        const aiConfig = this.settings.aiConfig || DEFAULT_AI_CONFIG;
        const generationConfig: any = {};
        
        if (aiConfig.topP !== undefined) generationConfig.topP = aiConfig.topP;
        if (aiConfig.temperature !== undefined) generationConfig.temperature = aiConfig.temperature;
        if (aiConfig.maxOutputTokens !== undefined) generationConfig.maxOutputTokens = aiConfig.maxOutputTokens;
        
        const modelConfig: any = {
          model: this.settings.model,
          systemInstruction: this.buildSystemInstruction(),
          generationConfig
        };

        // Add thinking config if thinkingBudget is set
        if (aiConfig.thinkingBudget !== undefined && aiConfig.thinkingBudget !== -1) {
          modelConfig.thinkingConfig = {
            thinkingBudget: aiConfig.thinkingBudget
          };
        }

        const model = this.genAI.getGenerativeModel(modelConfig);
        const result = await model.generateContentStream(text);
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            onChunk(chunkText);
          }
        }
      } catch (error) {
        console.error('Google translation error:', error);
        throw new Error(`Google translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (provider === 'openrouter') {
      try {
        await openRouterService.translateTextStream(text, this.buildSystemInstruction(), onChunk);
      } catch (error) {
        console.error('OpenRouter translation error:', error);
        throw error;
      }
    } else if (provider === 'deepseek') {
      try {
        await deepSeekService.translateTextStream(text, this.buildSystemInstruction(), onChunk);
      } catch (error) {
        console.error('DeepSeek translation error:', error);
        throw error;
      }
    } else {
      throw new Error('Translation service not configured. Please set up API key and model in settings.');
    }
  }
}

export const translationService = new TranslationService();
