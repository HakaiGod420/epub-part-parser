import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as ExtendIcon,
} from '@mui/icons-material';
import { ExtendedDescription } from '../utils/extendedDescriptionService';

interface ViewExtendedDescriptionDialogProps {
  open: boolean;
  onClose: () => void;
  description: ExtendedDescription | null;
}

const ViewExtendedDescriptionDialog: React.FC<ViewExtendedDescriptionDialogProps> = ({
  open,
  onClose,
  description,
}) => {
  if (!description) return null;

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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2d2d2d',
          color: '#ffffff',
        }
      }}
    >
      <DialogTitle sx={{ color: '#ffffff', borderBottom: '1px solid rgba(124, 58, 237, 0.3)' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <ExtendIcon sx={{ color: '#7c3aed' }} />
            <Typography variant="h6">
              {description.term}
            </Typography>
            {description.category && (
              <Chip
                label={description.category}
                size="small"
                sx={{
                  backgroundColor: getCategoryColor(description.category),
                  color: '#ffffff',
                  fontSize: '0.75rem',
                }}
              />
            )}
            {description.gender && (
              <Chip
                label={description.gender}
                size="small"
                sx={{
                  backgroundColor: '#546e7a',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box mb={3}>
          <Typography variant="subtitle2" sx={{ color: '#10b981', mb: 1, fontWeight: 600 }}>
            Short Description
          </Typography>
          <Typography variant="body1" sx={{ color: '#f1f5f9', fontStyle: 'italic', pl: 2 }}>
            {description.shortDescription}
          </Typography>
        </Box>

        <Divider sx={{ my: 2, backgroundColor: 'rgba(124, 58, 237, 0.3)' }} />

        <Box>
          <Typography variant="subtitle2" sx={{ color: '#a78bfa', mb: 1, fontWeight: 600 }}>
            Extended Description
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#f1f5f9', 
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              pl: 2,
            }}
          >
            {description.longDescription}
          </Typography>
        </Box>

        {description.lastUpdated && (
          <Box mt={3}>
            <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic' }}>
              Last updated: {new Date(description.lastUpdated).toLocaleString()}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{
            color: '#10b981',
            '&:hover': {
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewExtendedDescriptionDialog;
