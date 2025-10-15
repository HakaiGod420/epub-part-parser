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
  images: Uint8Array[];  // images from chapter to indicate presence in modal
  // Navigation props
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  hasPreviousChapter?: boolean;
  hasNextChapter?: boolean;
  // Chapter progress props
  currentChapter?: number;
  totalChapters?: number;
}

const TranslationComponent: React.FC<TranslationComponentProps> = ({ 
  text, 
  chapterTitle, 
  images,
  bookTitle,
  onPreviousChapter,
  onNextChapter,
  hasPreviousChapter,
  hasNextChapter,
  currentChapter,
  totalChapters,
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
      <Divider sx={{ mb: 3, backgroundColor: 'rgba(124, 58, 237, 0.3)' }} />
      
      {/* Translation Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ 
          background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: 'bold' 
        }}>
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

      {/* Getting Started Message */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          backgroundColor: 'background.paper',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: 3,
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
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.15)', borderRadius: 2, textAlign: 'left' }}>
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
        images={images}
        onPreviousChapter={onPreviousChapter}
        onNextChapter={onNextChapter}
        hasPreviousChapter={hasPreviousChapter}
        hasNextChapter={hasNextChapter}
        currentChapter={currentChapter}
        totalChapters={totalChapters}
      />
    </Box>
  );
};

export default TranslationComponent;
