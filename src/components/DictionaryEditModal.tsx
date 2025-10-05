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
       <DialogTitle sx={{ color: '#ffffff' }}>Edit Dictionary Term</DialogTitle>
       <DialogContent>
         <TextField
           id="edit-term"
           autoFocus
           margin="dense"
           label="Term"
           fullWidth
           value={editedTerm}
           onChange={(e) => setEditedTerm(e.target.value)}
         />
         <TextField
           id="edit-explanation"
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
   );
 };