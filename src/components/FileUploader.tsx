import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper } from "@mui/material";
import './FileUploader.css'; // Import the CSS file

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [previousFileName, setPreviousFileName] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);

  useEffect(() => {
    const storedFileName = localStorage.getItem("uploadedFileName");
    if (storedFileName) {
      setPreviousFileName(storedFileName);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (previousFileName && previousFileName !== file.name) {
        setNewFile(file);
        setOpenDialog(true);
      } else {
        uploadFile(file);
      }
    }
  };

  const uploadFile = (file: File) => {
    localStorage.setItem("uploadedFileName", file.name);
    setUploadedFileName(file.name);
    setPreviousFileName(file.name);
    onFileUpload(file);
  };

  const handleDialogClose = (confirm: boolean) => {
    setOpenDialog(false);
    if (confirm && newFile) {
      uploadFile(newFile);
    }
    setNewFile(null);
  };

  return (
    <Box sx={{ padding: 2, textAlign: "center" }}>
      <Typography variant="h6" gutterBottom>
        Upload EPUB File:
      </Typography>
      {previousFileName && (
        <Paper elevation={3} className="file-info">
          <Typography variant="body1" gutterBottom>
            Previously uploaded file:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {previousFileName}
          </Typography>
        </Paper>
      )}
      {uploadedFileName && (
        <Paper elevation={3} className="file-info">
          <Typography variant="body1" gutterBottom>
            Currently uploaded file:
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {uploadedFileName}
          </Typography>
        </Paper>
      )}
      <Button 
        variant="contained" 
        component="label" 
        sx={{
          backgroundColor: '#4caf50',
          color: '#fff',
          borderRadius: '20px',
          padding: '10px 30px',
          fontSize: '16px',
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#45a049',
          },
        }}
      >
        Choose File
        <input
          id="epub-file-input"
          type="file"
          accept=".epub"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      <Dialog open={openDialog} onClose={() => handleDialogClose(false)}>
        <DialogTitle sx={{ color: '#ffffff' }}>Confirm File Upload</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A file has already been uploaded: {previousFileName}. Do you want to replace it with the new file?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => handleDialogClose(false)}
            variant="outlined"
            sx={{
              color: '#b0b0b0',
              borderColor: '#b0b0b0',
              borderRadius: '20px',
              '&:hover': {
                backgroundColor: 'rgba(176, 176, 176, 0.1)',
                borderColor: '#ffffff',
                color: '#ffffff',
              },
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleDialogClose(true)} 
            autoFocus
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
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUploader;