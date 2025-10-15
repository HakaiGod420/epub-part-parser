import OpenAI from "openai";

export interface DeepSeekSettings {
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export const DEEPSEEK_MODELS = [
  'deepseek-chat',
  'deepseek-reasoner'
];

const DEFAULT_DEEPSEEK_SETTINGS: Partial<DeepSeekSettings> = {
  baseUrl: 'https://api.deepseek.com',
};

export class DeepSeekService {
  private settings: DeepSeekSettings | null = null;
  private client: OpenAI | null = null;

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    const storedSettings = localStorage.getItem('deepSeekSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        this.settings = {
          ...DEFAULT_DEEPSEEK_SETTINGS,
          ...parsedSettings
        };
      } catch (error) {
        console.error('Failed to load DeepSeek settings:', error);
      }
    }
  }

  public saveSettings(settings: DeepSeekSettings): void {
    const settingsWithDefaults = {
      ...DEFAULT_DEEPSEEK_SETTINGS,
      ...settings
    };

    this.settings = settingsWithDefaults;
    localStorage.setItem('deepSeekSettings', JSON.stringify(settingsWithDefaults));

    // Update client when settings change
    this.client = null;
  }

  public getSettings(): DeepSeekSettings | null {
    return this.settings;
  }

  private getClient(): OpenAI {
    if (this.client) return this.client;

    if (!this.settings?.apiKey || !this.settings?.model) {
      throw new Error('DeepSeek service not configured. Please set up API key and model in settings.');
    }

    this.client = new OpenAI({
      baseURL: this.settings.baseUrl,
      apiKey: this.settings.apiKey,
      dangerouslyAllowBrowser: true, // Acknowledging browser environment risks
    });

    return this.client;
  }

  public isConfigured(): boolean {
    return !!(this.settings?.apiKey && this.settings?.model);
  }

  public async translateText(text: string, systemInstruction: string): Promise<string> {
    const client = this.getClient();

    try {
      const completion = await client.chat.completions.create({
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: text }
        ],
        model: this.settings!.model,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('DeepSeek translation error:', error);
      if (error instanceof Error) {
        throw new Error(`DeepSeek translation failed: ${error.message}`);
      }
      throw new Error('DeepSeek translation failed: Unknown error');
    }
  }

  public async translateTextStream(
    text: string,
    systemInstruction: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const client = this.getClient();

    try {
      const stream = await client.chat.completions.create({
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: text }
        ],
        model: this.settings!.model,
        stream: true,
      });

      for await (const chunk of stream) {
        const chunkContent = chunk.choices[0]?.delta?.content;
        if (chunkContent) {
          onChunk(chunkContent);
        }
      }
    } catch (error) {
      console.error('DeepSeek streaming translation error:', error);
      if (error instanceof Error) {
        throw new Error(`DeepSeek streaming translation failed: ${error.message}`);
      }
      throw new Error('DeepSeek streaming translation failed: Unknown error');
    }
  }
}

export const deepSeekService = new DeepSeekService();
