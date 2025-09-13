import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Dictionary from './Dictionary';
import SettingsDialog from './SettingsDialog';
import StorageCleanupModal from './StorageCleanupModal';

interface GearMenuProps {
  bookTitle?: string;
}

const GearMenu: React.FC<GearMenuProps> = ({ bookTitle = "" }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [storageCleanupOpen, setStorageCleanupOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenStorageCleanup = () => {
    setStorageCleanupOpen(true);
    handleClose();
  };

  const handleCloseStorageCleanup = () => {
    setStorageCleanupOpen(false);
  };

  const handleOpenDictionary = () => {
    setDictionaryOpen(true);
    handleClose();
  };

  const handleCloseDictionary = () => {
    setDictionaryOpen(false);
  };

  const handleOpenSettings = () => {
    setSettingsOpen(true);
    handleClose();
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <SettingsIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleOpenSettings}>Translation Settings</MenuItem>
        <MenuItem onClick={handleOpenDictionary}>Open Dictionary</MenuItem>
        <MenuItem onClick={handleOpenStorageCleanup}>Clear Local Storage</MenuItem>
      </Menu>
      <Dialog open={dictionaryOpen} onClose={handleCloseDictionary} fullWidth maxWidth="md">
        <DialogTitle sx={{ color: '#ffffff' }}>Dictionary</DialogTitle>
        <DialogContent>
          <Dictionary bookTitle={bookTitle} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDictionary} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <SettingsDialog open={settingsOpen} onClose={handleCloseSettings} />
      <StorageCleanupModal open={storageCleanupOpen} onClose={handleCloseStorageCleanup} />
    </>
  );
};

export default GearMenu;