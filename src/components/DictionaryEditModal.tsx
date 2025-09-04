import React, { useState, useEffect } from 'react';
 import { TextField, Button } from '@mui/material';
 import Dialog from '@mui/material/Dialog';
 import DialogActions from '@mui/material/DialogActions';
 import DialogContent from '@mui/material/DialogContent';
 import DialogTitle from '@mui/material/DialogTitle';
 
 interface DictionaryEditModalProps {
   open: boolean;
   handleClose: () => void;
   term: { term: string; explanation: string };
   onSave: (term: string, explanation: string) => void;
 }
 
 export const DictionaryEditModal: React.FC<DictionaryEditModalProps> = ({ open, handleClose, term, onSave }) => {
     const [editedTerm, setEditedTerm] = useState(term.term);
     const [editedExplanation, setEditedExplanation] = useState(term.explanation);
     const [prevOpen, setPrevOpen] = useState(false);
   
     // Reset only when opening with new term data
     useEffect(() => {
       if (open && !prevOpen) {
         setEditedTerm(term.term);
         setEditedExplanation(term.explanation);
       }
       setPrevOpen(open);
     }, [open, term.term, term.explanation]); // Track values, not object reference
   
     const handleSave = () => {
       onSave(editedTerm, editedExplanation);
       handleClose();
     };
   return (
     <Dialog open={open} onClose={handleClose}>
       <DialogTitle>Edit Dictionary Term</DialogTitle>
       <DialogContent>
         <TextField
           autoFocus
           margin="dense"
           label="Term"
           fullWidth
           value={editedTerm}
           onChange={(e) => setEditedTerm(e.target.value)}
         />
         <TextField
           margin="dense"
           label="Explanation"
           fullWidth
           multiline
           rows={4}
           value={editedExplanation}
           onChange={(e) => setEditedExplanation(e.target.value)}
         />
       </DialogContent>
       <DialogActions>
         <Button 
           onClick={handleClose}
           sx={{
             color: '#666',
             '&:hover': {
               backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
   );
 };