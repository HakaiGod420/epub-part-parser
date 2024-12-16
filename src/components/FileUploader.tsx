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
      <Button variant="contained" component="label" color="primary">
        Choose File
        <input
          type="file"
          accept=".epub"
          hidden
          onChange={handleFileChange}
        />
      </Button>
      <Dialog open={openDialog} onClose={() => handleDialogClose(false)}>
        <DialogTitle>Confirm File Upload</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A file has already been uploaded: {previousFileName}. Do you want to replace it with the new file?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleDialogClose(true)} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUploader;