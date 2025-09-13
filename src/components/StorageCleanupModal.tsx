import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
  Alert,
} from '@mui/material';
import {
  DeleteSweep as DeleteSweepIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface StorageItem {
  key: string;
  label: string;
  description: string;
  size?: string;
}

interface StorageCleanupModalProps {
  open: boolean;
  onClose: () => void;
}

const STORAGE_DEFINITIONS: StorageItem[] = [
  {
    key: 'dictionaryTerms',
    label: 'Dictionary Terms',
    description: 'Your custom dictionary with saved terms and translations'
  },
  {
    key: 'dictionaryExtractorSettings',
    label: 'Dictionary Extractor Settings',
    description: 'Settings for automatic term extraction (API key, model, extraction preferences)'
  },
  {
    key: 'translationSettings',
    label: 'Translation Settings',
    description: 'Translation service settings (API key, model, system instructions)'
  },
  {
    key: 'translationContextSettings',
    label: 'Translation Context Settings',
    description: 'Settings for what context to include with translations'
  },
  {
    key: 'translationModalSettings',
    label: 'Translation Modal Settings',
    description: 'Modal dialog preferences for translation interface'
  },
  {
    key: 'optionalTexts',
    label: 'Optional Text Content',
    description: 'Additional text content stored for chapters'
  },
  {
    key: 'optionalTextToggles',
    label: 'Optional Text Toggle States',
    description: 'Visibility settings for optional text elements'
  },
  {
    key: 'uploadedFileName',
    label: 'Uploaded File Name',
    description: 'Name of the last uploaded EPUB file'
  }
];

const StorageCleanupModal: React.FC<StorageCleanupModalProps> = ({ open, onClose }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);

  useEffect(() => {
    if (open) {
      // Check which items actually exist in localStorage and get their sizes
      const existingItems = STORAGE_DEFINITIONS.filter(item => {
        const value = localStorage.getItem(item.key);
        return value !== null;
      }).map(item => {
        const value = localStorage.getItem(item.key);
        const sizeInBytes = value ? new Blob([value]).size : 0;
        const sizeFormatted = formatBytes(sizeInBytes);
        
        return {
          ...item,
          size: sizeFormatted
        };
      });
      
      setStorageItems(existingItems);
      setSelectedItems(new Set()); // Reset selection when modal opens
    }
  }, [open]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleItemToggle = (key: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === storageItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(storageItems.map(item => item.key)));
    }
  };

  const handleCancel = () => {
    setSelectedItems(new Set());
    onClose();
  };

  const handleConfirm = () => {
    // Delete selected items from localStorage
    selectedItems.forEach(key => {
      localStorage.removeItem(key);
    });

    // Close modal
    onClose();

    // Refresh the page
    window.location.reload();
  };

  const getTotalSize = (): string => {
    const totalBytes = storageItems
      .filter(item => selectedItems.has(item.key))
      .reduce((total, item) => {
        const value = localStorage.getItem(item.key);
        return total + (value ? new Blob([value]).size : 0);
      }, 0);
    
    return formatBytes(totalBytes);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2d2d2d',
          color: '#ffffff',
        }
      }}
    >
      <DialogTitle sx={{ color: '#ffffff', borderBottom: '1px solid #444' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <DeleteSweepIcon sx={{ color: '#f44336' }} />
          Clear Local Storage
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Warning Alert */}
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid #ff9800',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ff9800'
              }
            }}
          >
            <Typography variant="body2">
              <strong>Warning:</strong> This action cannot be undone. Selected data will be permanently deleted and the page will refresh.
            </Typography>
          </Alert>

          {/* Storage Items List */}
          {storageItems.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="#b0b0b0">
                No stored data found in local storage.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Select All Checkbox */}
              <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedItems.size === storageItems.length && storageItems.length > 0}
                      indeterminate={selectedItems.size > 0 && selectedItems.size < storageItems.length}
                      onChange={handleSelectAll}
                      sx={{
                        color: '#b0b0b0',
                        '&.Mui-checked': {
                          color: '#f44336',
                        },
                        '&.MuiCheckbox-indeterminate': {
                          color: '#f44336',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body1" fontWeight="bold">
                      Select All ({storageItems.length} items)
                    </Typography>
                  }
                />
              </Box>

              <Divider sx={{ backgroundColor: '#444' }} />

              {/* Individual Items */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {storageItems.map((item) => (
                  <Box key={item.key} sx={{ p: 2, backgroundColor: '#333', borderRadius: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedItems.has(item.key)}
                          onChange={() => handleItemToggle(item.key)}
                          sx={{
                            color: '#b0b0b0',
                            '&.Mui-checked': {
                              color: '#f44336',
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {item.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#4caf50' }}>
                              {item.size}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#b0b0b0', mt: 0.5 }}>
                            {item.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', margin: 0 }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Selection Summary */}
              {selectedItems.size > 0 && (
                <>
                  <Divider sx={{ backgroundColor: '#444' }} />
                  <Box sx={{ p: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 1, border: '1px solid #f44336' }}>
                    <Typography variant="body2" sx={{ color: '#ffffff' }}>
                      <strong>{selectedItems.size}</strong> item{selectedItems.size !== 1 ? 's' : ''} selected 
                      ({getTotalSize()}) will be permanently deleted.
                    </Typography>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: '1px solid #444', px: 3, py: 2 }}>
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
          onClick={handleConfirm}
          disabled={selectedItems.size === 0}
          variant="contained"
          sx={{
            backgroundColor: selectedItems.size > 0 ? '#f44336' : '#555',
            color: selectedItems.size > 0 ? '#ffffff' : '#999',
            '&:hover': {
              backgroundColor: selectedItems.size > 0 ? '#d32f2f' : '#555',
            },
            '&:disabled': {
              backgroundColor: '#555',
              color: '#999',
            },
          }}
        >
          Delete Selected ({selectedItems.size})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StorageCleanupModal;