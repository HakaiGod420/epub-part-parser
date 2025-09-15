export interface DictionaryTerm {
  term: string;
  explanation: string;
}

export interface ChapterContext {
  dictionary: DictionaryTerm[];
  optionalTexts: string[];
  optionalTextToggles: boolean[];
  chapterTitle?: string;
  bookTitle?: string;
  includeDictionary: boolean;
  includeChapterTitle: boolean;
}

export interface TranslationContextSettings {
  includeDictionary: boolean;
  includeChapterTitle: boolean;
  enhanceTableFormatting: boolean;
}

const DEFAULT_TRANSLATION_SETTINGS: TranslationContextSettings = {
  includeDictionary: true,
  includeChapterTitle: false,
  enhanceTableFormatting: false,
};

/**
 * Builds the complete context text that includes dictionary terms, optional texts,
 * and chapter title based on the current settings.
 * This mirrors the logic from ChapterSplitter but for translation purposes.
 */
export function buildTranslationContext(
  baseText: string,
  context: Partial<ChapterContext>
): string {
  const {
    dictionary = [],
    optionalTexts = [],
    optionalTextToggles = [],
    chapterTitle,
    includeDictionary = true,
    includeChapterTitle = false,
  } = context;

  // Build dictionary text
  const dictionaryText = includeDictionary && dictionary.length > 0
    ? dictionary
        .map(({ term, explanation }) => `${term}: ${explanation}`)
        .join("\n")
    : "";

  // Build optional text
  const optionalText = optionalTextToggles
    .map((toggle, i) => (toggle && optionalTexts[i] ? optionalTexts[i] : ""))
    .filter(Boolean)
    .join("\n");

  // Build chapter title text
  const chapterTitleText = includeChapterTitle && chapterTitle
    ? `Chapter: ${chapterTitle}`
    : "";

  // Combine all context parts
  const contextParts = [
    dictionaryText ? `Dictionary Terms:\n${dictionaryText}` : "",
    optionalText || "",
    chapterTitleText || "",
  ].filter(Boolean);

  // Return the complete context with base text
  if (contextParts.length > 0) {
    return `${contextParts.join("\n\n")}\n\n${baseText}`;
  }

  return baseText;
}

/**
 * Loads the current chapter context from localStorage
 */
export function loadChapterContextFromStorage(): Partial<ChapterContext> {
  try {
    const storedTexts = JSON.parse(localStorage.getItem("optionalTexts") || "[]");
    const storedToggles = JSON.parse(localStorage.getItem("optionalTextToggles") || "[]");
    const storedDictionary = localStorage.getItem("dictionaryTerms");
    const storedTranslationSettings = localStorage.getItem("translationContextSettings");

    const DEFAULT_TEXTS = ["Translate to english:", "", ""];
    const DEFAULT_TOGGLES = [true, false, false];

    let dictionary: DictionaryTerm[] = [];
    if (storedDictionary) {
      try {
        const parsedDictionary = JSON.parse(storedDictionary);
        dictionary = Array.isArray(parsedDictionary)
          ? parsedDictionary.map((term: any) => ({
              term: term.term,
              explanation: term.explanation,
            }))
          : [];
      } catch {
        console.error("Failed to parse dictionary data.");
      }
    }

    let translationSettings = DEFAULT_TRANSLATION_SETTINGS;
    if (storedTranslationSettings) {
      try {
        translationSettings = { ...DEFAULT_TRANSLATION_SETTINGS, ...JSON.parse(storedTranslationSettings) };
      } catch {
        console.error("Failed to parse translation context settings.");
      }
    }

    return {
      dictionary,
      optionalTexts: Array.isArray(storedTexts) && storedTexts.length 
        ? storedTexts 
        : DEFAULT_TEXTS,
      optionalTextToggles: Array.isArray(storedToggles) && storedToggles.length 
        ? storedToggles 
        : DEFAULT_TOGGLES,
      includeDictionary: translationSettings.includeDictionary,
      includeChapterTitle: translationSettings.includeChapterTitle,
    };
  } catch (error) {
    console.error("Error loading chapter context:", error);
    return {};
  }
}

/**
 * Saves translation context settings to localStorage
 */
export function saveTranslationContextSettings(settings: TranslationContextSettings): void {
  try {
    localStorage.setItem("translationContextSettings", JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving translation context settings:", error);
  }
}

/**
 * Loads translation context settings from localStorage
 */
export function loadTranslationContextSettings(): TranslationContextSettings {
  try {
    const storedSettings = localStorage.getItem("translationContextSettings");
    if (storedSettings) {
      return { ...DEFAULT_TRANSLATION_SETTINGS, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error("Error loading translation context settings:", error);
  }
  return DEFAULT_TRANSLATION_SETTINGS;
}
