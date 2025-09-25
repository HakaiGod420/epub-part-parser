import axios from 'axios';

export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
}

export interface OpenRouterSettings {
  apiKey: string;
  model: string;
  baseUrl?: string;
  siteUrl?: string;
  siteName?: string;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const DEFAULT_OPENROUTER_SETTINGS: Partial<OpenRouterSettings> = {
  baseUrl: 'https://openrouter.ai/api/v1',
  siteUrl: 'https://epub-parser.local',
  siteName: 'EPUB Parser',
};

export class OpenRouterService {
  private settings: OpenRouterSettings | null = null;
  private cachedModels: OpenRouterModel[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    const storedSettings = localStorage.getItem('openRouterSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        this.settings = {
          ...DEFAULT_OPENROUTER_SETTINGS,
          ...parsedSettings
        };
      } catch (error) {
        console.error('Failed to load OpenRouter settings:', error);
      }
    }
  }

  public saveSettings(settings: OpenRouterSettings): void {
    const settingsWithDefaults = {
      ...DEFAULT_OPENROUTER_SETTINGS,
      ...settings
    };
    
    this.settings = settingsWithDefaults;
    localStorage.setItem('openRouterSettings', JSON.stringify(settingsWithDefaults));
    
    // Clear cache when settings change (especially API key)
    this.clearCache();
  }

  private clearCache(): void {
    this.cachedModels = null;
    this.cacheTimestamp = 0;
  }

  public getSettings(): OpenRouterSettings | null {
    return this.settings;
  }

  public isConfigured(): boolean {
    return !!(this.settings?.apiKey && this.settings?.model);
  }

  public async getAvailableModels(): Promise<OpenRouterModel[]> {
    // Check cache first
    const now = Date.now();
    if (this.cachedModels && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedModels;
    }

    try {
      // No authentication needed for getting model list
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {},
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const body = await response.json();

      // Extract minimal data with less aggressive filtering - include more models
      const models = body.data
        .filter((model: any) => {
          const id = model.id || '';
          return id && 
                 !id.includes('beta') && // Only filter out beta versions
                 (model.context_length || model.top_provider?.context_length) >= 2000; // Lower minimum context
        })
        .slice(0, 100) // Increased limit to 100 models
        .map((model: any) => ({
          id: model.id,
          name: model.name || model.id.split('/').pop() || model.id,
          context_length: model.context_length || model.top_provider?.context_length || 4096
        }))
        .sort((a: OpenRouterModel, b: OpenRouterModel) => a.name.localeCompare(b.name));

      // Cache the results
      this.cachedModels = models;
      this.cacheTimestamp = now;

      return models;
    } catch (error) {
      console.error('Failed to fetch OpenRouter models:', error);
      throw new Error(`Failed to fetch models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async translateText(text: string, systemInstruction: string): Promise<string> {
    if (!this.settings?.apiKey || !this.settings?.model) {
      throw new Error('OpenRouter service not configured. Please set up API key and model in settings.');
    }

    try {
      const response = await axios.post(
        `${this.settings.baseUrl}/chat/completions`,
        {
          model: this.settings.model,
          messages: [
            {
              role: 'system',
              content: systemInstruction
            },
            {
              role: 'user',
              content: text
            }
          ],
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.settings.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.settings.siteUrl || '',
            'X-Title': this.settings.siteName || '',
          }
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('Invalid response format from OpenRouter');
      }
    } catch (error) {
      console.error('OpenRouter translation error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        throw new Error(`OpenRouter translation failed: ${errorMessage}`);
      }
      throw new Error(`OpenRouter translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async translateTextStream(
    text: string, 
    systemInstruction: string, 
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.settings?.apiKey || !this.settings?.model) {
      throw new Error('OpenRouter service not configured. Please set up API key and model in settings.');
    }

    try {
      const response = await fetch(`${this.settings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.settings.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.settings.siteUrl || '',
          'X-Title': this.settings.siteName || '',
        },
        body: JSON.stringify({
          model: this.settings.model,
          messages: [
            {
              role: 'system',
              content: systemInstruction
            },
            {
              role: 'user',
              content: text
            }
          ],
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                return;
              }
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  onChunk(content);
                }
              } catch (e) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('OpenRouter streaming translation error:', error);
      if (error instanceof Error) {
        throw new Error(`OpenRouter streaming translation failed: ${error.message}`);
      }
      throw new Error('OpenRouter streaming translation failed: Unknown error');
    }
  }
}

export const openRouterService = new OpenRouterService();