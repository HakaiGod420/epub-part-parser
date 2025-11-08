import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper function to check if a term already exists in the dictionary
export const isTermInDictionary = (term: string): boolean => {
  try {
    const existingTermsJson = localStorage.getItem('dictionaryTerms');
    if (!existingTermsJson) return false;
    
    const existingTerms = JSON.parse(existingTermsJson);
    if (!Array.isArray(existingTerms)) return false;
    
    return existingTerms.some((existing: any) => 
      existing.term && existing.term.toLowerCase().trim() === term.toLowerCase().trim()
    );
  } catch (error) {
    console.error('Error checking dictionary terms:', error);
    return false;
  }
};

export interface DictionaryExtractorSettings {
  apiKey: string;
  model: string;
  extractNames: boolean;
  extractPlaces: boolean;
  extractTerminology: boolean;
  extractCulturalReferences: boolean;
  extractMagicConcepts: boolean;
  extractTitlesRanks: boolean;
  customCategories: string[];
}

export interface ExtractedTerm {
  term: string;
  explanation: string; // Short 1-sentence description
  category: string;
  confidence: number;
  longDescription?: string; // Extended detailed description (1-10 sentences)
  gender?: string; // For characters: male, female, other
  isUpdate?: boolean; // True if this is an update suggestion for existing term
  existingLongDescription?: string; // Current long description if updating
}

export interface ExtractionResponse {
  terms: ExtractedTerm[];
  success: boolean;
  error?: string;
}

export const DEFAULT_EXTRACTOR_CATEGORIES = [
  'Names (Characters)',
  'Places (Locations)',
  'Terminology (Technical terms)',
  'Cultural References',
  'Magic/Fantasy Concepts',
  'Titles & Ranks'
];

export const DEFAULT_EXTRACTOR_SETTINGS: DictionaryExtractorSettings = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  extractNames: true,
  extractPlaces: true,
  extractTerminology: true,
  extractCulturalReferences: true,
  extractMagicConcepts: true,
  extractTitlesRanks: true,
  customCategories: []
};

const EXTRACTION_SYSTEM_INSTRUCTION = `You are a specialized AI assistant that extracts important terms, names, places, and concepts from translated text for dictionary creation.

Your task is to analyze translated text and extract terms that would be valuable for a reader's dictionary. You should focus on:

Character Names: Important character names that appear in the text

Place Names: Geographic locations, buildings, organizations, realms, etc.

Terminology: Technical terms, specialized vocabulary, unique concepts

Cultural References: Cultural practices, traditions, historical references

Magic/Fantasy Concepts: Magical terms, abilities, artifacts, creatures (if applicable)

Titles & Ranks: Official titles, positions, honorifics, ranks

For each extracted term, provide:

The exact term as it appears in the text

A SHORT description (2-4 words): MINIMAL identifier only! For characters: just gender and role/trait (e.g., "female elf", "male protagonist"). For places: just type (e.g., "ancient city", "magic academy"). For concepts: just category (e.g., "fire magic", "royal title").

A LONG description (1-10 sentences): Rich, detailed, immersive description for creative reference. Include appearance, personality, backstory, significance, or contextual details that bring the element to life.

The category it belongs to

A confidence score (1-10) indicating how important/relevant this term is

Gender (for characters only): male, female, other, or unknown

Return your response in the following JSON format:
{
"terms": [
{
"term": "Exact term from text",
"explanation": "female elf",
"longDescription": "Detailed 1-10 sentence description with vivid context and details",
"category": "Category name",
"confidence": 8,
"gender": "male|female|other|unknown"
}
]
}

Guidelines:

Only extract proper character names. Do not extract generic family titles or roles (e.g., 'mother,' 'brother').

For character names, ALWAYS specify the gender in both the explanation and the gender field. Infer from context if not explicitly stated.

Short descriptions: ULTRA-MINIMAL! 2-4 words max. Examples: "male knight", "female mage", "ancient city", "fire spell", "noble title"

Long descriptions: Rich, immersive details for storytelling (e.g., "Elara stands tall with silver hair flowing like a river under moonlight, her emerald eyes reflecting centuries of guarded secrets...")

Only extract terms that are important for understanding the story

Avoid common words or phrases that don't need explanation

Focus on proper nouns, unique concepts, and specialized terminology

Use confidence scores: 9-10 for crucial terms, 7-8 for important terms, 5-6 for useful terms, skip terms below 5

If the text contains no extractable terms, return an empty terms array

Be selective and focus on quality over quantity. Extract only terms that would genuinely benefit a reader's understanding.`;

