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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  UploadFile as UploadIcon,
} from '@mui/icons-material';
import { dictionaryEventManager } from '../utils/dictionaryEventManager';

interface DictionaryProps {
  bookTitle?: string;
}

const Dictionary: React.FC<DictionaryProps> = ({ bookTitle = "" }) => {
  const [terms, setTerms] = useState<{ term: string; explanation: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [currentTerm, setCurrentTerm] = useState('');
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

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

  // Open dialog
  const handleClickOpen = () => setOpen(true);

  // Close dialog and reset fields
  const handleClose = () => {
    setOpen(false);
    setCurrentTerm('');
    setCurrentExplanation('');
    setEditIndex(null);
  };

  // Save or edit term
  const handleSave = () => {
    if (!currentTerm.trim() || !currentExplanation.trim()) {
      alert('Both fields are required.');
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
    dictionaryEventManager.notifyUpdate(); // Notify other components
    handleClose();
  };

  // Edit existing term
  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentTerm(terms[index].term);
    setCurrentExplanation(terms[index].explanation);
    setOpen(true);
  };

  // Delete term
  const handleDelete = (index: number) => {
    const updatedTerms = terms.filter((_, i) => i !== index);
    setTerms(updatedTerms);
    localStorage.setItem('dictionaryTerms', JSON.stringify(updatedTerms));
    dictionaryEventManager.notifyUpdate(); // Notify other components
  };

  // Export terms as a JSON file
  const handleExport = () => {
    const dataStr = JSON.stringify(terms, null, 2);
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
          const importedTerms = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedTerms)) {
            setTerms(importedTerms);
            localStorage.setItem('dictionaryTerms', JSON.stringify(importedTerms));
            dictionaryEventManager.notifyUpdate(); // Notify other components
          } else {
            alert('Invalid file format.');
          }
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
            backgroundColor: '#4caf50',
            color: '#fff',
            borderRadius: '20px',
            '&:hover': {
              backgroundColor: '#45a049',
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
            borderColor: '#4caf50',
            color: '#4caf50',
            borderRadius: '20px',
            '&:hover': {
              borderColor: '#45a049',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
              borderColor: '#666',
              color: '#fff',
              borderRadius: '20px',
              '&:hover': {
                borderColor: '#888',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            Import
          </Button>
        </label>
      </Box>

      {/* List of Terms */}
      <List sx={{ bgcolor: 'background.paper', borderRadius: '8px', boxShadow: 1 }}>
        {terms.map((item, index) => (
          <ListItem
            key={index}
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '&:last-child': { borderBottom: 0 },
            }}
            secondaryAction={
              <Box>
                <IconButton edge="end" onClick={() => handleEdit(index)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={item.term}
              secondary={item.explanation}
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItem>
        ))}
      </List>

      {/* Add/Edit Term Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth>
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
            label="Explanation"
            fullWidth
            multiline
            rows={3}
            value={currentExplanation}
            onChange={(e) => setCurrentExplanation(e.target.value)}
          />
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
              backgroundColor: '#4caf50',
              color: '#fff',
              borderRadius: '20px',
              '&:hover': {
                backgroundColor: '#45a049',
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
