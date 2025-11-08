import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Extended Term Description System
 * 
 * This service manages extended (long-form) descriptions for dictionary terms.
 * Key principles:
 * - Short descriptions (1 sentence) remain in the main dictionary for translation
 * - Extended descriptions (1-10 sentences) are stored locally and never transmitted
 * - Client-side generation ensures privacy and creative control
 */

// ===== TYPE DEFINITIONS =====

export interface ShortDescription {
  term: string;
  explanation: string; // 1 sentence, includes gender and core traits
}

export interface ExtendedDescription {
  term: string;
  shortDescription: string; // The concise 1-sentence version
  longDescription: string; // The detailed 1-10 sentence version
  category?: string; // Character, Place, Concept, etc.
  gender?: string; // For characters: male, female, other
  lastUpdated: number; // Timestamp
  sourceContext?: string; // Optional: text snippet that prompted this description
}

export interface DescriptionProposal {
  term: string;
  proposedShort: string;
  proposedLong: string;
  category: string;
  confidence: number;
  contextSnippet: string; // The text that triggered this proposal
}

export interface UpdateProposal {
  term: string;
  currentShort: string;
  currentLong: string;
  proposedShort: string;
  proposedLong: string;
  reason: string; // Why this update is suggested
}

export interface GenerationContext {
  term: string;
  category: string;
  sourceText: string; // The translated text containing the term
  existingDescription?: ExtendedDescription;
}

// ===== CONSTANTS =====

const EXTENDED_DESCRIPTIONS_KEY = 'extendedDescriptions';

const GENERATION_SYSTEM_INSTRUCTION = `You are a creative assistant that generates rich, immersive descriptions for narrative elements like characters, places, and concepts.

Your task is to create two types of descriptions:

1. SHORT DESCRIPTION (2-4 words ONLY):
   - ULTRA-MINIMAL identifier
   - For characters: just gender and basic role/trait (e.g., "female elf", "male knight", "young protagonist")
   - For places: just type (e.g., "ancient city", "magic academy", "royal palace")
   - For concepts: just category (e.g., "fire magic", "noble title", "healing spell")
   - NO full sentences, NO detailed descriptions in short form

2. LONG DESCRIPTION (1-10 sentences):
   - Provide vivid, immersive details that help with creative storytelling
   - For characters: appearance, personality, backstory, motivations, relationships
   - For places: atmosphere, history, significance, sensory details
   - For concepts: meaning, cultural context, implications
   - Use evocative language that brings the element to life
   - Keep it concise but rich (aim for 3-7 sentences typically)

Guidelines:
- Base descriptions on the provided text context
- Infer details logically from the narrative
- For characters, always specify gender in short description
- Be creative but stay grounded in the source material
- Use present tense for timeless qualities
- Focus on what makes this element unique and memorable
- SHORT = 2-4 words max (e.g., "female warrior", "ancient temple")
- LONG = Rich storytelling details

Return your response in JSON format:
{
  "shortDescription": "female elf",
  "longDescription": "Detailed multi-sentence description with vivid imagery and context",
  "category": "Character|Place|Concept|Item|Other",
  "gender": "male|female|other|unknown" // For characters only
}`;

// ===== SERVICE CLASS =====