export class DictionaryExtractorService {
  private genAI: GoogleGenerativeAI | null = null;
  private settings: DictionaryExtractorSettings | null = null;

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    const storedSettings = localStorage.getItem('dictionaryExtractorSettings');
    if (storedSettings) {
      try {
        this.settings = JSON.parse(storedSettings);
        if (this.settings?.apiKey) {
          this.genAI = new GoogleGenerativeAI(this.settings.apiKey);
        }
      } catch (error) {
        console.error('Failed to load dictionary extractor settings:', error);
        this.settings = { ...DEFAULT_EXTRACTOR_SETTINGS };
      }
    } else {
      this.settings = { ...DEFAULT_EXTRACTOR_SETTINGS };
    }
  }

  public saveSettings(settings: DictionaryExtractorSettings): void {
    this.settings = settings;
    localStorage.setItem('dictionaryExtractorSettings', JSON.stringify(settings));
    if (settings.apiKey) {
      this.genAI = new GoogleGenerativeAI(settings.apiKey);
    }
  }

  public getSettings(): DictionaryExtractorSettings {
    return this.settings || { ...DEFAULT_EXTRACTOR_SETTINGS };
  }

  public isConfigured(): boolean {
    const translationSettings = localStorage.getItem('translationSettings');
    const translationApiKey = translationSettings ? JSON.parse(translationSettings).apiKey : '';
    
    // Use extractor API key if available, otherwise fall back to translation API key
    const apiKey = this.settings?.apiKey || translationApiKey;
    
    return !!(apiKey && this.settings?.model);
  }

  private buildExtractionPrompt(text: string, existingTerms?: Array<{ term: string; explanation: string }>): string {
    if (!this.settings) return text;

    const activeCategories = [];
    if (this.settings.extractNames) activeCategories.push('Character Names');
    if (this.settings.extractPlaces) activeCategories.push('Place Names');
    if (this.settings.extractTerminology) activeCategories.push('Terminology');
    if (this.settings.extractCulturalReferences) activeCategories.push('Cultural References');
    if (this.settings.extractMagicConcepts) activeCategories.push('Magic/Fantasy Concepts');
    if (this.settings.extractTitlesRanks) activeCategories.push('Titles & Ranks');
    if (this.settings.customCategories.length > 0) {
      activeCategories.push(...this.settings.customCategories);
    }

    let prompt = `Extract dictionary terms from the following translated text. Focus on these categories: ${activeCategories.join(', ')}.

Text to analyze:
${text}

Extract only terms from the specified categories above.`;

    // If there are existing terms, mention them so AI can suggest updates
    if (existingTerms && existingTerms.length > 0) {
      prompt += `\n\nExisting dictionary terms (if any appear in the text, you can suggest updated descriptions):
${existingTerms.map(t => `- ${t.term}: ${t.explanation}`).join('\n')}`;
    }

    prompt += `\n\nReturn the response as valid JSON with both short explanations and detailed longDescription fields.`;

    return prompt;
  }

  public async extractTerms(text: string): Promise<ExtractionResponse> {
    const translationSettings = localStorage.getItem('translationSettings');
    const translationApiKey = translationSettings ? JSON.parse(translationSettings).apiKey : '';
    
    // Use extractor API key if available, otherwise fall back to translation API key
    const apiKey = this.settings?.apiKey || translationApiKey;
    
    if (!apiKey && !this.settings) {
      return {
        terms: [],
        success: false,
        error: 'Dictionary extractor not configured. Please set up API key and model in settings.'
      };
    }

    if (!text.trim()) {
      return {
        terms: [],
        success: false,
        error: 'No text provided for extraction.'
      };
    }

    // Get existing dictionary terms to check for updates
    const existingDictionaryTerms = this.getExistingTerms();
    const existingExtendedDescriptions = this.getExistingExtendedDescriptions();

    // Initialize AI with the appropriate API key
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
      const model = genAI.getGenerativeModel({ 
        model: this.settings?.model || 'gemini-2.5-flash',
        systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION
      });

      const prompt = this.buildExtractionPrompt(text, existingDictionaryTerms);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Try to parse the JSON response
      let parsedResponse;
      try {
        // Clean up the response text (remove markdown formatting if present)
        const cleanedText = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        parsedResponse = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse extraction response:', parseError);
        return {
          terms: [],
          success: false,
          error: 'Failed to parse AI response. Please try again.'
        };
      }

      // Validate the response structure
      if (!parsedResponse.terms || !Array.isArray(parsedResponse.terms)) {
        return {
          terms: [],
          success: false,
          error: 'Invalid response format from AI.'
        };
      }

      // Filter and validate terms
      const validTerms = parsedResponse.terms
        .filter((term: any) => 
          term.term && 
          term.explanation && 
          term.category && 
          typeof term.confidence === 'number' &&
          term.confidence >= 5
        )
        .map((term: any) => {
          const termLower = term.term.toLowerCase().trim();
          const isExisting = isTermInDictionary(term.term);
          const existingExtended = existingExtendedDescriptions.get(termLower);
          
          return {
            term: term.term.trim(),
            explanation: term.explanation.trim(),
            longDescription: term.longDescription?.trim() || '',
            category: term.category.trim(),
            confidence: Math.min(10, Math.max(1, term.confidence)),
            gender: term.gender,
            isUpdate: isExisting && text.toLowerCase().includes(termLower),
            existingLongDescription: existingExtended?.longDescription
          };
        });

      // Separate new terms from update suggestions
      const newTerms = validTerms.filter((t: ExtractedTerm) => !t.isUpdate);
      const updateSuggestions = validTerms.filter((t: ExtractedTerm) => t.isUpdate);

      // Combine them (updates first so user sees them)
      const allTerms = [...updateSuggestions, ...newTerms];

      return {
        terms: allTerms,
        success: true
      };

    } catch (error) {
      console.error('Dictionary extraction error:', error);
      return {
        terms: [],
        success: false,
        error: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private getExistingTerms(): Array<{ term: string; explanation: string }> {
    try {
      const stored = localStorage.getItem('dictionaryTerms');
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  private getExistingExtendedDescriptions(): Map<string, any> {
    try {
      const stored = localStorage.getItem('extendedDescriptions');
      if (!stored) return new Map();
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    } catch {
      return new Map();
    }
  }
}

export const dictionaryExtractorService = new DictionaryExtractorService();
