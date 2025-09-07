import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { TranslationSettings, GEMINI_MODELS, DEFAULT_SYSTEM_INSTRUCTION, translationService } from '../utils/translationService';
import { 
  TranslationContextSettings, 
  loadTranslationContextSettings, 
  saveTranslationContextSettings 
} from '../utils/chapterContext';
import {
  DictionaryExtractorSettings,
  DEFAULT_EXTRACTOR_SETTINGS,
  dictionaryExtractorService
} from '../utils/dictionaryExtractorService';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const [settings, setSettings] = useState<TranslationSettings>({
    apiKey: '',
    model: 'gemini-2.5-pro',
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
  });

  const [contextSettings, setContextSettings] = useState<TranslationContextSettings>({
    includeDictionary: true,
    includeChapterTitle: false,
  });

  const [extractorSettings, setExtractorSettings] = useState<DictionaryExtractorSettings>(DEFAULT_EXTRACTOR_SETTINGS);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isExtractorOpen, setIsExtractorOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const currentSettings = translationService.getSettings();
      if (currentSettings) {
        setSettings(currentSettings);
      }
      
      const currentContextSettings = loadTranslationContextSettings();
      setContextSettings(currentContextSettings);

      const currentExtractorSettings = dictionaryExtractorService.getSettings();
      setExtractorSettings(currentExtractorSettings);
    }
  }, [open]);

  const handleSave = () => {
    if (!settings.apiKey.trim()) {
      alert('Please enter a valid API key');
      return;
    }

    translationService.saveSettings(settings);
    saveTranslationContextSettings(contextSettings);
    dictionaryExtractorService.saveSettings(extractorSettings);
    onClose();
  };

  const handleCancel = () => {
    // Reset to current settings
    const currentSettings = translationService.getSettings();
    if (currentSettings) {
      setSettings(currentSettings);
    } else {
      setSettings({
        apiKey: '',
        model: 'gemini-2.5-pro',
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
      });
    }
    
    const currentContextSettings = loadTranslationContextSettings();
    setContextSettings(currentContextSettings);

    const currentExtractorSettings = dictionaryExtractorService.getSettings();
    setExtractorSettings(currentExtractorSettings);
    
    onClose();
  };

  const handleResetInstruction = () => {
    setSettings(prev => ({
      ...prev,
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION
    }));
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: '#ffffff' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <SettingsIcon />
          Translation Settings
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* API Key */}
          <TextField
            id="gemini-api-key"
            label="Gemini API Key"
            type="password"
            value={settings.apiKey}
            onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            fullWidth
            required
            helperText="Get your API key from Google AI Studio"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#424242',
              }
            }}
          />

          {/* Model Selection */}
          <FormControl fullWidth>
            <InputLabel>Gemini Model</InputLabel>
            <Select
              id="gemini-model-selector"
              value={settings.model}
              label="Gemini Model"
              onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
              sx={{
                backgroundColor: '#424242',
              }}
            >
              {GEMINI_MODELS.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Translation Context Settings */}
          <Box sx={{ border: '1px solid #444', borderRadius: 1, p: 2, backgroundColor: '#333' }}>
            <Typography variant="h6" sx={{ color: '#4caf50', mb: 2 }}>
              Translation Context Settings
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
              Configure what additional information is included with the translation
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={contextSettings.includeDictionary}
                    onChange={(e) => setContextSettings(prev => ({ 
                      ...prev, 
                      includeDictionary: e.target.checked 
                    }))}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ color: '#ffffff' }}>Include Dictionary Terms</Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      Add your custom dictionary terms as context for better translation accuracy
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={contextSettings.includeChapterTitle}
                    onChange={(e) => setContextSettings(prev => ({ 
                      ...prev, 
                      includeChapterTitle: e.target.checked 
                    }))}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#4caf50',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#4caf50',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ color: '#ffffff' }}>Include Chapter Title</Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      Include the chapter title as context for translation
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>

          {/* Dictionary Term Extractor Settings */}
          <Accordion 
            expanded={isExtractorOpen} 
            onChange={(_, expanded) => setIsExtractorOpen(expanded)}
            sx={{ backgroundColor: '#3a3a3a' }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ color: '#ffffff' }}>Dictionary Term Extractor</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  Configure AI-powered extraction of dictionary terms from translated text
                </Typography>

                {/* Extractor API Key */}
                <TextField
                  label="Gemini API Key for Extractor (Optional)"
                  type="password"
                  value={extractorSettings.apiKey}
                  onChange={(e) => setExtractorSettings(prev => ({ 
                    ...prev, 
                    apiKey: e.target.value 
                  }))}
                  fullWidth
                  helperText="Leave empty to use the same API key as translation, or enter a separate key"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#424242',
                    }
                  }}
                />

                {/* Extractor Model Selection */}
                <FormControl fullWidth>
                  <InputLabel>Model for Term Extraction</InputLabel>
                  <Select
                    value={extractorSettings.model}
                    label="Model for Term Extraction"
                    onChange={(e) => setExtractorSettings(prev => ({ 
                      ...prev, 
                      model: e.target.value 
                    }))}
                    sx={{
                      backgroundColor: '#424242',
                    }}
                  >
                    {GEMINI_MODELS.map((model) => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Extraction Categories */}
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 2 }}>
                    What to Extract:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={extractorSettings.extractNames}
                          onChange={(e) => setExtractorSettings(prev => ({ 
                            ...prev, 
                            extractNames: e.target.checked 
                          }))}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#4caf50',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#4caf50',
                            },
                          }}
                        />
                      }
                      label="Character Names"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={extractorSettings.extractPlaces}
                          onChange={(e) => setExtractorSettings(prev => ({ 
                            ...prev, 
                            extractPlaces: e.target.checked 
                          }))}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#4caf50',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#4caf50',
                            },
                          }}
                        />
                      }
                      label="Places & Locations"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={extractorSettings.extractTerminology}
                          onChange={(e) => setExtractorSettings(prev => ({ 
                            ...prev, 
                            extractTerminology: e.target.checked 
                          }))}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#4caf50',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#4caf50',
                            },
                          }}
                        />
                      }
                      label="Technical Terminology"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={extractorSettings.extractCulturalReferences}
                          onChange={(e) => setExtractorSettings(prev => ({ 
                            ...prev, 
                            extractCulturalReferences: e.target.checked 
                          }))}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#4caf50',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#4caf50',
                            },
                          }}
                        />
                      }
                      label="Cultural References"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={extractorSettings.extractMagicConcepts}
                          onChange={(e) => setExtractorSettings(prev => ({ 
                            ...prev, 
                            extractMagicConcepts: e.target.checked 
                          }))}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#4caf50',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#4caf50',
                            },
                          }}
                        />
                      }
                      label="Magic & Fantasy Concepts"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={extractorSettings.extractTitlesRanks}
                          onChange={(e) => setExtractorSettings(prev => ({ 
                            ...prev, 
                            extractTitlesRanks: e.target.checked 
                          }))}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#4caf50',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#4caf50',
                            },
                          }}
                        />
                      }
                      label="Titles & Ranks"
                    />
                  </Box>
                </Box>

                {/* Info about the extractor */}
                <Box sx={{ p: 2, backgroundColor: '#2d4a3a', borderRadius: 1, border: '1px solid #4caf50' }}>
                  <Typography variant="body2" color="#4caf50">
                    <strong>How it works:</strong> After translating text, click "Extract Terms" to automatically identify and extract important dictionary terms using AI. You can then review and add selected terms to your dictionary.
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Advanced Settings */}
          <Accordion 
            expanded={isAdvancedOpen} 
            onChange={(_, expanded) => setIsAdvancedOpen(expanded)}
            sx={{ backgroundColor: '#3a3a3a' }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ color: '#ffffff' }}>Advanced Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ color: '#ffffff' }}>System Instruction</Typography>
                  <Button 
                    size="small" 
                    onClick={handleResetInstruction}
                    sx={{
                      color: '#4caf50',
                      '&:hover': {
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      },
                    }}
                  >
                    Reset to Default
                  </Button>
                </Box>
                <TextField
                  id="system-instruction"
                  multiline
                  rows={10}
                  value={settings.systemInstruction}
                  onChange={(e) => setSettings(prev => ({ ...prev, systemInstruction: e.target.value }))}
                  fullWidth
                  helperText="Instructions that guide the AI's translation behavior"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#424242',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    }
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Info */}
          <Box sx={{ p: 2, backgroundColor: '#2d4a3a', borderRadius: 1, border: '1px solid #4caf50' }}>
            <Typography variant="body2" color="#4caf50">
              <strong>Note:</strong> Your API key and settings are stored locally in your browser. 
              The API key is required to use the translation feature.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={handleCancel}
          sx={{
            color: '#b0b0b0',
            '&:hover': {
              backgroundColor: 'rgba(176, 176, 176, 0.1)',
              color: '#ffffff',
            },
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#45a049',
            },
          }}
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
