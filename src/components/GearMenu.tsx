import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import Dictionary from './Dictionary';

const GearMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dictionaryOpen, setDictionaryOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteLocalStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleOpenDictionary = () => {
    setDictionaryOpen(true);
    handleClose();
  };

  const handleCloseDictionary = () => {
    setDictionaryOpen(false);
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
        <MenuItem onClick={handleDeleteLocalStorage}>Delete Local Storage & Restart</MenuItem>
        <MenuItem onClick={handleOpenDictionary}>Open Dictionary</MenuItem>
      </Menu>
      <Dialog open={dictionaryOpen} onClose={handleCloseDictionary} fullWidth maxWidth="md">
        <DialogTitle>Dictionary</DialogTitle>
        <DialogContent>
          <Dictionary />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDictionary} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GearMenu;