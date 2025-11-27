import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Divider,
} from '@mui/material';
import {
  Translate as TranslateIcon,
  OpenInNew as OpenInNewIcon,
  ContentPaste as PasteIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { translationService } from '../utils/translationService';
import { loadChapterContextFromStorage, buildTranslationContext, ChapterContext } from '../utils/chapterContext';
import TranslationModal from './TranslationModal';

interface PasteTextTranslationProps {
  bookTitle?: string;
}

const PasteTextTranslation: React.FC<PasteTextTranslationProps> = ({ bookTitle }) => {
  // Load pasted text from localStorage on mount
  const [pastedText, setPastedText] = useState(() => {
    return localStorage.getItem('pasteTextContent') || '';
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [chapterContext, setChapterContext] = useState<Partial<ChapterContext>>({});
  const [contextualText, setContextualText] = useState<string>('');

  // Save pasted text to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pasteTextContent', pastedText);
  }, [pastedText]);

  // Load chapter context on component mount
  useEffect(() => {
    const context = loadChapterContextFromStorage();
    setChapterContext(context);
  }, []);

  // Update contextual text when pasted text changes
  useEffect(() => {
    if (pastedText.trim()) {
      const context = loadChapterContextFromStorage();
      setChapterContext(context);
      
      // Build the contextual text with dictionary, optional texts, etc.
      const fullContext = buildTranslationContext(pastedText, {
        ...context,
        chapterTitle: 'Pasted Text',
        bookTitle: bookTitle || 'Custom Translation',
      });
      setContextualText(fullContext);
    } else {
      setContextualText('');
    }
  }, [pastedText, bookTitle]);

  // Reload context when modal opens (in case settings changed)
  useEffect(() => {
    if (modalOpen && pastedText.trim()) {
      const context = loadChapterContextFromStorage();
      setChapterContext(context);
      
      const fullContext = buildTranslationContext(pastedText, {
        ...context,
        chapterTitle: 'Pasted Text',
        bookTitle: bookTitle || 'Custom Translation',
      });
      setContextualText(fullContext);
    }
  }, [modalOpen, pastedText, bookTitle]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPastedText(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleClear = () => {
    setPastedText('');
    localStorage.removeItem('pasteTextContent');
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <TranslateIcon sx={{ color: '#7c3aed' }} />
          Paste Text Translation
        </Typography>
      </Box>

      {/* Instructions */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3,
          backgroundColor: 'background.paper',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: 3,
        }}
      >
        <Typography variant="body1" sx={{ color: '#b0b0b0', mb: 2 }}>
          Paste Korean text below to translate it with all the same features as EPUB translation 
          (dictionary terms, term extraction, extended descriptions, etc.)
        </Typography>

        {/* Text Input Area */}
        <TextField
          multiline
          rows={10}
          fullWidth
          placeholder="Paste your Korean text here to translate..."
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1a1a2e',
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'rgba(124, 58, 237, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(124, 58, 237, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#7c3aed',
              },
            },
            '& .MuiInputBase-input': {
              color: '#f1f5f9',
              fontFamily: 'Noto Sans KR, sans-serif',
            },
          }}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<PasteIcon />}
            onClick={handlePaste}
            sx={{
              borderColor: 'rgba(124, 58, 237, 0.5)',
              color: '#a78bfa',
              '&:hover': {
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
              },
            }}
          >
            Paste from Clipboard
          </Button>

          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={!pastedText}
            sx={{
              borderColor: 'rgba(239, 68, 68, 0.5)',
              color: '#ef4444',
              '&:hover': {
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              },
              '&:disabled': {
                borderColor: 'rgba(100, 100, 100, 0.3)',
                color: '#666',
              },
            }}
          >
            Clear Text
          </Button>

          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenModal}
            disabled={!pastedText.trim()}
            sx={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 24px rgba(124, 58, 237, 0.5)',
              },
              '&:disabled': {
                background: '#333',
                color: '#666',
                boxShadow: 'none',
              },
            }}
          >
            Open Translation Reader
          </Button>
        </Box>

        {/* Character Count */}
        {pastedText && (
          <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
            {pastedText.length} characters
          </Typography>
        )}
      </Paper>

      {/* Context Information */}
      {chapterContext && pastedText && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: 'rgba(124, 58, 237, 0.05)', 
            border: '1px solid rgba(124, 58, 237, 0.15)', 
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#a78bfa', mb: 1, fontWeight: 600 }}>
            Translation Context Includes:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {chapterContext.includeDictionary && chapterContext.dictionary && chapterContext.dictionary.length > 0 && (
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                • Dictionary terms ({chapterContext.dictionary.length} terms)
              </Typography>
            )}
            {chapterContext.optionalTextToggles?.some((toggle, i) => toggle && chapterContext.optionalTexts?.[i]) && (
              <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                • Optional text instructions
              </Typography>
            )}
            {!chapterContext.includeDictionary && 
             !chapterContext.optionalTextToggles?.some((toggle, i) => toggle && chapterContext.optionalTexts?.[i]) && (
              <Typography variant="body2" sx={{ color: '#888' }}>
                • Basic text content only
              </Typography>
            )}
          </Box>
        </Paper>
      )}

      {/* Info about API configuration */}
      {!translationService.isConfigured() && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mt: 2,
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#ef4444' }}>
            ⚠️ Please configure your API key in the Translation Settings (gear icon) to use translation features.
          </Typography>
        </Paper>
      )}

      {/* Translation Modal - with auto-translate enabled for paste text mode */}
      <TranslationModal
        key={`paste-${pastedText.substring(0, 50)}`}
        open={modalOpen}
        onClose={handleCloseModal}
        text={contextualText}
        chapterTitle="Pasted Text"
        images={[]}
        hasPreviousChapter={false}
        hasNextChapter={false}
        autoTranslate={true}
      />
    </Box>
  );
};

export default PasteTextTranslation;
