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
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Save as SaveIcon, UploadFile as UploadIcon } from '@mui/icons-material';

const Dictionary = () => {
  const [terms, setTerms] = useState<{ term: string; explanation: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [currentTerm, setCurrentTerm] = useState('');
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    const storedTerms = localStorage.getItem('dictionaryTerms');
    if (storedTerms) {
      try {
        const parsedTerms = JSON.parse(storedTerms);
        if (Array.isArray(parsedTerms)) {
          setTerms(parsedTerms);
        }
      } catch (error) {
        console.error('Failed to parse localStorage data:', error);
      }
    }
  }, []);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    setCurrentTerm('');
    setCurrentExplanation('');
    setEditIndex(null);
  };

  const handleSave = () => {
    if (!currentTerm.trim() || !currentExplanation.trim()) {
      alert('Both fields are required.');
      return;
    }

    const updatedTerms = editIndex !== null
      ? terms.map((term, index) => index === editIndex ? { term: currentTerm, explanation: currentExplanation } : term)
      : [...terms, { term: currentTerm, explanation: currentExplanation }];

    setTerms(updatedTerms);
    localStorage.setItem('dictionaryTerms', JSON.stringify(updatedTerms));
    handleClose();
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setCurrentTerm(terms[index].term);
    setCurrentExplanation(terms[index].explanation);
    setOpen(true);
  };

  const handleDelete = (index: number) => {
    const updatedTerms = terms.filter((_, i) => i !== index);
    setTerms(updatedTerms);
    localStorage.setItem('dictionaryTerms', JSON.stringify(updatedTerms));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(terms, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dictionaryTerms.json';
    a.click();
    URL.revokeObjectURL(url);
  };

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
      <Box display="flex" justifyContent="space-between" marginBottom={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleClickOpen}>
          Add Term
        </Button>
        <Button variant="outlined" startIcon={<SaveIcon />} onClick={handleExport}>
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
          <Button variant="outlined" startIcon={<UploadIcon />} component="span">
            Import
          </Button>
        </label>
      </Box>
      <List sx={{ bgcolor: 'background.paper', borderRadius: '8px', boxShadow: 1 }}>
        {terms.map((item, index) => (
          <ListItem
            key={index}
            sx={{ borderBottom: '1px solid #e0e0e0', '&:last-child': { borderBottom: 0 } }}
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

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{editIndex !== null ? 'Edit Term' : 'Add Term'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Term"
            fullWidth
            value={currentTerm}
            onChange={(e) => setCurrentTerm(e.target.value)}
          />
          <TextField
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dictionary;
