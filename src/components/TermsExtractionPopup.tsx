import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { ExtractedTerm } from '../utils/dictionaryExtractorService';

interface TermsExtractionPopupProps {
  open: boolean;
  onClose: () => void;
  extractedTerms: ExtractedTerm[];
  isLoading: boolean;
  error: string | null;
  onAddTerm: (term: ExtractedTerm) => void;
}

const TermsExtractionPopup: React.FC<TermsExtractionPopupProps> = ({
  open,
  onClose,
  extractedTerms,
  isLoading,
  error,
  onAddTerm
}) => {
  const [addedTerms, setAddedTerms] = useState<Set<string>>(new Set());

  const handleAddTerm = (term: ExtractedTerm) => {
    onAddTerm(term);
    setAddedTerms(prev => new Set(prev).add(term.term));
  };

  const handleClose = () => {
    setAddedTerms(new Set());
    onClose();
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Names (Characters)': '#e91e63',
      'Places (Locations)': '#2196f3',
      'Terminology (Technical terms)': '#ff9800',
      'Cultural References': '#9c27b0',
      'Magic/Fantasy Concepts': '#673ab7',
      'Titles & Ranks': '#795548',
    };
    return colors[category] || '#4caf50';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 9) return '#4caf50'; // High confidence - green
    if (confidence >= 7) return '#ff9800'; // Medium confidence - orange
    return '#f44336'; // Lower confidence - red
  };

  const sortedTerms = [...extractedTerms].sort((a, b) => b.confidence - a.confidence);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2d2d2d',
          color: '#ffffff',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ color: '#ffffff' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            Extracted Dictionary Terms
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: '#ffffff' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLoading && (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <CircularProgress sx={{ color: '#4caf50', mb: 2 }} />
            <Typography>Extracting terms from translated text...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && extractedTerms.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography color="textSecondary">
              No dictionary terms were extracted from the translated text.
            </Typography>
          </Box>
        )}

        {!isLoading && !error && extractedTerms.length > 0 && (
          <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Found {extractedTerms.length} potential dictionary terms. Click the + button to add terms to your dictionary.
            </Typography>

            <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {sortedTerms.map((term, index) => {
                const isAdded = addedTerms.has(term.term);
                
                return (
                  <React.Fragment key={`${term.term}-${index}`}>
                    <ListItem
                      sx={{
                        backgroundColor: isAdded ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                        borderRadius: 1,
                        mb: 1,
                        border: isAdded ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid transparent',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="h6" sx={{ color: '#ffffff' }}>
                              {term.term}
                            </Typography>
                            <Chip
                              label={term.category}
                              size="small"
                              sx={{
                                backgroundColor: getCategoryColor(term.category),
                                color: '#ffffff',
                                fontSize: '0.75rem',
                              }}
                            />
                            <Chip
                              label={`${term.confidence}/10`}
                              size="small"
                              sx={{
                                backgroundColor: getConfidenceColor(term.confidence),
                                color: '#ffffff',
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#b0b0b0',
                              lineHeight: 1.4,
                              mt: 0.5
                            }}
                          >
                            {term.explanation}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        {isAdded ? (
                          <IconButton disabled>
                            <CheckCircleIcon sx={{ color: '#4caf50' }} />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={() => handleAddTerm(term)}
                            sx={{
                              color: '#4caf50',
                              '&:hover': {
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                              },
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < sortedTerms.length - 1 && (
                      <Divider sx={{ backgroundColor: '#444', my: 0.5 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} sx={{ color: '#4caf50' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsExtractionPopup;
