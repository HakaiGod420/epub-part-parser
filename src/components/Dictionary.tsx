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
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

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
        } else {
          console.error('Invalid data format in localStorage');
        }
      } catch (error) {
        console.error('Failed to parse localStorage data:', error);
      }
    }
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

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

    let updatedTerms;
    if (editIndex !== null) {
      updatedTerms = [...terms];
      updatedTerms[editIndex] = { term: currentTerm, explanation: currentExplanation };
    } else {
      updatedTerms = [...terms, { term: currentTerm, explanation: currentExplanation }];
    }
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

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom align="center" style={{ fontWeight: 600 }}>
        Dictionary
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
        style={{ borderRadius: '20px', marginBottom: '20px' }}
      >
        Add Term
      </Button>
      <List>
        {terms.map((item, index) => (
          <Card
            key={index}
            style={{
              marginBottom: '15px',
              borderRadius: '15px',
              background: '#f9f9f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 15px',
            }}
          >
            <Box>
              <Typography variant="h6" style={{ fontWeight: 500 }}>
                {item.term}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {item.explanation}
              </Typography>
            </Box>
            <Box>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEdit(index)}
                style={{ marginRight: '10px' }}
              >
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Card>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle style={{ textAlign: 'center', fontWeight: 600 }}>
          {editIndex !== null ? 'Edit Term' : 'Add Term'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Term"
            fullWidth
            value={currentTerm}
            onChange={(e) => setCurrentTerm(e.target.value)}
            style={{ marginBottom: '15px', borderRadius: '10px' }}
          />
          <TextField
            margin="dense"
            label="Explanation"
            fullWidth
            value={currentExplanation}
            onChange={(e) => setCurrentExplanation(e.target.value)}
            multiline
            rows={3}
            style={{ borderRadius: '10px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} style={{ borderRadius: '20px' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            style={{ borderRadius: '20px' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dictionary;
