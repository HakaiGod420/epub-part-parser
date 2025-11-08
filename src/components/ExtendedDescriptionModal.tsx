import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  AutoAwesome as GenerateIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  extendedDescriptionService,
  GenerationContext,
  ExtendedDescription,
} from '../utils/extendedDescriptionService';

interface ExtendedDescriptionModalProps {
  open: boolean;
  onClose: () => void;
  term: string;
  category: string;
  sourceText: string;
  existingShortDescription?: string;
  existingExtendedDescription?: ExtendedDescription;
  onSave?: (description: ExtendedDescription) => void;
}

type GenerationStep = 'idle' | 'generating' | 'preview-short' | 'preview-long' | 'editing';

const ExtendedDescriptionModal: React.FC<ExtendedDescriptionModalProps> = ({
  open,
  onClose,
  term,
  category,
  sourceText,
  existingShortDescription,
  existingExtendedDescription,
  onSave,
}) => {
  const [step, setStep] = useState<GenerationStep>('idle');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingShort, setIsEditingShort] = useState(false);
  const [isEditingLong, setIsEditingLong] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      if (existingExtendedDescription) {
        setShortDescription(existingExtendedDescription.shortDescription);
        setLongDescription(existingExtendedDescription.longDescription);
        setGender(existingExtendedDescription.gender);
        setStep('preview-long');
      } else if (existingShortDescription) {
        setShortDescription(existingShortDescription);
        setLongDescription('');
        setStep('preview-short');
      } else {
        setShortDescription('');
        setLongDescription('');
        setStep('idle');
      }
      setError(null);
      setIsEditingShort(false);
      setIsEditingLong(false);
    }
  }, [open, existingShortDescription, existingExtendedDescription]);

  const handleGenerate = async () => {
    if (!extendedDescriptionService.isConfigured()) {
      setError('Extended description service not configured. Please ensure API key is set in translation settings.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const context: GenerationContext = {
        term,
        category,
        sourceText,
        existingDescription: existingExtendedDescription,
      };

      const result = await extendedDescriptionService.generateDescription(context);
      
      setShortDescription(result.shortDescription);
      setLongDescription(result.longDescription);
      setGender(result.gender);
      
      // Move to short preview first
      setStep('preview-short');
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdoptShort = () => {
    setStep('preview-long');
  };

  const handleSaveExtended = () => {
    if (!shortDescription.trim() || !longDescription.trim()) {
      setError('Both short and long descriptions are required.');
      return;
    }

    const description: ExtendedDescription = {
      term,
      shortDescription: shortDescription.trim(),
      longDescription: longDescription.trim(),
      category,
      gender,
      lastUpdated: Date.now(),
      sourceContext: sourceText.substring(0, 500), // Store snippet
    };

    try {
      extendedDescriptionService.saveExtendedDescription(description);
      if (onSave) {
        onSave(description);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save description');
    }
  };

  const handleClose = () => {
    setStep('idle');
    setError(null);
    onClose();
  };

  const getCategoryColor = (cat: string): string => {
    const colors: { [key: string]: string } = {
      'Names (Characters)': '#e91e63',
      'Places (Locations)': '#2196f3',
      'Terminology (Technical terms)': '#ff9800',
      'Cultural References': '#9c27b0',
      'Magic/Fantasy Concepts': '#673ab7',
      'Titles & Ranks': '#795548',
    };
    return colors[cat] || '#7c3aed';
  };

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
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{ color: '#ffffff', borderBottom: '1px solid rgba(124, 58, 237, 0.3)' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">
              Extended Description: {term}
            </Typography>
            <Chip
              label={category}
              size="small"
              sx={{
                backgroundColor: getCategoryColor(category),
                color: '#ffffff',
                fontSize: '0.75rem',
              }}
            />
            {gender && (
              <Chip
                label={gender}
                size="small"
                sx={{
                  backgroundColor: '#546e7a',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>
          <IconButton onClick={handleClose} sx={{ color: '#ffffff' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Idle/Initial State */}
        {step === 'idle' && (
          <Box textAlign="center" py={4}>
            <GenerateIcon sx={{ fontSize: 64, color: '#7c3aed', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Generate Extended Description
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Create rich, immersive descriptions for your narrative elements.
              This will generate both a short (1-sentence) and long (detailed) description.
            </Typography>
            <Button
              variant="contained"
              startIcon={isGenerating ? <CircularProgress size={20} /> : <GenerateIcon />}
              onClick={handleGenerate}
              disabled={isGenerating}
              sx={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
                },
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate Descriptions'}
            </Button>
          </Box>
        )}

        {/* Short Description Preview */}
        {(step === 'preview-short' || step === 'preview-long' || step === 'editing') && (
          <Box>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                mb: 2, 
                backgroundColor: '#1a1a2e',
                border: '1px solid rgba(124, 58, 237, 0.3)',
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" sx={{ color: '#10b981', fontWeight: 600 }}>
                  Short Description (for Translation)
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setIsEditingShort(!isEditingShort)}
                  sx={{ color: '#7c3aed' }}
                >
                  {isEditingShort ? <ViewIcon /> : <EditIcon />}
                </IconButton>
              </Box>
              
              {isEditingShort ? (
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Enter short 1-sentence description..."
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      backgroundColor: '#0f0f1a',
                    },
                  }}
                />
              ) : (
                <Typography variant="body1" sx={{ color: '#f1f5f9', fontStyle: 'italic' }}>
                  {shortDescription || 'No short description yet'}
                </Typography>
              )}
              
              {step === 'preview-short' && (
                <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleAdoptShort}
                    sx={{
                      borderColor: '#10b981',
                      color: '#10b981',
                      '&:hover': {
                        borderColor: '#059669',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      },
                    }}
                  >
                    Adopt Short → Continue
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Long Description Section */}
            {(step === 'preview-long' || step === 'editing') && (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  backgroundColor: '#1a1a2e',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle1" sx={{ color: '#a78bfa', fontWeight: 600 }}>
                    Extended Description (Local Only)
                  </Typography>
                  <Box display="flex" gap={1}>
                    <IconButton 
                      size="small" 
                      onClick={() => setIsEditingLong(!isEditingLong)}
                      sx={{ color: '#7c3aed' }}
                    >
                      {isEditingLong ? <ViewIcon /> : <EditIcon />}
                    </IconButton>
                    {!isGenerating && (
                      <Tooltip title="Regenerate">
                        <IconButton 
                          size="small" 
                          onClick={handleGenerate}
                          sx={{ color: '#7c3aed' }}
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                {isEditingLong ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    value={longDescription}
                    onChange={(e) => setLongDescription(e.target.value)}
                    placeholder="Enter detailed 1-10 sentence description..."
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#ffffff',
                        backgroundColor: '#0f0f1a',
                      },
                    }}
                  />
                ) : (
                  <Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#f1f5f9', 
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {longDescription || 'No extended description yet'}
                    </Typography>
                  </Box>
                )}

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption">
                    Extended descriptions are stored locally and never transmitted with translations.
                    Use them for personal reference and creative world-building.
                  </Typography>
                </Alert>
              </Paper>
            )}
          </Box>
        )}

        {/* Generation Progress */}
        {isGenerating && (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <CircularProgress sx={{ color: '#7c3aed', mb: 2 }} />
            <Typography>Generating descriptions...</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid rgba(124, 58, 237, 0.3)', p: 2 }}>
        <Button 
          onClick={handleClose}
          sx={{
            color: '#b0b0b0',
            '&:hover': {
              backgroundColor: 'rgba(176, 176, 176, 0.1)',
            },
          }}
        >
          Cancel
        </Button>
        
        {(step === 'preview-long' || step === 'editing') && (
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveExtended}
            disabled={!shortDescription.trim() || !longDescription.trim()}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              },
              '&:disabled': {
                background: '#333',
                color: '#666',
              },
            }}
          >
            Save Extended Description
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ExtendedDescriptionModal;
