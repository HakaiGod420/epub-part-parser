import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Fade,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Paper,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Popover,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Translate as TranslateIcon,
  Settings as SettingsIcon,
  TextFields as TextFieldsIcon,
  Palette as PaletteIcon,
  FormatSize as FontSizeIcon,
  FormatLineSpacing as LineSpacingIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignJustify as AlignJustifyIcon,
  AspectRatio as WidthIcon,
  AutoAwesome as ExtractIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { translationService, GEMINI_MODELS, TranslationProvider } from '../utils/translationService';
import { openRouterService, OpenRouterModel } from '../utils/openRouterService';
import { DEEPSEEK_MODELS, deepSeekService } from '../utils/deepSeekService';
import { dictionaryExtractorService, ExtractedTerm } from '../utils/dictionaryExtractorService';
import { dictionaryEventManager } from '../utils/dictionaryEventManager';
import { extendedDescriptionService, ExtendedDescription } from '../utils/extendedDescriptionService';
import TermsExtractionPopup from './TermsExtractionPopup';

interface TranslationModalProps {
  open: boolean;
  onClose: () => void;
  text: string;
  chapterTitle?: string;
  // Navigation props
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  hasPreviousChapter?: boolean;
  hasNextChapter?: boolean;
  // Chapter progress props
  currentChapter?: number;
  totalChapters?: number;
  images: Uint8Array[]; // images from chapter to show indicator if exist
}

interface ModalSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  theme: 'dark' | 'black' | 'white';
  textAlign: 'left' | 'center' | 'justify';
  maxWidth: number;
  showOriginalText: boolean;
  deviceMode: 'mobile' | 'pc';
  highlightDictionaryTerms: boolean; // New setting for term highlighting
}

const defaultModalSettings: ModalSettings = {
  fontSize: 16,
  fontFamily: 'Roboto, sans-serif',
  lineHeight: 1.6,
  theme: 'dark',
  textAlign: 'justify',
  maxWidth: 800,
  showOriginalText: false,
  deviceMode: 'mobile',
  highlightDictionaryTerms: true, // Enabled by default
};

const mobileFonts = [
  'Roboto, sans-serif',
  'Noto Sans, sans-serif', 
  'Droid Sans, sans-serif',
  'system-ui, -apple-system, sans-serif',
  'Arial, Helvetica, sans-serif',
  'Noto Serif, serif',
  'Droid Serif, serif', 
  'ui-serif, Georgia, serif',
  'Droid Sans Mono, Consolas, monospace',
  'Roboto Mono, Courier New, monospace',
  'ui-monospace, Consolas, monospace',
];

const pcFonts = [
  'Georgia, Times, serif',
  'Times New Roman, Times, serif',
  'Arial, Helvetica, sans-serif',
  'Helvetica, Arial, sans-serif',
  'Verdana, Geneva, sans-serif',
  'Calibri, sans-serif',
  'Segoe UI, Tahoma, Geneva, sans-serif',
  'Trebuchet MS, sans-serif',
  'Book Antiqua, Palatino, serif',
  'Garamond, serif',
  'Courier New, Courier, monospace',
  'Consolas, Monaco, monospace',
  'Lucida Console, monospace',
];

const fontDisplayNames: { [key: string]: string } = {
  // Mobile fonts
  'Roboto, sans-serif': 'Roboto',
  'Noto Sans, sans-serif': 'Noto Sans',
  'Droid Sans, sans-serif': 'Droid Sans',
  'system-ui, -apple-system, sans-serif': 'System UI',
  'Arial, Helvetica, sans-serif': 'Arial',
  'Noto Serif, serif': 'Noto Serif',
  'Droid Serif, serif': 'Droid Serif', 
  'ui-serif, Georgia, serif': 'System Serif',
  'Droid Sans Mono, Consolas, monospace': 'Droid Sans Mono',
  'Roboto Mono, Courier New, monospace': 'Roboto Mono',
  'ui-monospace, Consolas, monospace': 'System Monospace',
  // PC fonts
  'Georgia, Times, serif': 'Georgia',
  'Times New Roman, Times, serif': 'Times New Roman',
  'Helvetica, Arial, sans-serif': 'Helvetica',
  'Verdana, Geneva, sans-serif': 'Verdana',
  'Calibri, sans-serif': 'Calibri',
  'Segoe UI, Tahoma, Geneva, sans-serif': 'Segoe UI',
  'Trebuchet MS, sans-serif': 'Trebuchet MS',
  'Book Antiqua, Palatino, serif': 'Book Antiqua',
  'Garamond, serif': 'Garamond',
  'Courier New, Courier, monospace': 'Courier New',
  'Consolas, Monaco, monospace': 'Consolas',
  'Lucida Console, monospace': 'Lucida Console',
};

const themes = {
  dark: {
    background: '#0f0f1a',
    paper: '#1a1a2e',
    text: '#f1f5f9',
    secondary: '#94a3b8',
    accent: '#7c3aed',
    border: 'rgba(124, 58, 237, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
  },
  black: {
    background: '#000000',
    paper: '#0a0a0a',
    text: '#f1f5f9',
    secondary: '#94a3b8',
    accent: '#a78bfa',
    border: 'rgba(167, 139, 250, 0.2)',
    gradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)',
  },
  white: {
    background: '#ffffff',
    paper: '#f8fafc',
    text: '#1e293b',
    secondary: '#64748b',
    accent: '#7c3aed',
    border: 'rgba(124, 58, 237, 0.15)',
    gradient: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
  },
};

// TabPanel component outside the main component to prevent re-creation
const TabPanel = React.memo(({ children, value, index }: any) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
));

