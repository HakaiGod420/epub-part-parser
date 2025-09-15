import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import {
  Translate as TranslateIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { translationService } from '../utils/translationService';
import { loadChapterContextFromStorage, buildTranslationContext, ChapterContext } from '../utils/chapterContext';
import TranslationModal from './TranslationModal';

interface TranslationComponentProps {
  text: string;
  chapterTitle?: string;
  bookTitle?: string;
  // Navigation props
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  hasPreviousChapter?: boolean;
  hasNextChapter?: boolean;
}

const TranslationComponent: React.FC<TranslationComponentProps> = ({ 
  text, 
  chapterTitle, 
  bookTitle,
  onPreviousChapter,
  onNextChapter,
  hasPreviousChapter,
  hasNextChapter,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [chapterContext, setChapterContext] = useState<Partial<ChapterContext>>({});
  const [contextualText, setContextualText] = useState<string>('');

  // Load chapter context on component mount and when dependencies change
  useEffect(() => {
    const context = loadChapterContextFromStorage();
    setChapterContext(context);
    
    // Build the contextual text with dictionary, optional texts, etc.
    const fullContext = buildTranslationContext(text, {
      ...context,
      chapterTitle,
      bookTitle,
    });
    setContextualText(fullContext);
  }, [text, chapterTitle, bookTitle]);

  // Reload context when modal opens (in case settings changed)
  useEffect(() => {
    if (modalOpen) {
      const context = loadChapterContextFromStorage();
      setChapterContext(context);
      
      const fullContext = buildTranslationContext(text, {
        ...context,
        chapterTitle,
        bookTitle,
      });
      setContextualText(fullContext);
    }
  }, [modalOpen, text, chapterTitle, bookTitle]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3, backgroundColor: '#4caf50' }} />
      
      {/* Translation Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
          Translation
          {chapterTitle && (
            <Typography variant="subtitle1" sx={{ color: '#b0b0b0', mt: 0.5 }}>
              {chapterTitle}
            </Typography>
          )}
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<OpenInNewIcon />}
          onClick={handleOpenModal}
          disabled={!contextualText.trim()}
          sx={{
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#45a049',
            },
            '&:disabled': {
              backgroundColor: '#333',
              color: '#666',
            },
          }}
        >
          Open Translation Reader
        </Button>
      </Box>

      {/* Getting Started Message */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          backgroundColor: '#2d2d2d',
          border: '1px solid #444',
          textAlign: 'center',
        }}
      >
        <TranslateIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
          Enhanced Translation Experience
        </Typography>
        <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
          Click "Open Translation Reader" to access the full-screen translation interface with customizable reading settings.
          {!translationService.isConfigured() && (
            <><br />Please configure your API key in settings first.</>
          )}
        </Typography>
        
        {/* Context Information */}
        {chapterContext && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#1e1e1e', borderRadius: 1, textAlign: 'left' }}>
            <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 1 }}>
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
              {chapterContext.includeChapterTitle && chapterTitle && (
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  • Chapter title: {chapterTitle}
                </Typography>
              )}
              {!chapterContext.includeDictionary && !chapterContext.includeChapterTitle && 
               !chapterContext.optionalTextToggles?.some((toggle, i) => toggle && chapterContext.optionalTexts?.[i]) && (
                <Typography variant="body2" sx={{ color: '#888' }}>
                  • Basic chapter content only
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Translation Modal */}
      <TranslationModal
        key={`${chapterTitle}-${text.substring(0, 100)}`} // Force re-render when chapter changes
        open={modalOpen}
        onClose={handleCloseModal}
        text={contextualText}
        chapterTitle={chapterTitle}
        onPreviousChapter={onPreviousChapter}
        onNextChapter={onNextChapter}
        hasPreviousChapter={hasPreviousChapter}
        hasNextChapter={hasNextChapter}
      />
    </Box>
  );
};

export default TranslationComponent;