export class ExtendedDescriptionService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string | null = null;
  private model: string = 'gemini-2.5-flash';

  constructor() {
    this.loadApiConfig();
  }

  // ===== CONFIGURATION =====

  private loadApiConfig(): void {
    // Try to use the translation service API key
    const translationSettings = localStorage.getItem('translationSettings');
    if (translationSettings) {
      try {
        const settings = JSON.parse(translationSettings);
        if (settings.apiKey) {
          this.apiKey = settings.apiKey;
          this.genAI = new GoogleGenerativeAI(settings.apiKey);
        }
      } catch (error) {
        console.error('Failed to load API config for extended descriptions:', error);
      }
    }
  }

  public isConfigured(): boolean {
    return !!(this.apiKey && this.genAI);
  }

  // ===== LOCAL STORAGE MANAGEMENT =====

  public getExtendedDescriptions(): Map<string, ExtendedDescription> {
    try {
      const stored = localStorage.getItem(EXTENDED_DESCRIPTIONS_KEY);
      if (!stored) return new Map();

      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    } catch (error) {
      console.error('Error loading extended descriptions:', error);
      return new Map();
    }
  }

  public getExtendedDescription(term: string): ExtendedDescription | null {
    const descriptions = this.getExtendedDescriptions();
    return descriptions.get(term.toLowerCase()) || null;
  }

  public saveExtendedDescription(description: ExtendedDescription): void {
    try {
      const descriptions = this.getExtendedDescriptions();
      descriptions.set(description.term.toLowerCase(), description);

      const obj = Object.fromEntries(descriptions);
      localStorage.setItem(EXTENDED_DESCRIPTIONS_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving extended description:', error);
      throw new Error('Failed to save extended description');
    }
  }

  public deleteExtendedDescription(term: string): void {
    try {
      const descriptions = this.getExtendedDescriptions();
      descriptions.delete(term.toLowerCase());

      const obj = Object.fromEntries(descriptions);
      localStorage.setItem(EXTENDED_DESCRIPTIONS_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('Error deleting extended description:', error);
    }
  }

  public clearAllExtendedDescriptions(): void {
    try {
      localStorage.removeItem(EXTENDED_DESCRIPTIONS_KEY);
    } catch (error) {
      console.error('Error clearing extended descriptions:', error);
    }
  }

  // ===== DESCRIPTION GENERATION =====

  public async generateDescription(context: GenerationContext): Promise<{
    shortDescription: string;
    longDescription: string;
    category: string;
    gender?: string;
  }> {
    if (!this.isConfigured()) {
      throw new Error('Extended description service not configured. API key required.');
    }

    try {
      const model = this.genAI!.getGenerativeModel({
        model: this.model,
        systemInstruction: GENERATION_SYSTEM_INSTRUCTION
      });

      const prompt = this.buildGenerationPrompt(context);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Parse JSON response
      let parsedResponse;
      try {
        const cleanedText = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        parsedResponse = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse generation response:', parseError);
        throw new Error('Failed to parse AI response');
      }

      // Validate response
      if (!parsedResponse.shortDescription || !parsedResponse.longDescription) {
        throw new Error('Invalid response format from AI');
      }

      return {
        shortDescription: parsedResponse.shortDescription.trim(),
        longDescription: parsedResponse.longDescription.trim(),
        category: parsedResponse.category || context.category,
        gender: parsedResponse.gender
      };
    } catch (error) {
      console.error('Description generation error:', error);
      throw new Error(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildGenerationPrompt(context: GenerationContext): string {
    let prompt = `Generate descriptions for the following term from a translated narrative:\n\n`;
    prompt += `Term: ${context.term}\n`;
    prompt += `Category: ${context.category}\n\n`;
    
    if (context.existingDescription) {
      prompt += `Existing Description:\n`;
      prompt += `Short: ${context.existingDescription.shortDescription}\n`;
      prompt += `Long: ${context.existingDescription.longDescription}\n\n`;
      prompt += `Task: Refine and enhance the existing descriptions based on new context.\n\n`;
    } else {
      prompt += `Task: Create new descriptions for this term.\n\n`;
    }

    prompt += `Context from the narrative:\n`;
    prompt += `${this.extractRelevantContext(context.term, context.sourceText)}\n\n`;
    prompt += `Return the descriptions in JSON format.`;

    return prompt;
  }

  private extractRelevantContext(term: string, text: string, windowSize: number = 300): string {
    // Find mentions of the term in the text
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const mentions: string[] = [];

    let index = lowerText.indexOf(lowerTerm);
    let count = 0;

    while (index !== -1 && count < 3) { // Get up to 3 context snippets
      const start = Math.max(0, index - windowSize);
      const end = Math.min(text.length, index + term.length + windowSize);
      const snippet = text.substring(start, end);
      mentions.push(snippet.trim());
      
      index = lowerText.indexOf(lowerTerm, index + 1);
      count++;
    }

    if (mentions.length === 0) {
      // If term not found exactly, return beginning of text
      return text.substring(0, Math.min(500, text.length));
    }

    return mentions.join('\n\n[...]\n\n');
  }

  // ===== CLIENT-SIDE HEURISTIC GENERATION =====

  /**
   * Quick client-side generation for basic proposals without API calls
   * Useful for offline functionality or quick previews
   */
  public generateBasicProposal(term: string, category: string, context: string): DescriptionProposal {
    const lowerContext = context.toLowerCase();
    const lowerTerm = term.toLowerCase();

    // Extract gender hints
    let gender = 'unknown';
    const termIndex = lowerContext.indexOf(lowerTerm);
    if (termIndex !== -1) {
      const contextWindow = lowerContext.substring(
        Math.max(0, termIndex - 200),
        Math.min(lowerContext.length, termIndex + 200)
      );
      
      if (contextWindow.match(/\b(he|his|him)\b/)) gender = 'male';
      else if (contextWindow.match(/\b(she|her|hers)\b/)) gender = 'female';
    }

    // Build basic descriptions based on category
    let shortDesc = `${term}`;
    let longDesc = `${term} is a `;

    switch (category.toLowerCase()) {
      case 'names (characters)':
        shortDesc += gender !== 'unknown' ? ` (${gender})` : '';
        longDesc += 'character in the narrative';
        break;
      case 'places (locations)':
        longDesc += 'location mentioned in the story';
        break;
      default:
        longDesc += 'term from the narrative';
    }

    return {
      term,
      proposedShort: shortDesc,
      proposedLong: longDesc,
      category,
      confidence: 3, // Low confidence for basic proposals
      contextSnippet: this.extractRelevantContext(term, context, 150)
    };
  }

  // ===== UPDATE DETECTION =====

  public detectUpdateOpportunities(
    translatedText: string,
    existingTerms: Array<{ term: string; explanation: string }>
  ): UpdateProposal[] {
    const proposals: UpdateProposal[] = [];
    const extendedDescriptions = this.getExtendedDescriptions();

    for (const existingTerm of existingTerms) {
      // Check if term appears in new text
      if (!translatedText.toLowerCase().includes(existingTerm.term.toLowerCase())) {
        continue;
      }

      // Check if we have extended description
      const extended = extendedDescriptions.get(existingTerm.term.toLowerCase());
      if (!extended) {
        continue; // No extended description to update
      }

      // Extract new context
      const newContext = this.extractRelevantContext(existingTerm.term, translatedText);
      
      // Simple heuristic: if context mentions new descriptive words, suggest update
      const newWords = this.extractDescriptiveWords(newContext);
      const existingWords = this.extractDescriptiveWords(extended.longDescription);
      
      const newUniqueWords = newWords.filter(w => !existingWords.includes(w));
      
      if (newUniqueWords.length > 2) {
        proposals.push({
          term: existingTerm.term,
          currentShort: extended.shortDescription,
          currentLong: extended.longDescription,
          proposedShort: extended.shortDescription, // Keep short same for now
          proposedLong: `${extended.longDescription} ${this.buildUpdateSuggestion(newUniqueWords)}`,
          reason: `New context reveals additional details: ${newUniqueWords.slice(0, 3).join(', ')}`
        });
      }
    }

    return proposals;
  }

  private extractDescriptiveWords(text: string): string[] {
    // Simple extraction of adjectives and notable nouns
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const descriptive = words.filter(w => {
      // Filter out common words
      const common = ['that', 'this', 'with', 'from', 'they', 'were', 'been', 'have', 'their', 'what', 'said'];
      return !common.includes(w);
    });
    return Array.from(new Set(descriptive));
  }

  private buildUpdateSuggestion(newWords: string[]): string {
    return `[Consider adding: ${newWords.slice(0, 3).join(', ')}...]`;
  }
}

// Singleton instance
export const extendedDescriptionService = new ExtendedDescriptionService();