const TranslationModal: React.FC<TranslationModalProps> = ({ 
  open,
  onClose,
  text,
  chapterTitle,
  images,
  onPreviousChapter,
  onNextChapter,
  hasPreviousChapter = false,
  hasNextChapter = false,
  currentChapter,
  totalChapters,
}) => {
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState<ModalSettings>(defaultModalSettings);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [currentProvider, setCurrentProvider] = useState<TranslationProvider>('google');
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  
  // Dictionary extractor state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTerms, setExtractedTerms] = useState<ExtractedTerm[]>([]);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [showExtractionPopup, setShowExtractionPopup] = useState(false);
  
  // Term tooltip state
  const [termPopupAnchor, setTermPopupAnchor] = useState<HTMLElement | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<{ term: string; description: ExtendedDescription | null } | null>(null);
  
  // Reading progress state
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Use refs to track if we should save settings to avoid infinite loops
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  // Use a stable reference for the current theme to prevent unnecessary re-renders
  const currentTheme = useMemo(() => themes[settings.theme], [settings.theme]);

  // Memoize common style objects to prevent re-creation
  const dialogStyles = useMemo(() => ({
    backgroundColor: currentTheme.background,
    color: currentTheme.text,
  }), [currentTheme.background, currentTheme.text]);

  const dialogTitleStyles = useMemo(() => ({
    color: currentTheme.text,
    borderBottom: `1px solid ${currentTheme.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 3,
    py: 2,
    backgroundColor: currentTheme.background,
  }), [currentTheme.text, currentTheme.border, currentTheme.background]);

  const paperStyles = useMemo(() => ({
    p: 3,
    backgroundColor: currentTheme.paper,
    border: `1px solid ${currentTheme.border}`,
  }), [currentTheme.paper, currentTheme.border]);

  // Load settings from localStorage on component mount only
  useEffect(() => {
    if (initialLoadRef.current) {
      const savedSettings = localStorage.getItem('translationModalSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultModalSettings, ...parsed });
        } catch (error) {
          console.error('Error parsing translation modal settings:', error);
        }
      }
      initialLoadRef.current = false;
    }
  }, []);

  // Debounced save to localStorage to prevent continuous saves
  useEffect(() => {
    if (!initialLoadRef.current) {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout to save after 1000ms (1 second) of no changes
      saveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem('translationModalSettings', JSON.stringify(settings));
        } catch (error) {
          console.error('Error saving translation modal settings:', error);
        }
      }, 1000);
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [settings]);

  // Reset state when modal opens but don't auto-translate
  useEffect(() => {
    if (open) {
      setTranslatedText('');
      setError(null);
      setIsTranslating(false);
      setCopied(false);
      setCurrentTab(0);
      
      // Load current provider and settings
      const provider = translationService.getCurrentProvider();
      const currentSettings = translationService.getSettings();
      
      setCurrentProvider(provider);
      
      if (currentSettings?.model) {
        setCurrentModel(currentSettings.model);
      }

      // Load OpenRouter models if using OpenRouter
      if (provider === 'openrouter') {
        loadOpenRouterModels();
      }
    }
  }, [open]);

  const loadOpenRouterModels = async () => {
    try {
      if (openRouterService.isConfigured()) {
        const models = await openRouterService.getAvailableModels();
        setOpenRouterModels(models);
      }
    } catch (error) {
      console.error('Failed to load OpenRouter models in modal:', error);
    }
  };

  const handleTranslate = async () => {
    if (!translationService.isConfigured()) {
      const errorMsg = 'Translation service not configured. Please set up your API key in settings.';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!text || !text.trim()) {
      const errorMsg = 'No text to translate.';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setIsTranslating(true);
    setError(null);
    setTranslatedText('');

    try {
      await translationService.translateTextStream(text, (chunk) => {
        setTranslatedText(prev => prev + chunk);
      });
    } catch (err) {
      console.error('Translation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleProviderChange = useCallback((provider: TranslationProvider) => {
    setCurrentProvider(provider);
    translationService.switchProvider(provider);
    
    // Update current model based on provider
    const currentSettings = translationService.getSettings();
    if (currentSettings?.model) {
      setCurrentModel(currentSettings.model);
    }

    // Load OpenRouter models if switching to OpenRouter
    if (provider === 'openrouter') {
      loadOpenRouterModels();
    }
  }, []);

  const handleModelChange = useCallback((event: any) => {
    const newModel = event.target.value;
    setCurrentModel(newModel);
    
    // Update the translation service settings with the new model
    const currentSettings = translationService.getSettings();
    if (currentSettings) {
      const updatedSettings = { ...currentSettings, model: newModel };
      
      if (currentProvider === 'openrouter') {
        // Update OpenRouter service as well
        const orSettings = openRouterService.getSettings();
        if (orSettings) {
          openRouterService.saveSettings({ ...orSettings, model: newModel });
        }
      } else if (currentProvider === 'deepseek') {
        // Update DeepSeek service as well
        const dsSettings = deepSeekService.getSettings();
        if (dsSettings) {
          deepSeekService.saveSettings({ ...dsSettings, model: newModel });
        }
      }
      
      translationService.saveSettings(updatedSettings);
    }
  }, [currentProvider]);

  const handleDeviceModeChange = useCallback((event: any) => {
    setSettings(prev => ({ ...prev, deviceMode: event.target.value }));
  }, []);

  // Get current font list based on device mode
  const getCurrentFonts = useCallback(() => {
    return settings.deviceMode === 'mobile' ? mobileFonts : pcFonts;
  }, [settings.deviceMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;
      
      // Arrow key navigation
      if (event.key === 'ArrowLeft' && hasPreviousChapter && onPreviousChapter) {
        event.preventDefault();
        onPreviousChapter();
      } else if (event.key === 'ArrowRight' && hasNextChapter && onNextChapter) {
        event.preventDefault();
        onNextChapter();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, hasPreviousChapter, hasNextChapter, onPreviousChapter, onNextChapter]);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      
      if (scrollHeight > 0) {
        const progress = (scrollTop / scrollHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, progress)));
      } else {
        setReadingProgress(0);
      }
    };

    const currentContent = contentRef.current;
    if (currentContent && currentTab === 0) {
      currentContent.addEventListener('scroll', handleScroll);
      // Initial calculation after a short delay to ensure content is rendered
      const timer = setTimeout(handleScroll, 100);
      
      return () => {
        currentContent.removeEventListener('scroll', handleScroll);
        clearTimeout(timer);
      };
    }
  }, [translatedText, currentTab, settings.showOriginalText]);

  // Reset reading progress when modal opens or chapter changes
  useEffect(() => {
    if (open) {
      setReadingProgress(0);
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [open, text]);

  const handleClose = () => {
    onClose();
  };

  // Memoize event handlers to prevent unnecessary re-renders and use onChangeCommitted for sliders
  const handleFontSizeChange = useCallback((_: any, value: number | number[]) => {
    setSettings(prev => ({ ...prev, fontSize: value as number }));
  }, []);

  const handleFontFamilyChange = useCallback((event: any) => {
    setSettings(prev => ({ ...prev, fontFamily: event.target.value }));
  }, []);

  const handleLineHeightChange = useCallback((_: any, value: number | number[]) => {
    setSettings(prev => ({ ...prev, lineHeight: value as number }));
  }, []);

  const handleMaxWidthChange = useCallback((_: any, value: number | number[]) => {
    setSettings(prev => ({ ...prev, maxWidth: value as number }));
  }, []);

  const handleTextAlignChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, textAlign: event.target.value as any }));
  }, []);

  const handleThemeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, theme: event.target.value as any }));
  }, []);

  const handleShowOriginalChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, showOriginalText: event.target.checked }));
  }, []);

  // Dictionary extractor handlers
  const handleExtractTerms = async () => {
    if (!translatedText.trim()) {
      setExtractionError('No translated text available for term extraction.');
      return;
    }

    if (!dictionaryExtractorService.isConfigured()) {
      setExtractionError('Dictionary extractor is not configured. Please set up API key and model in settings.');
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setExtractedTerms([]);

    try {
      const result = await dictionaryExtractorService.extractTerms(translatedText);
      
      if (result.success) {
        setExtractedTerms(result.terms);
        setShowExtractionPopup(true);
      } else {
        setExtractionError(result.error || 'Failed to extract terms');
      }
    } catch (error) {
      console.error('Term extraction error:', error);
      setExtractionError(`Term extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddTermToDictionary = (term: ExtractedTerm) => {
    const success = dictionaryEventManager.addTerm({
      term: term.term,
      explanation: term.explanation,
      longDescription: term.longDescription,
      gender: term.gender,
      category: term.category
    });
    
    if (!success) {
      console.warn(`Term "${term.term}" already exists in dictionary`);
    }
  };

  const handleCloseExtractionPopup = () => {
    setShowExtractionPopup(false);
    setExtractedTerms([]);
    setExtractionError(null);
  };

  // Memoize the formatted text to prevent re-computation on every render
  const formatTranslatedText = useCallback((text: string) => {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    const theme = themes[settings.theme];
    
    // Get all dictionary terms if highlighting is enabled
    const allDictionaryTerms = settings.highlightDictionaryTerms 
      ? dictionaryEventManager.getTerms()
      : [];
    
    // Build a map of all possible matches (including partial names) to their full term
    const termMatchMap = new Map<string, string>(); // matchText -> fullTermName
    
    if (settings.highlightDictionaryTerms && allDictionaryTerms.length > 0) {
      allDictionaryTerms.forEach(dictTerm => {
        const fullName = dictTerm.term;
        const fullNameLower = fullName.toLowerCase();
        
        // Add the full name
        termMatchMap.set(fullNameLower, fullName);
        
        // Add individual words (for names like "John Smith" -> match "John" or "Smith")
        const words = fullName.split(/\s+/).filter(w => w.length > 2); // Only words with 3+ chars
        words.forEach(word => {
          const wordLower = word.toLowerCase();
          // Only add if not already mapped (prefer full names)
          if (!termMatchMap.has(wordLower)) {
            termMatchMap.set(wordLower, fullName);
          }
        });
      });
    }
    
    const handleTermClick = (event: React.MouseEvent<HTMLSpanElement>, matchedText: string) => {
      event.stopPropagation();
      
      // Find the full term name from the matched text
      const fullTermName = termMatchMap.get(matchedText.toLowerCase()) || matchedText;
      
      // Try to get extended description
      const extendedDesc = extendedDescriptionService.getExtendedDescription(fullTermName);
      
      setSelectedTerm({ term: fullTermName, description: extendedDesc });
      setTermPopupAnchor(event.currentTarget);
    };
    
    const highlightTerms = (paragraph: string): React.ReactNode => {
      if (!settings.highlightDictionaryTerms || termMatchMap.size === 0) {
        // No highlighting - return formatted HTML
        const formatted = paragraph
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/"([^"]*)"/g, '"$1"');
        return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      
      // Create regex to match all possible terms (full names + individual words)
      // Sort by length descending to match longer terms first
      const sortedTerms = Array.from(termMatchMap.keys())
        .sort((a, b) => b.length - a.length);
      
      const termsPattern = sortedTerms
        .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special chars
        .join('|');
      const regex = new RegExp(`\\b(${termsPattern})\\b`, 'gi');
      
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      let keyCounter = 0;
      
      // Apply italic and quote formatting first
      let workingText = paragraph
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/"([^"]*)"/g, '"$1"');
      
      // Track which positions have already been matched (to avoid overlapping highlights)
      const matchedRanges: Array<{start: number, end: number}> = [];
      
      // Find all term matches in the formatted text
      const matches: Array<{index: number, text: string, length: number}> = [];
      while ((match = regex.exec(workingText)) !== null) {
        matches.push({
          index: match.index,
          text: match[0],
          length: match[0].length
        });
      }
      
      // Filter out overlapping matches (keep longer ones)
      const filteredMatches = matches.filter(m => {
        const overlaps = matchedRanges.some(range => 
          (m.index >= range.start && m.index < range.end) ||
          (m.index + m.length > range.start && m.index + m.length <= range.end) ||
          (m.index <= range.start && m.index + m.length >= range.end)
        );
        if (!overlaps) {
          matchedRanges.push({ start: m.index, end: m.index + m.length });
          return true;
        }
        return false;
      });
      
      // Build the output with highlighted terms
      filteredMatches.forEach(m => {
        // Add text before match
        if (m.index > lastIndex) {
          const beforeText = workingText.substring(lastIndex, m.index);
          parts.push(
            <span key={`text-${keyCounter++}`} dangerouslySetInnerHTML={{ __html: beforeText }} />
          );
        }
        
        // Add highlighted term
        parts.push(
          <span
            key={`term-${keyCounter++}`}
            onClick={(e) => handleTermClick(e, m.text)}
            style={{
              color: '#a78bfa', // Purple color
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              textDecorationColor: 'rgba(167, 139, 250, 0.5)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#c4b5fd';
              e.currentTarget.style.textDecorationStyle = 'solid';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#a78bfa';
              e.currentTarget.style.textDecorationStyle = 'dotted';
            }}
          >
            {m.text}
          </span>
        );
        
        lastIndex = m.index + m.length;
      });
      
      // Add remaining text
      if (lastIndex < workingText.length) {
        const remainingText = workingText.substring(lastIndex);
        parts.push(
          <span key={`text-${keyCounter++}`} dangerouslySetInnerHTML={{ __html: remainingText }} />
        );
      }
      
      return parts.length > 0 ? <>{parts}</> : <span dangerouslySetInnerHTML={{ __html: workingText }} />;
    };
    
    return paragraphs.map((paragraph, index) => {
      if (paragraph.trim() === '***') {
        return (
          <Box key={index} sx={{ textAlign: 'center', my: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                color: theme.accent, 
                fontWeight: 'bold' 
              }}
            >
              * * *
            </Typography>
          </Box>
        );
      }
      
      return (
        <Typography 
          key={index} 
          variant="body1" 
          paragraph
          sx={{ 
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontFamily,
            lineHeight: settings.lineHeight,
            textAlign: settings.textAlign,
            mb: 2,
            color: theme.text,
            userSelect: 'text',
            WebkitUserSelect: 'text',
            MozUserSelect: 'text',
            msUserSelect: 'text',
            cursor: 'text',
            '& em': {
              fontStyle: 'italic',
              color: theme.accent,
            }
          }}
        >
          {highlightTerms(paragraph)}
        </Typography>
      );
    });
  }, [settings]);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: dialogStyles
      }}
    >
      <DialogTitle 
        sx={dialogTitleStyles}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TranslateIcon sx={{ color: currentTheme.accent }} />
          {images.length > 0 && (
            <Tooltip title="This chapter contains images">
              <InfoIcon 
                sx={{ 
                  color: '#f59e0b', // Amber/orange color
                  fontSize: '1.8rem', // Much larger
                  backgroundColor: 'rgba(245, 158, 11, 0.1)', // Subtle background
                  borderRadius: '50%',
                  padding: '6px',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }} 
              />
            </Tooltip>
          )}
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: currentTheme.text }}>
            Translation Reader
          </Typography>
          {chapterTitle && (
            <Typography variant="subtitle1" sx={{ color: currentTheme.secondary }}>
              - {chapterTitle}
            </Typography>
          )}
        </Box>
        
        {/* Chapter Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={onPreviousChapter}
            disabled={!hasPreviousChapter || !onPreviousChapter}
            sx={{ 
              color: currentTheme.text,
              '&:disabled': {
                color: currentTheme.border,
              },
              '&:hover': {
                backgroundColor: `${currentTheme.accent}20`,
              },
            }}
            title="Previous Chapter (← key)"
          >
            <ArrowBackIcon />
          </IconButton>
          
          <IconButton 
            onClick={onNextChapter}
            disabled={!hasNextChapter || !onNextChapter}
            sx={{ 
              color: currentTheme.text,
              '&:disabled': {
                color: currentTheme.border,
              },
              '&:hover': {
                backgroundColor: `${currentTheme.accent}20`,
              },
            }}
            title="Next Chapter (→ key)"
          >
            <ArrowForwardIcon />
          </IconButton>
          
          <IconButton onClick={handleClose} sx={{ color: currentTheme.text, ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Reading Progress Bar */}
      <Box sx={{ 
        position: 'relative',
        height: 8,
        backgroundColor: currentTheme.background,
        borderTop: `1px solid ${currentTheme.border}20`,
      }}>
        <LinearProgress 
          variant="determinate" 
          value={readingProgress}
          sx={{
            height: 8,
            backgroundColor: `${currentTheme.border}`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: currentTheme.accent,
              background: `linear-gradient(90deg, ${currentTheme.accent} 0%, ${themes[settings.theme].secondary} 100%)`,
              boxShadow: `0 0 10px ${currentTheme.accent}80`,
              transition: 'transform 0.1s linear',
            },
          }}
        />
        {readingProgress > 0 && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: currentTheme.text,
              fontSize: '0.7rem',
              fontWeight: 700,
              textShadow: `0 0 8px ${currentTheme.background}, 0 0 4px ${currentTheme.background}`,
              backgroundColor: `${currentTheme.background}90`,
              px: 1,
              py: 0.25,
              borderRadius: 0.75,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {Math.round(readingProgress)}%
          </Typography>
        )}
      </Box>

      {/* Overall Chapter Progress Bar */}
      {currentChapter !== undefined && totalChapters !== undefined && totalChapters > 0 && (
        <>
          {/* Spacer for separation */}
          <Box sx={{ 
            height: '8px',
            background: `linear-gradient(to bottom, ${currentTheme.background} 0%, ${currentTheme.paper} 100%)`,
            borderBottom: `1px solid ${currentTheme.border}20`,
          }} />
          
          <Box sx={{ 
            position: 'relative',
            height: 28,
            backgroundColor: currentTheme.paper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${currentTheme.border}`,
          }}>
            <LinearProgress 
              variant="determinate" 
              value={(currentChapter / totalChapters) * 100}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                height: '100%',
                backgroundColor: `${currentTheme.paper}`,
                borderRadius: 0,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: themes[settings.theme].secondary,
                  background: `linear-gradient(90deg, ${themes[settings.theme].secondary} 0%, ${currentTheme.accent} 100%)`,
                  boxShadow: `0 0 12px ${themes[settings.theme].secondary}60`,
                  transition: 'transform 0.4s ease',
                  opacity: 0.25,
                },
              }}
            />
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: currentTheme.text,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textShadow: `0 0 12px ${currentTheme.background}, 0 0 8px ${currentTheme.background}, 0 0 4px ${currentTheme.background}`,
                  backgroundColor: `${currentTheme.background}E6`,
                  px: 2.5,
                  py: 0.75,
                  borderRadius: 1.5,
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${currentTheme.border}`,
                  boxShadow: `0 2px 6px ${currentTheme.accent}30`,
                  whiteSpace: 'nowrap',
                }}
              >
                📖 Chapter {currentChapter} / {totalChapters}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      <DialogContent sx={{ 
        p: 0, 
        backgroundColor: currentTheme.background,
        userSelect: 'text', // Enable text selection for the entire dialog content
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
        msUserSelect: 'text',
        '& ::selection': { // Custom text selection styling
          backgroundColor: currentTheme.accent + '40', // Semi-transparent accent color
          color: currentTheme.text,
        },
        '& ::-moz-selection': { // Firefox text selection styling
          backgroundColor: currentTheme.accent + '40',
          color: currentTheme.text,
        },
      }}>
        <Box sx={{ borderBottom: 1, borderColor: currentTheme.border }}>
          <Tabs 
            value={currentTab} 
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: currentTheme.text,
                '&.Mui-selected': {
                  color: currentTheme.accent,
                },
                '&:hover': {
                  color: currentTheme.accent,
                  backgroundColor: `${currentTheme.accent}10`,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: currentTheme.accent,
              },
            }}
          >
            <Tab icon={<TranslateIcon />} label="Translation" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          {/* Translation Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
            
            {/* Action Bar */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              mb: 3,
              p: 2,
              backgroundColor: currentTheme.paper,
              borderRadius: 1,
              border: `1px solid ${currentTheme.border}`,
            }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={isTranslating ? <CircularProgress size={20} color="inherit" /> : <TranslateIcon />}
                  onClick={handleTranslate}
                  disabled={isTranslating || !text?.trim()}
                  sx={{
                    backgroundColor: currentTheme.accent,
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: settings.theme === 'white' ? '#6d28d9' : '#8b5cf6',
                    },
                    '&:disabled': {
                      backgroundColor: currentTheme.border,
                      color: currentTheme.secondary,
                    },
                  }}
                >
                  {isTranslating ? 'Translating...' : 'Translate Text'}
                </Button>

                {translatedText && (
                  <Button
                    variant="outlined"
                    startIcon={isExtracting ? <CircularProgress size={20} color="inherit" /> : <ExtractIcon />}
                    onClick={handleExtractTerms}
                    disabled={isExtracting || !translatedText.trim() || !dictionaryExtractorService.isConfigured()}
                    sx={{
                      borderColor: '#ff9800',
                      color: '#ff9800',
                      '&:hover': {
                        borderColor: '#f57c00',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      },
                      '&:disabled': {
                        borderColor: currentTheme.border,
                        color: currentTheme.secondary,
                      },
                    }}
                  >
                    {isExtracting ? 'Extracting...' : 'Extract Terms'}
                  </Button>
                )}
              </Box>

              {translatedText && (
                <Button
                  variant="outlined"
                  startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                  onClick={handleCopy}
                  sx={{
                    borderColor: currentTheme.accent,
                    color: copied ? currentTheme.accent : currentTheme.text,
                    '&:hover': {
                      borderColor: currentTheme.accent,
                      backgroundColor: `${currentTheme.accent}20`,
                    },
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Text'}
                </Button>
              )}
            </Box>

            {/* Error Display */}
            {error && (
              <Fade in={true}>
                <Alert 
                  severity="error" 
                  sx={{ mb: 3 }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Extraction Error Display */}
            {extractionError && (
              <Fade in={true}>
                <Alert 
                  severity="warning" 
                  sx={{ mb: 3 }}
                  onClose={() => setExtractionError(null)}
                >
                  {extractionError}
                </Alert>
              </Fade>
            )}

            {/* Translation Progress */}
            {isTranslating && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CircularProgress size={24} sx={{ color: currentTheme.accent, mr: 2 }} />
                <Typography variant="body2" sx={{ color: currentTheme.accent }}>
                  Translating content with AI...
                </Typography>
              </Box>
            )}

            {/* Content Display */}
            <Box 
              ref={contentRef}
              sx={{ 
                flex: 1, 
                overflow: 'auto',
                overflowY: 'scroll',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: currentTheme.background,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: currentTheme.accent,
                  borderRadius: '4px',
                  '&:hover': {
                    background: currentTheme.secondary,
                  },
                },
              }}
            >
              {settings.showOriginalText && (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    backgroundColor: currentTheme.paper,
                    border: `1px solid ${currentTheme.border}`,
                    userSelect: 'text', // Enable text selection
                    WebkitUserSelect: 'text',
                    MozUserSelect: 'text',
                    msUserSelect: 'text',
                  }}
                >
                  <Typography variant="h6" sx={{ color: currentTheme.accent, mb: 2 }}>
                    Original Text
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontSize: `${settings.fontSize - 2}px`,
                      fontFamily: settings.fontFamily,
                      lineHeight: settings.lineHeight,
                      color: currentTheme.secondary,
                      textAlign: settings.textAlign,
                      whiteSpace: 'pre-wrap',
                      userSelect: 'text', // Enable text selection
                      WebkitUserSelect: 'text',
                      MozUserSelect: 'text',
                      msUserSelect: 'text',
                      cursor: 'text',
                    }}
                  >
                    {text}
                  </Typography>
                </Paper>
              )}

              {translatedText ? (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 4,
                    backgroundColor: currentTheme.paper,
                    border: `2px solid ${currentTheme.accent}`,
                    borderRadius: 2,
                    userSelect: 'text', // Enable text selection for the entire container
                    WebkitUserSelect: 'text',
                    MozUserSelect: 'text',
                    msUserSelect: 'text',
                  }}
                >
                  <Box sx={{ 
                    maxWidth: `${settings.maxWidth}px`, 
                    mx: 'auto',
                    userSelect: 'text', // Enable text selection for the content box
                    WebkitUserSelect: 'text',
                    MozUserSelect: 'text',
                    msUserSelect: 'text',
                  }}>
                    {formatTranslatedText(translatedText)}
                  </Box>
                </Paper>
              ) : !isTranslating && !error && (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 6, 
                    backgroundColor: currentTheme.paper,
                    border: `1px solid ${currentTheme.border}`,
                    textAlign: 'center',
                  }}
                >
                  <TranslateIcon sx={{ fontSize: 64, color: currentTheme.secondary, mb: 2 }} />
                  <Typography variant="h5" sx={{ color: currentTheme.secondary, mb: 2 }}>
                    Ready to Translate
                  </Typography>
                  <Typography variant="body1" sx={{ color: currentTheme.secondary }}>
                    Click "Translate Text" to convert this content into English using AI.
                    {!translationService.isConfigured() && (
                      <><br /><br />Please configure your API key in Translation Settings first.</>
                    )}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {/* Settings Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 800, mx: 'auto' }}>
            
            {/* Translation Provider & Model Settings */}
            <Paper sx={paperStyles}>
              <Typography variant="h6" sx={{ mb: 3, color: currentTheme.accent, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TranslateIcon /> Translation Settings
              </Typography>
              
              <List disablePadding>
                {/* Provider Selection */}
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <SettingsIcon sx={{ color: currentTheme.accent }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Translation Provider"
                    secondary="Choose between Google Gemini, OpenRouter or DeepSeek"
                    primaryTypographyProps={{ color: currentTheme.text }}
                    secondaryTypographyProps={{ color: currentTheme.secondary }}
                    sx={{ flexGrow: 1 }}
                  />
                  <FormControl sx={{ width: 200, ml: 2 }}>
              <Select
                value={currentProvider}
                onChange={(e) => handleProviderChange(e.target.value as TranslationProvider)}
                size="small"
                sx={{
                  color: currentTheme.text,
                  backgroundColor: currentTheme.background,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: currentTheme.border,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: currentTheme.accent,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: currentTheme.accent,
                  },
                  '& .MuiSelect-icon': {
                    color: currentTheme.text,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: currentTheme.paper,
                      color: currentTheme.text,
                      border: `1px solid ${currentTheme.border}`,
                      '& .MuiMenuItem-root': {
                        color: currentTheme.text,
                        '&:hover': {
                          backgroundColor: `${currentTheme.accent}30`,
                        },
                        '&.Mui-selected': {
                          backgroundColor: `${currentTheme.accent}40`,
                          '&:hover': {
                            backgroundColor: `${currentTheme.accent}50`,
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="google">Google Gemini</MenuItem>
                <MenuItem value="openrouter">OpenRouter</MenuItem>
                <MenuItem value="deepseek">DeepSeek</MenuItem>
              </Select>
                  </FormControl>
                </ListItem>

                <Divider sx={{ backgroundColor: currentTheme.border, my: 1 }} />

                {/* Model Selection */}
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <TranslateIcon sx={{ color: currentTheme.accent }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={currentProvider === 'google' ? 'Gemini Model' : currentProvider === 'deepseek' ? 'DeepSeek Model' : 'OpenRouter Model'}
                    secondary={`Select the ${currentProvider === 'google' ? 'Gemini' : currentProvider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} model for translation`}
                    primaryTypographyProps={{ color: currentTheme.text }}
                    secondaryTypographyProps={{ color: currentTheme.secondary }}
                    sx={{ flexGrow: 1 }}
                  />
                  <FormControl sx={{ width: 280, ml: 2 }}>
                    <Select
                      value={currentModel}
                      onChange={handleModelChange}
                      displayEmpty
                      size="small"
                      sx={{
                        color: currentTheme.text,
                        backgroundColor: currentTheme.background,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: currentTheme.border,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: currentTheme.accent,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: currentTheme.accent,
                        },
                        '& .MuiSelect-icon': {
                          color: currentTheme.text,
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: currentTheme.paper,
                            color: currentTheme.text,
                            border: `1px solid ${currentTheme.border}`,
                            maxHeight: 300,
                            '& .MuiMenuItem-root': {
                              color: currentTheme.text,
                              '&:hover': {
                                backgroundColor: `${currentTheme.accent}30`,
                              },
                              '&.Mui-selected': {
                                backgroundColor: `${currentTheme.accent}40`,
                                '&:hover': {
                                  backgroundColor: `${currentTheme.accent}50`,
                                },
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value="" disabled sx={{ color: currentTheme.secondary }}>
                        Select Model
                      </MenuItem>
                      {currentProvider === 'google'
                        ? GEMINI_MODELS.map((model) => (
                            <MenuItem key={model} value={model}>
                              {model}
                            </MenuItem>
                          ))
                        : currentProvider === 'deepseek'
                        ? DEEPSEEK_MODELS.map((model) => (
                            <MenuItem key={model} value={model}>
                              {model}
                            </MenuItem>
                          ))
                        : openRouterModels.map((model) => (
                            <MenuItem key={model.id} value={model.id}>
                              <Box>
                                <Typography variant="body2">{model.name}</Typography>
                                <Typography variant="caption" sx={{ color: currentTheme.secondary }}>
                                  {model.id}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))
                      }
                    </Select>
                  </FormControl>
                </ListItem>

                {/* Provider Status */}
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ color: currentTheme.secondary }}>
                        Status: {translationService.isConfigured()
                          ? `${currentProvider === 'google' ? 'Google Gemini' : currentProvider === 'deepseek' ? 'DeepSeek' : 'OpenRouter'} configured ✓`
                          : 'Not configured - please check settings'}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Paper>

            {/* Device Mode Settings */}
            <Paper sx={paperStyles}>
              <Typography variant="h6" sx={{ mb: 3, color: currentTheme.accent, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextFieldsIcon /> Device Mode
              </Typography>
              
              <List disablePadding>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <TextFieldsIcon sx={{ color: currentTheme.accent }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Font Optimization"
                    secondary="Choose font set optimized for your device"
                    primaryTypographyProps={{ color: currentTheme.text }}
                    secondaryTypographyProps={{ color: currentTheme.secondary }}
                    sx={{ flexGrow: 1 }}
                  />
                  <FormControl sx={{ width: 250, ml: 2 }}>
                    <RadioGroup
                      value={settings.deviceMode}
                      onChange={handleDeviceModeChange}
                      row
                      sx={{ gap: 2 }}
                    >
                      <FormControlLabel
                        value="mobile"
                        control={
                          <Radio 
                            sx={{ 
                              color: currentTheme.secondary,
                              '&.Mui-checked': { color: currentTheme.accent }
                            }} 
                          />
                        }
                        label={
                          <Typography sx={{ color: currentTheme.text, fontSize: '0.875rem' }}>
                            Mobile/Tablet
                          </Typography>
                        }
                      />
                      <FormControlLabel
                        value="pc"
                        control={
                          <Radio 
                            sx={{ 
                              color: currentTheme.secondary,
                              '&.Mui-checked': { color: currentTheme.accent }
                            }} 
                          />
                        }
                        label={
                          <Typography sx={{ color: currentTheme.text, fontSize: '0.875rem' }}>
                            PC/Desktop
                          </Typography>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </ListItem>
              </List>
            </Paper>
            
            {/* Typography Settings */}
            <Paper sx={paperStyles}>
              <Typography variant="h6" sx={{ mb: 3, color: currentTheme.accent, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextFieldsIcon /> Typography Settings
              </Typography>
              
              <List disablePadding>
                {/* Font Size */}
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <FontSizeIcon sx={{ color: currentTheme.accent }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Font Size" 
                    secondary={`${settings.fontSize}px`}
                    primaryTypographyProps={{ color: currentTheme.text }}
                    secondaryTypographyProps={{ color: currentTheme.secondary }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Box sx={{ width: 250, ml: 2 }}>
                    <Slider
                      value={settings.fontSize}
                      min={12}
                      max={48}
                      step={1}
                      marks
                      onChange={handleFontSizeChange}
                      sx={{ 
                        color: currentTheme.accent,
                        '& .MuiSlider-markLabel': {
                          color: currentTheme.secondary,
                        }
                      }}
                    />
                  </Box>
                </ListItem>

                <Divider sx={{ my: 1, backgroundColor: currentTheme.border }} />

                {/* Font Family */}
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <TextFieldsIcon sx={{ color: currentTheme.accent }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Font Family"
                    primaryTypographyProps={{ color: currentTheme.text }}
                    sx={{ flexGrow: 1 }}
                  />
                  <FormControl sx={{ width: 250, ml: 2 }}>
                    <Select
                      value={settings.fontFamily}
                      onChange={handleFontFamilyChange}
                      size="small"
                      sx={{ 
                        color: currentTheme.text,
                        backgroundColor: currentTheme.background,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: currentTheme.border,
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: currentTheme.accent,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: currentTheme.accent,
                        },
                        '& .MuiSvgIcon-root': {
                          color: currentTheme.text,
                        },
                      }}
                      MenuProps={{
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                        PaperProps: {
                          sx: {
                            backgroundColor: currentTheme.paper,
                            color: currentTheme.text,
                            border: `1px solid ${currentTheme.border}`,
                            maxHeight: 300,
                            '& .MuiMenuItem-root': {
                              color: currentTheme.text,
                              '&:hover': {
                                backgroundColor: `${currentTheme.accent}30`,
                              },
                              '&.Mui-selected': {
                                backgroundColor: `${currentTheme.accent}40`,
                                '&:hover': {
                                  backgroundColor: `${currentTheme.accent}50`,
                                },
                              },
                            },
                          },
                        },
                      }}
                    >
                      {getCurrentFonts().map((font) => (
                        <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                          {fontDisplayNames[font] || font}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItem>

                <Divider sx={{ my: 1, backgroundColor: currentTheme.border }} />

                {/* Line Height */}
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LineSpacingIcon sx={{ color: currentTheme.accent }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Line Height" 
                    secondary={settings.lineHeight.toFixed(1)}
                    primaryTypographyProps={{ color: currentTheme.text }}
                    secondaryTypographyProps={{ color: currentTheme.secondary }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Box sx={{ width: 250, ml: 2 }}>
                    <Slider
                      value={settings.lineHeight}
                      min={1.2}
                      max={2.5}
                      step={0.1}
                      marks
                      onChange={handleLineHeightChange}
                      sx={{ 
                        color: currentTheme.accent,
                        '& .MuiSlider-markLabel': {
                          color: currentTheme.secondary,
                        }
                      }}
                    />
                  </Box>
                </ListItem>

                <Divider sx={{ my: 1, backgroundColor: currentTheme.border }} />

                {/* Max Width */}
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <WidthIcon sx={{ color: currentTheme.accent }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Max Width" 
                    secondary={`${settings.maxWidth}px`}
                    primaryTypographyProps={{ color: currentTheme.text }}
                    secondaryTypographyProps={{ color: currentTheme.secondary }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Box sx={{ width: 250, ml: 2 }}>
                    <Slider
                      value={settings.maxWidth}
                      min={400}
                      max={1200}
                      step={50}
                      marks
                      onChange={handleMaxWidthChange}
                      sx={{ 
                        color: currentTheme.accent,
                        '& .MuiSlider-markLabel': {
                          color: currentTheme.secondary,
                        }
                      }}
                    />
                  </Box>
                </ListItem>
              </List>
            </Paper>

            {/* Layout Settings */}
            <Paper sx={paperStyles}>
              <Typography variant="h6" sx={{ mb: 3, color: currentTheme.accent, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlignLeftIcon /> Layout Settings
              </Typography>
              
              {/* Text Alignment */}
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ color: currentTheme.text, fontWeight: 500, mb: 2 }}>
                  Text Alignment
                </Typography>
                <RadioGroup
                  row
                  value={settings.textAlign}
                  onChange={handleTextAlignChange}
                  sx={{ gap: 2 }}
                >
                  <FormControlLabel 
                    value="left" 
                    control={
                      <Radio 
                        sx={{ 
                          color: currentTheme.secondary,
                          '&.Mui-checked': { color: currentTheme.accent },
                        }} 
                      />
                    } 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlignLeftIcon sx={{ fontSize: 20, color: currentTheme.text }} />
                        <Typography sx={{ color: currentTheme.text }}>Left</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel 
                    value="center" 
                    control={
                      <Radio 
                        sx={{ 
                          color: currentTheme.secondary,
                          '&.Mui-checked': { color: currentTheme.accent },
                        }} 
                      />
                    } 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlignCenterIcon sx={{ fontSize: 20, color: currentTheme.text }} />
                        <Typography sx={{ color: currentTheme.text }}>Center</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel 
                    value="justify" 
                    control={
                      <Radio 
                        sx={{ 
                          color: currentTheme.secondary,
                          '&.Mui-checked': { color: currentTheme.accent },
                        }} 
                      />
                    } 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlignJustifyIcon sx={{ fontSize: 20, color: currentTheme.text }} />
                        <Typography sx={{ color: currentTheme.text }}>Justify</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </Box>

              <Divider sx={{ my: 2, backgroundColor: currentTheme.border }} />

              {/* Show Original Text */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ color: currentTheme.text, fontWeight: 500 }}>
                    Show Original Text
                  </Typography>
                  <Typography variant="body2" sx={{ color: currentTheme.secondary, mt: 0.5 }}>
                    Display the original text alongside the translation
                  </Typography>
                </Box>
                <Switch
                  checked={settings.showOriginalText}
                  onChange={handleShowOriginalChange}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: currentTheme.accent,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: currentTheme.accent,
                    },
                  }}
                />
              </Box>

              <Divider sx={{ my: 2, backgroundColor: currentTheme.border }} />

              {/* Highlight Dictionary Terms Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ color: currentTheme.text, fontWeight: 500 }}>
                    Highlight Dictionary Terms
                  </Typography>
                  <Typography variant="body2" sx={{ color: currentTheme.secondary, mt: 0.5 }}>
                    Highlight and make dictionary terms clickable to show extended descriptions
                  </Typography>
                </Box>
                <Switch
                  checked={settings.highlightDictionaryTerms}
                  onChange={(e) => setSettings(prev => ({ ...prev, highlightDictionaryTerms: e.target.checked }))}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: currentTheme.accent,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: currentTheme.accent,
                    },
                  }}
                />
              </Box>
            </Paper>

            {/* Theme Settings */}
            <Paper sx={paperStyles}>
              <Typography variant="h6" sx={{ mb: 3, color: currentTheme.accent, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaletteIcon /> Theme Settings
              </Typography>
              
              <Typography sx={{ color: currentTheme.text, fontWeight: 500, mb: 2 }}>
                Color Theme
              </Typography>
              <RadioGroup
                value={settings.theme}
                onChange={handleThemeChange}
                sx={{ gap: 1 }}
              >
                <FormControlLabel 
                  value="dark" 
                  control={
                    <Radio 
                      sx={{ 
                        color: currentTheme.secondary,
                        '&.Mui-checked': { color: currentTheme.accent },
                      }} 
                    />
                  } 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#2d2d2d', 
                        borderRadius: '4px', 
                        border: '2px solid #666' 
                      }} />
                      <Typography sx={{ color: currentTheme.text }}>Dark Theme</Typography>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="black" 
                  control={
                    <Radio 
                      sx={{ 
                        color: currentTheme.secondary,
                        '&.Mui-checked': { color: currentTheme.accent },
                      }} 
                    />
                  } 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#111111', 
                        borderRadius: '4px', 
                        border: '2px solid #444' 
                      }} />
                      <Typography sx={{ color: currentTheme.text }}>Black Theme</Typography>
                    </Box>
                  }
                />
                <FormControlLabel 
                  value="white" 
                  control={
                    <Radio 
                      sx={{ 
                        color: currentTheme.secondary,
                        '&.Mui-checked': { color: currentTheme.accent },
                      }} 
                    />
                  } 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '4px', 
                        border: '2px solid #ccc' 
                      }} />
                      <Typography sx={{ color: currentTheme.text }}>White Theme</Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </Paper>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ 
        borderTop: `1px solid ${currentTheme.border}`,
        backgroundColor: currentTheme.background,
        px: 3,
        py: 2,
      }}>
        <Button 
          onClick={handleClose}
          variant="contained"
          sx={{
            backgroundColor: currentTheme.accent,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: settings.theme === 'white' ? '#6d28d9' : '#8b5cf6',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Terms Extraction Popup */}
      <TermsExtractionPopup
        open={showExtractionPopup}
        onClose={handleCloseExtractionPopup}
        extractedTerms={extractedTerms}
        isLoading={isExtracting}
        error={extractionError}
        onAddTerm={handleAddTermToDictionary}
        sourceText={translatedText}
      />

      {/* Term Extended Description Popover */}
      <Popover
        open={Boolean(termPopupAnchor)}
        anchorEl={termPopupAnchor}
        onClose={() => {
          setTermPopupAnchor(null);
          setSelectedTerm(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            maxWidth: 400,
            p: 2,
            backgroundColor: currentTheme.paper,
            border: `2px solid ${currentTheme.accent}`,
            borderRadius: 2,
            boxShadow: `0 8px 32px rgba(124, 58, 237, 0.3)`,
          }
        }}
      >
        {selectedTerm && (
          <Box>
            {/* Term Header */}
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: currentTheme.accent,
                  mb: 1 
                }}
              >
                {selectedTerm.term}
              </Typography>
              
              {/* Category and Gender Chips */}
              {selectedTerm.description && (
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={selectedTerm.description.category}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(124, 58, 237, 0.2)',
                      color: currentTheme.accent,
                      fontSize: '0.75rem',
                    }}
                  />
                  {selectedTerm.description.gender && (
                    <Chip
                      label={selectedTerm.description.gender}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#60a5fa',
                        fontSize: '0.75rem',
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>

            {/* Short Description (from main dictionary) */}
            {(() => {
              const dictTerm = dictionaryEventManager.getTerms().find(
                t => t.term.toLowerCase() === selectedTerm.term.toLowerCase()
              );
              return dictTerm ? (
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#10b981',
                      fontWeight: 500,
                      fontStyle: 'italic',
                    }}
                  >
                    {dictTerm.explanation}
                  </Typography>
                </Box>
              ) : null;
            })()}

            {/* Long Description (Extended) */}
            {selectedTerm.description ? (
              <>
                <Divider sx={{ my: 2, borderColor: currentTheme.border }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: currentTheme.text,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedTerm.description.longDescription}
                </Typography>
                
                {/* Last Updated */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: currentTheme.secondary,
                    mt: 2,
                    display: 'block',
                  }}
                >
                  Last updated: {new Date(selectedTerm.description.lastUpdated).toLocaleDateString()}
                </Typography>
              </>
            ) : (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: currentTheme.secondary,
                  fontStyle: 'italic',
                }}
              >
                No extended description available
              </Typography>
            )}
          </Box>
        )}
      </Popover>
    </Dialog>
  );
};

export default React.memo(TranslationModal);
