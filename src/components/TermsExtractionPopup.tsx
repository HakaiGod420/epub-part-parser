import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Collapse,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as ExtendIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import { ExtractedTerm } from '../utils/dictionaryExtractorService';
import { dictionaryEventManager } from '../utils/dictionaryEventManager';

interface TermsExtractionPopupProps {
  open: boolean;
  onClose: () => void;
  extractedTerms: ExtractedTerm[];
  isLoading: boolean;
  error: string | null;
  onAddTerm: (term: ExtractedTerm) => void;
  sourceText?: string; // The translated text for context
}

const TermsExtractionPopup: React.FC<TermsExtractionPopupProps> = ({
  open,
  onClose,
  extractedTerms,
  isLoading,
  error,
  onAddTerm,
  sourceText = '',
}) => {
  const [addedTerms, setAddedTerms] = useState<Set<string>>(new Set());
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());
  const [updatedTerms, setUpdatedTerms] = useState<Set<string>>(new Set());

  const handleAddTerm = (term: ExtractedTerm) => {
    onAddTerm(term);
    setAddedTerms(prev => new Set(prev).add(term.term));
  };

  const handleUpdateTerm = (term: ExtractedTerm) => {
    // Update the extended description
    if (term.longDescription) {
      dictionaryEventManager.updateExtendedDescription(
        term.term, 
        term.longDescription, 
        term.category,
        term.gender
      );
      setUpdatedTerms(prev => new Set(prev).add(term.term));
    }
  };

  const handleClose = () => {
    setAddedTerms(new Set());
    setExpandedTerms(new Set());
    setUpdatedTerms(new Set());
    onClose();
  };

  const toggleTermExpansion = (termName: string) => {
    setExpandedTerms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(termName)) {
        newSet.delete(termName);
      } else {
        newSet.add(termName);
      }
      return newSet;
    });
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
    return colors[category] || '#7c3aed';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 9) return '#10b981'; // High confidence - success green
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
            <CircularProgress sx={{ color: '#10b981', mb: 2 }} />
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
                const isUpdated = updatedTerms.has(term.term);
                const isExpanded = expandedTerms.has(term.term);
                const isUpdateSuggestion = term.isUpdate;
                
                return (
                  <React.Fragment key={`${term.term}-${index}`}>
                    <ListItem
                      sx={{
                        backgroundColor: isAdded || isUpdated ? 'rgba(76, 175, 80, 0.1)' : 
                                        isUpdateSuggestion ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                        borderRadius: 1,
                        mb: 1,
                        border: isAdded || isUpdated ? '1px solid rgba(76, 175, 80, 0.3)' :
                                isUpdateSuggestion ? '1px solid rgba(255, 152, 0, 0.3)' : '1px solid transparent',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}
                    >
                      {/* Main term content */}
                      <Box display="flex" alignItems="flex-start" width="100%">
                        <Box flex={1}>
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
                            {isUpdateSuggestion && (
                              <Chip
                                icon={<UpdateIcon sx={{ fontSize: 16 }} />}
                                label="Update Available"
                                size="small"
                                sx={{
                                  backgroundColor: '#ff9800',
                                  color: '#ffffff',
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}
                            {term.longDescription && (
                              <Chip
                                label="Extended"
                                size="small"
                                sx={{
                                  backgroundColor: '#7c3aed',
                                  color: '#ffffff',
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}
                            {term.gender && (
                              <Chip
                                label={term.gender}
                                size="small"
                                sx={{
                                  backgroundColor: '#546e7a',
                                  color: '#ffffff',
                                  fontSize: '0.75rem',
                                }}
                              />
                            )}
                          </Box>
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
                        </Box>
                        
                        <Box display="flex" gap={1} ml={2}>
                          {isUpdateSuggestion ? (
                            isUpdated ? (
                              <IconButton disabled>
                                <CheckCircleIcon sx={{ color: '#10b981' }} />
                              </IconButton>
                            ) : (
                              <IconButton
                                onClick={() => handleUpdateTerm(term)}
                                sx={{
                                  color: '#ff9800',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                  },
                                }}
                                title="Update Extended Description"
                              >
                                <UpdateIcon />
                              </IconButton>
                            )
                          ) : (
                            <>
                              {isAdded ? (
                                <IconButton disabled>
                                  <CheckCircleIcon sx={{ color: '#10b981' }} />
                                </IconButton>
                              ) : (
                                <IconButton
                                  onClick={() => handleAddTerm(term)}
                                  sx={{
                                    color: '#10b981',
                                    '&:hover': {
                                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                    },
                                  }}
                                  title="Add to Dictionary"
                                >
                                  <AddIcon />
                                </IconButton>
                              )}
                            </>
                          )}
                          {term.longDescription && (
                            <IconButton
                              onClick={() => toggleTermExpansion(term.term)}
                              sx={{
                                color: '#7c3aed',
                                '&:hover': {
                                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                },
                              }}
                              title="View Extended Description"
                            >
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      {/* Extended Description Panel */}
                      {term.longDescription && (
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 2,
                              p: 2,
                              backgroundColor: 'rgba(124, 58, 237, 0.05)',
                              border: '1px solid rgba(124, 58, 237, 0.2)',
                              borderRadius: 2,
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <ExtendIcon sx={{ color: '#7c3aed', fontSize: 20 }} />
                              <Typography variant="subtitle2" sx={{ color: '#a78bfa', fontWeight: 600 }}>
                                Extended Description {isUpdateSuggestion && '(New Version)'}
                              </Typography>
                            </Box>
                            
                            {isUpdateSuggestion && term.existingLongDescription && (
                              <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid rgba(124, 58, 237, 0.2)' }}>
                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
                                  Current Description:
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: '#cbd5e1',
                                    lineHeight: 1.6,
                                    fontStyle: 'italic',
                                    opacity: 0.7,
                                  }}
                                >
                                  {term.existingLongDescription}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#ff9800', display: 'block', mt: 1 }}>
                                  ↓ Suggested Update ↓
                                </Typography>
                              </Box>
                            )}
                            
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#f1f5f9',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                              }}
                            >
                              {term.longDescription}
                            </Typography>
                            
                            <Alert severity="info" sx={{ mt: 2 }}>
                              <Typography variant="caption">
                                Extended descriptions are stored locally for creative reference.
                                Only the short description is used in translations.
                              </Typography>
                            </Alert>
                          </Paper>
                        </Collapse>
                      )}
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
        <Button onClick={handleClose} sx={{ color: '#10b981' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsExtractionPopup;

