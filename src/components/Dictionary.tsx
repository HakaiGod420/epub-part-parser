import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  Collapse,
  Paper,
  Divider,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  UploadFile as UploadIcon,
  AutoAwesome as ExtendIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { dictionaryEventManager } from '../utils/dictionaryEventManager';
import { extendedDescriptionService, ExtendedDescription } from '../utils/extendedDescriptionService';

interface DictionaryProps {
  bookTitle?: string;
}

const Dictionary: React.FC<DictionaryProps> = ({ bookTitle = "" }) => {
  const [terms, setTerms] = useState<{ term: string; explanation: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [currentTerm, setCurrentTerm] = useState('');
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [currentLongDescription, setCurrentLongDescription] = useState('');
  const [currentGender, setCurrentGender] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadTerms = () => {
      const terms = dictionaryEventManager.getTerms();
      setTerms(terms);
    };

    // Load initial terms
    loadTerms();

    // Subscribe to dictionary updates
    const unsubscribe = dictionaryEventManager.subscribe(loadTerms);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Open dialog for adding new term
  const handleClickOpen = () => {
    setEditIndex(null);
    setCurrentTerm('');
    setCurrentExplanation('');
    setCurrentLongDescription('');
    setCurrentGender('');
    setOpen(true);
  };

  // Close dialog and reset fields
  const handleClose = () => {
    setOpen(false);
    setCurrentTerm('');
    setCurrentExplanation('');
    setCurrentLongDescription('');
    setCurrentGender('');
    setEditIndex(null);
  };

  // Save or edit term
  const handleSave = () => {
    if (!currentTerm.trim() || !currentExplanation.trim()) {
      alert('Term and short explanation are required.');
      return;
    }

    const updatedTerms =
      editIndex !== null
        ? terms.map((term, index) =>
            index === editIndex ? { term: currentTerm, explanation: currentExplanation } : term
          )
        : [...terms, { term: currentTerm, explanation: currentExplanation }];

    setTerms(updatedTerms);
    localStorage.setItem('dictionaryTerms', JSON.stringify(updatedTerms));
    
    // Save extended description if provided
    if (currentLongDescription.trim()) {
      const extendedDesc: ExtendedDescription = {
        term: currentTerm,
        shortDescription: currentExplanation,
        longDescription: currentLongDescription,
        category: 'Other',
        gender: currentGender || undefined,
        lastUpdated: Date.now(),
      };
      extendedDescriptionService.saveExtendedDescription(extendedDesc);
    } else if (editIndex !== null) {
      // If editing and long description is empty, delete extended description
      extendedDescriptionService.deleteExtendedDescription(currentTerm);
    }
    
    dictionaryEventManager.notifyUpdate(); // Notify other components
    handleClose();
  };

  // Edit existing term
  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentTerm(terms[index].term);
    setCurrentExplanation(terms[index].explanation);
    
    // Load extended description if exists
    const extended = getExtendedDescription(terms[index].term);
    if (extended) {
      setCurrentLongDescription(extended.longDescription);
      setCurrentGender(extended.gender || '');
    } else {
      setCurrentLongDescription('');
      setCurrentGender('');
    }
    
    setOpen(true);
  };

  // Delete term
  const handleDelete = (index: number) => {
    const termToDelete = terms[index];
    const updatedTerms = terms.filter((_, i) => i !== index);
    setTerms(updatedTerms);
    localStorage.setItem('dictionaryTerms', JSON.stringify(updatedTerms));
    
    // Also delete extended description if it exists
    extendedDescriptionService.deleteExtendedDescription(termToDelete.term);
    
    dictionaryEventManager.notifyUpdate(); // Notify other components
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

  const getExtendedDescription = (termName: string): ExtendedDescription | null => {
    return extendedDescriptionService.getExtendedDescription(termName);
  };

  // Export terms as a JSON file
  const handleExport = () => {
    // Include both dictionary terms and extended descriptions
    const extendedDescs = extendedDescriptionService.getExtendedDescriptions();
    const exportData = {
      terms,
      extendedDescriptions: Object.fromEntries(extendedDescs),
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Create filename with book title
    const sanitizedTitle = bookTitle.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim() || 'UnknownBook';
    a.download = `${sanitizedTitle}_Dictionary.json`;
    
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import terms from a JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          // Handle both old format (just array) and new format (object with terms and extended)
          if (Array.isArray(importedData)) {
            // Old format
            setTerms(importedData);
            localStorage.setItem('dictionaryTerms', JSON.stringify(importedData));
          } else if (importedData.terms && Array.isArray(importedData.terms)) {
            // New format with extended descriptions
            setTerms(importedData.terms);
            localStorage.setItem('dictionaryTerms', JSON.stringify(importedData.terms));
            
            // Import extended descriptions if present
            if (importedData.extendedDescriptions) {
              localStorage.setItem('extendedDescriptions', JSON.stringify(importedData.extendedDescriptions));
            }
          } else {
            alert('Invalid file format.');
            return;
          }
          
          dictionaryEventManager.notifyUpdate(); // Notify other components
        } catch {
          alert('Failed to read file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Dictionary
      </Typography>

      {/* Add, Export, and Import Buttons */}
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleClickOpen}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: '#fff',
            borderRadius: '12px',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            },
          }}
        >
          Add Term
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<SaveIcon />} 
          onClick={handleExport}
          sx={{
            borderColor: '#7c3aed',
            color: '#7c3aed',
            borderRadius: '12px',
            '&:hover': {
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
            },
          }}
        >
          Export
        </Button>
        <label htmlFor="file-upload" style={{ display: 'inline-block' }}>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <Button 
            variant="outlined" 
            startIcon={<UploadIcon />} 
            component="span"
            sx={{
              borderColor: 'rgba(124, 58, 237, 0.3)',
              color: '#a78bfa',
              borderRadius: '12px',
              '&:hover': {
                borderColor: 'rgba(124, 58, 237, 0.5)',
                backgroundColor: 'rgba(124, 58, 237, 0.08)',
              },
            }}
          >
            Import
          </Button>
        </label>
      </Box>

      {/* List of Terms */}
      <List sx={{ bgcolor: 'background.paper', borderRadius: '8px', boxShadow: 1 }}>
        {terms.map((item, index) => {
          const isExpanded = expandedTerms.has(item.term);
          const extendedDesc = getExtendedDescription(item.term);
          
          return (
            <React.Fragment key={index}>
              <ListItem
                sx={{
                  borderBottom: '1px solid #e0e0e0',
                  '&:last-child': { borderBottom: 0 },
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }}
              >
                {/* Main term content */}
                <Box display="flex" alignItems="flex-start" width="100%">
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography sx={{ fontWeight: 500 }}>
                          {item.term}
                        </Typography>
                        {extendedDesc && (
                          <Chip
                            label="Extended"
                            size="small"
                            sx={{
                              backgroundColor: '#7c3aed',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              height: '20px',
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={item.explanation}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Box display="flex" gap={0.5}>
                    {extendedDesc && (
                      <IconButton 
                        edge="end" 
                        onClick={() => toggleTermExpansion(item.term)}
                        sx={{
                          color: '#7c3aed',
                          '&:hover': {
                            backgroundColor: 'rgba(124, 58, 237, 0.1)',
                          },
                        }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )}
                    <IconButton edge="end" onClick={() => handleEdit(index)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Extended Description Panel */}
                {extendedDesc && (
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
                        <Typography variant="subtitle2" sx={{ color: '#7c3aed', fontWeight: 600 }}>
                          Extended Description
                        </Typography>
                        {extendedDesc.gender && (
                          <Chip
                            label={extendedDesc.gender}
                            size="small"
                            sx={{
                              backgroundColor: '#546e7a',
                              color: '#ffffff',
                              fontSize: '0.7rem',
                              height: '20px',
                            }}
                          />
                        )}
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#1e293b',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          mb: 1,
                        }}
                      >
                        {extendedDesc.longDescription}
                      </Typography>
                      
                      <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic' }}>
                        Last updated: {new Date(extendedDesc.lastUpdated).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Collapse>
                )}
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>

      {/* Add/Edit Term Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: '#ffffff' }}>{editIndex !== null ? 'Edit Term' : 'Add Term'}</DialogTitle>
        <DialogContent>
          <TextField
            id="dictionary-term"
            autoFocus
            margin="dense"
            label="Term"
            fullWidth
            value={currentTerm}
            onChange={(e) => setCurrentTerm(e.target.value)}
          />
          <TextField
            id="dictionary-explanation"
            margin="dense"
            label="Short Explanation (for translation)"
            fullWidth
            multiline
            rows={2}
            value={currentExplanation}
            onChange={(e) => setCurrentExplanation(e.target.value)}
            helperText="Brief 1-sentence description (required)"
          />
          
          <Divider sx={{ my: 2 }}>
            <Chip label="Extended Description (Optional)" size="small" sx={{ backgroundColor: '#7c3aed', color: '#fff' }} />
          </Divider>
          
          <TextField
            select
            margin="dense"
            label="Gender (for characters)"
            fullWidth
            value={currentGender}
            onChange={(e) => setCurrentGender(e.target.value)}
            helperText="Optional: Specify gender for character terms"
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          
          <TextField
            id="dictionary-long-description"
            margin="dense"
            label="Extended Description"
            fullWidth
            multiline
            rows={6}
            value={currentLongDescription}
            onChange={(e) => setCurrentLongDescription(e.target.value)}
            helperText="Detailed description for creative reference (stored locally, not used in translation)"
            placeholder="Enter a detailed 1-10 sentence description with rich context, appearance, personality, etc."
          />
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              Extended descriptions are stored locally for your reference and never transmitted during translation.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClose}
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
              color: '#fff',
              borderRadius: '12px',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dictionary;
