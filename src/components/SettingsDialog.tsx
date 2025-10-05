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
import { TranslationSettings, GEMINI_MODELS, DEFAULT_SYSTEM_INSTRUCTION, DEFAULT_AI_CONFIG, translationService, TranslationProvider } from '../utils/translationService';
import { openRouterService, OpenRouterModel } from '../utils/openRouterService';
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
  const [currentProvider, setCurrentProvider] = useState<TranslationProvider>('google');
  const [settings, setSettings] = useState<TranslationSettings>({
    provider: 'google',
    apiKey: '',
    model: 'gemini-2.5-pro',
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
    aiConfig: DEFAULT_AI_CONFIG,
  });

  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState('');
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const [contextSettings, setContextSettings] = useState<TranslationContextSettings>({
    includeDictionary: true,
    includeChapterTitle: false,
    enhanceTableFormatting: false,
  });

  const [extractorSettings, setExtractorSettings] = useState<DictionaryExtractorSettings>(DEFAULT_EXTRACTOR_SETTINGS);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isExtractorOpen, setIsExtractorOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const currentSettings = translationService.getSettings();
      const providerSettings = translationService.getProviderSettings();
      const provider = translationService.getCurrentProvider();
      
      setCurrentProvider(provider);
      
      if (currentSettings) {
        setSettings(currentSettings);
      }
      
      if (providerSettings?.openRouterSettings) {
        setOpenRouterApiKey(providerSettings.openRouterSettings.apiKey || '');
        setOpenRouterModel(providerSettings.openRouterSettings.model || '');
      }
      
      const currentContextSettings = loadTranslationContextSettings();
      setContextSettings(currentContextSettings);

      const currentExtractorSettings = dictionaryExtractorService.getSettings();
      setExtractorSettings(currentExtractorSettings);
    }
  }, [open]);

  const handleLoadOpenRouterModels = async () => {
    if (!openRouterApiKey.trim()) {
      setModelError('Please enter an OpenRouter API key first');
      return;
    }

    setIsLoadingModels(true);
    setModelError(null);
    
    try {
      // Save the API key temporarily to openRouterService
      openRouterService.saveSettings({
        apiKey: openRouterApiKey,
        model: openRouterModel,
        baseUrl: 'https://openrouter.ai/api/v1',
        siteUrl: 'https://epub-parser.local',
        siteName: 'EPUB Parser'
      });
      
      const models = await openRouterService.getAvailableModels();
      setOpenRouterModels(models);
      
      if (models.length > 0 && !openRouterModel) {
        // Set first model as default if none selected
        setOpenRouterModel(models[0].id);
      }
    } catch (error) {
      console.error('Failed to load OpenRouter models:', error);
      setModelError(error instanceof Error ? error.message : 'Failed to load models');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleProviderChange = (provider: TranslationProvider) => {
    setCurrentProvider(provider);
    
    // Update the settings provider
    setSettings(prev => ({
      ...prev,
      provider
    }));
  };

  const handleOpenRouterModelChange = (modelId: string) => {
    setOpenRouterModel(modelId);
    
    // Save immediately to localStorage so it persists even if models aren't loaded
    const currentOpenRouterSettings = openRouterService.getSettings() || {
      apiKey: openRouterApiKey,
      model: '',
      baseUrl: 'https://openrouter.ai/api/v1',
      siteUrl: 'https://epub-parser.local',
      siteName: 'EPUB Parser'
    };
    
    const updatedSettings = {
      ...currentOpenRouterSettings,
      apiKey: openRouterApiKey,
      model: modelId
    };
    
    openRouterService.saveSettings(updatedSettings);
  };

  const handleSave = () => {
    if (currentProvider === 'google') {
      if (!settings.apiKey.trim()) {
        alert('Please enter a valid Google API key');
        return;
      }
      translationService.saveSettings({
        ...settings,
        provider: 'google'
      });
    } else if (currentProvider === 'openrouter') {
      if (!openRouterApiKey.trim()) {
        alert('Please enter a valid OpenRouter API key');
        return;
      }
      if (!openRouterModel.trim()) {
        alert('Please select an OpenRouter model');
        return;
      }
      
      // Save OpenRouter settings
      const openRouterSettings = {
        apiKey: openRouterApiKey,
        model: openRouterModel,
        baseUrl: 'https://openrouter.ai/api/v1',
        siteUrl: 'https://epub-parser.local',
        siteName: 'EPUB Parser'
      };
      
      openRouterService.saveSettings(openRouterSettings);
      
      // Save as translation settings for compatibility
      translationService.saveSettings({
        provider: 'openrouter',
        apiKey: openRouterApiKey,
        model: openRouterModel,
        systemInstruction: settings.systemInstruction,
        aiConfig: DEFAULT_AI_CONFIG // OpenRouter doesn't use Google's AI config
      });
    }

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
        provider: 'google',
        apiKey: '',
        model: 'gemini-2.5-pro',
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
        aiConfig: DEFAULT_AI_CONFIG,
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
          {/* Translation Provider Selection */}
          <Box sx={{ border: '1px solid #444', borderRadius: 1, p: 2, backgroundColor: '#333' }}>
            <Typography variant="h6" sx={{ color: '#7c3aed', mb: 2 }}>
              Translation Provider
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Select Translation API</InputLabel>
              <Select
                value={currentProvider}
                label="Select Translation API"
                onChange={(e) => handleProviderChange(e.target.value as TranslationProvider)}
                sx={{
                  backgroundColor: '#424242',
                }}
              >
                <MenuItem value="google">Google Gemini</MenuItem>
                <MenuItem value="openrouter">OpenRouter</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Google API Settings */}
          {currentProvider === 'google' && (
            <>
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
            </>
          )}

          {/* OpenRouter API Settings */}
          {currentProvider === 'openrouter' && (
            <>
              <TextField
                label="OpenRouter API Key"
                type="password"
                value={openRouterApiKey}
                onChange={(e) => setOpenRouterApiKey(e.target.value)}
                fullWidth
                required
                helperText="Get your API key from OpenRouter.ai"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#424242',
                  }
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Button
                  variant="outlined"
                  onClick={handleLoadOpenRouterModels}
                  disabled={isLoadingModels}
                  sx={{
                    minWidth: 150,
                    height: 56,
                    bordercolor: '#7c3aed',
                    color: '#7c3aed',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      bordercolor: '#7c3aed',
                    },
                  }}
                >
                  {isLoadingModels ? 'Loading...' : 'Load Models'}
                </Button>

                {openRouterModels.length > 0 ? (
                  <FormControl fullWidth>
                    <InputLabel>OpenRouter Model</InputLabel>
                    <Select
                      value={openRouterModel}
                      label="OpenRouter Model"
                      onChange={(e) => handleOpenRouterModelChange(e.target.value)}
                      sx={{
                        backgroundColor: '#424242',
                      }}
                    >
                      {openRouterModels.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          <Box>
                            <Typography variant="body2">{model.name}</Typography>
                            <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
                              {model.id} - Context: {model.context_length}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    label="OpenRouter Model ID"
                    value={openRouterModel}
                    onChange={(e) => handleOpenRouterModelChange(e.target.value)}
                    fullWidth
                    placeholder="e.g., openai/gpt-4o, anthropic/claude-3-opus"
                    helperText="Enter model ID directly or load models above"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#424242',
                      }
                    }}
                  />
                )}
              </Box>

              {modelError && (
                <Typography variant="body2" sx={{ color: '#f44336' }}>
                  {modelError}
                </Typography>
              )}

              {openRouterModels.length > 0 ? (
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  Loaded {openRouterModels.length} models. The system instruction for Google API will be reused with OpenRouter.
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  You can enter a model ID manually (like "openai/gpt-4o") or load the full model list above. 
                  Selected models are saved automatically and will work for translation even without loading the full list.
                </Typography>
              )}
            </>
          )}



          {/* AI Configuration Settings */}
          <Box sx={{ border: '1px solid #444', borderRadius: 1, p: 2, backgroundColor: '#333' }}>
            <Typography variant="h6" sx={{ color: '#7c3aed', mb: 2 }}>
              AI Configuration
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
              Fine-tune AI model parameters for translation quality and behavior
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Top P */}
              <TextField
                label="Top P"
                type="number"
                value={settings.aiConfig.topP}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  aiConfig: { ...prev.aiConfig, topP: parseFloat(e.target.value) || 0.95 }
                }))}
                inputProps={{ min: 0.1, max: 1.0, step: 0.01 }}
                fullWidth
                helperText="Controls diversity of responses (0.1-1.0). Lower = more focused, Higher = more creative"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#424242',
                  }
                }}
              />

              {/* Temperature */}
              <TextField
                label="Temperature"
                type="number"
                value={settings.aiConfig.temperature}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  aiConfig: { ...prev.aiConfig, temperature: parseFloat(e.target.value) || 1.0 }
                }))}
                inputProps={{ min: 0.0, max: 2.0, step: 0.1 }}
                fullWidth
                helperText="Controls randomness (0.0-2.0). Lower = more consistent, Higher = more varied"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#424242',
                  }
                }}
              />

              {/* Thinking Budget */}
              <TextField
                label="Thinking Budget"
                type="number"
                value={settings.aiConfig.thinkingBudget}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  aiConfig: { ...prev.aiConfig, thinkingBudget: parseInt(e.target.value) || -1 }
                }))}
                inputProps={{ min: -1, max: 100000, step: 1000 }}
                fullWidth
                helperText="Max thinking tokens (-1 for unlimited). Higher allows more complex reasoning"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#424242',
                  }
                }}
              />

              {/* Max Output Tokens */}
              <TextField
                label="Max Output Tokens"
                type="number"
                value={settings.aiConfig.maxOutputTokens}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  aiConfig: { ...prev.aiConfig, maxOutputTokens: parseInt(e.target.value) || 8192 }
                }))}
                inputProps={{ min: 1, max: 32768, step: 256 }}
                fullWidth
                helperText="Maximum length of translation output (1-32768 tokens)"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#424242',
                  }
                }}
              />
            </Box>
          </Box>

          {/* Translation Context Settings */}
          <Box sx={{ border: '1px solid #444', borderRadius: 1, p: 2, backgroundColor: '#333' }}>
            <Typography variant="h6" sx={{ color: '#7c3aed', mb: 2 }}>
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
                        color: '#7c3aed',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundcolor: '#7c3aed',
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
                        color: '#7c3aed',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundcolor: '#7c3aed',
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
              
              <FormControlLabel
                control={
                  <Switch
                    checked={contextSettings.enhanceTableFormatting}
                    onChange={(e) => setContextSettings(prev => ({ 
                      ...prev, 
                      enhanceTableFormatting: e.target.checked 
                    }))}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#7c3aed',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundcolor: '#7c3aed',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ color: '#ffffff' }}>Enhanced Table & Stats Formatting</Typography>
                    <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                      Enhance formatting for tables, status screens, character stats, and structured information commonly found in game system novels
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
                              color: '#7c3aed',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundcolor: '#7c3aed',
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
                              color: '#7c3aed',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundcolor: '#7c3aed',
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
                              color: '#7c3aed',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundcolor: '#7c3aed',
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
                              color: '#7c3aed',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundcolor: '#7c3aed',
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
                              color: '#7c3aed',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundcolor: '#7c3aed',
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
                              color: '#7c3aed',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundcolor: '#7c3aed',
                            },
                          }}
                        />
                      }
                      label="Titles & Ranks"
                    />
                  </Box>
                </Box>

                {/* Info about the extractor */}
                <Box sx={{ p: 2, backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: 2, border: '1px solid rgba(124, 58, 237, 0.3)' }}>
                  <Typography variant="body2" sx={{ color: '#a78bfa' }}>
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
                      color: '#7c3aed',
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
          <Box sx={{ p: 2, backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: 2, border: '1px solid rgba(124, 58, 237, 0.3)' }}>
            <Typography variant="body2" sx={{ color: '#a78bfa' }}>
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
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
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

