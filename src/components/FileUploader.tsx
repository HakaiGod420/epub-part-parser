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
      <Typography variant="body1" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
        Select an EPUB file to begin
      </Typography>
      {previousFileName && (
        <Paper 
          elevation={0} 
          className="file-info"
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 3,
            backgroundColor: 'rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }}
        >
          <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary' }}>
            📁 Previously uploaded:
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.light', fontWeight: 500 }}>
            {previousFileName}
          </Typography>
        </Paper>
      )}
      {uploadedFileName && (
        <Paper 
          elevation={0} 
          className="file-info"
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
          }}
        >
          <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
            ✅ Currently uploaded:
          </Typography>
          <Typography variant="body1" sx={{ color: 'primary.light', fontWeight: 600, mt: 1 }}>
            {uploadedFileName}
          </Typography>
        </Paper>
      )}
      <Button 
        variant="contained" 
        component="label" 
        sx={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
          color: '#fff',
          borderRadius: '12px',
          padding: '12px 40px',
          fontSize: '16px',
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 24px rgba(124, 58, 237, 0.5)',
          },
        }}
      >
        📂 Choose EPUB File
        <input
          id="epub-file-input"
          type="file"
          accept=".epub"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      <Dialog 
        open={openDialog} 
        onClose={() => handleDialogClose(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'text.primary',
          fontWeight: 700,
          borderBottom: '1px solid rgba(124, 58, 237, 0.15)',
        }}>
          ⚠️ Confirm File Upload
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            A file has already been uploaded: <strong style={{ color: '#a78bfa' }}>{previousFileName}</strong>. 
            Do you want to replace it with the new file?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={() => handleDialogClose(false)}
            variant="outlined"
            sx={{
              color: 'text.secondary',
              borderColor: 'rgba(148, 163, 184, 0.3)',
              borderRadius: '10px',
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                borderColor: 'rgba(148, 163, 184, 0.5)',
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
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              color: '#fff',
              borderRadius: '10px',
              px: 3,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)',
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