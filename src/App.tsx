import React, { useState, useEffect } from "react";
import FileUploader from "./components/FileUploader";
import ChapterSelector from "./components/ChapterSelector";
import ChapterContent from "./components/ChapterContent";
import ChapterSplitter from "./components/ChapterSplitter";
import GearMenu from "./components/GearMenu"; // Import GearMenu
import { parseEpub, getChapterContent } from "./utils/epubParser";
import { stripHtml } from "./utils/stripHtml";
import { Box, Container, Typography, Paper, Divider, Alert, IconButton } from "@mui/material";
import './App.css'; // Import the CSS file
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon

const App: React.FC = () => {
  const [chapters, setChapters] = useState<Array<{ label: string; href: string }>>([]);
  const [book, setBook] = useState<any>(null);
  const [chapterContent, setChapterContent] = useState<string>("");
  const [epubName, setEpubName] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string | null | undefined>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    const { book, chapters } = await parseEpub(file);
    setBook(book);
    setChapters(chapters || []);
    setEpubName(file.name); // Set the EPUB name
  };

  const handleSelectChapter = async (href: string) => {
    if (book && href) {
      try{
        const content = await getChapterContent(book, href);
        setCurrentTitle(content.title);
        setChapterContent(content.content);
      }
      catch (error){
        console.error("Failed to load chapter content:", error);
        setError("Failed to load chapter content.");
      }
    }
  };

  const handleCloseError = () => {
    setError(null);
  }

  useEffect(() => {
    const selectedChapter = localStorage.getItem("selectedChapter");
    if (selectedChapter && book) {
      handleSelectChapter(selectedChapter).catch((error) => {
        console.error("Failed to load chapter content:", error);
      });
    }
  }, [book]);

  return (
    <Container maxWidth="md" className="container" sx={{ position: 'relative', marginTop: 4 }}>
    {/* Improved Alert */}
    {error && (
      <Alert
        severity="error"
        onClose={handleCloseError}
        sx={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: 600,
          zIndex: 1300,
          boxShadow: 3,
          borderRadius: 1,
          borderLeft: '4px solid',
          borderColor: 'error.main',
          '& .MuiAlert-message': {
            flex: 1,
            paddingRight: 1,
          },
        }}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseError}
            sx={{ alignSelf: 'flex-start' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Typography variant="body2" fontWeight="medium">
          {error}
        </Typography>
      </Alert>
    )}

    {/* Header Section */}
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center"
      sx={{ 
        mb: 4,
        padding: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}
    >
      <Typography 
        variant="h4" 
        component="h1"
        sx={{ 
          fontWeight: 700,
          letterSpacing: '-0.5px',
          color: 'primary.main'
        }}
      >
        EPUB Reader
      </Typography>
      <GearMenu />
    </Box>

    {/* Main Content */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* File Upload Section */}
      <Paper elevation={0} sx={{ 
        padding: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.default'
      }}>
        <FileUploader onFileUpload={handleFileUpload} />
      </Paper>

      {/* Chapter Selection */}
      {chapters.length > 0 && (
        <Paper elevation={0} sx={{ 
          padding: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <ChapterSelector 
            chapters={chapters} 
            onSelectChapter={handleSelectChapter} 
            epubName={epubName} 
          />
        </Paper>
      )}

      {/* Chapter Processing */}
      {chapterContent && (
        <>
          <Paper elevation={0} sx={{ 
            padding: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <ChapterSplitter 
              content={stripHtml(chapterContent).replace(currentTitle ?? "", "").trim()} 
            />
          </Paper>

          <Paper elevation={0} sx={{ 
            padding: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            '& pre': { 
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }
          }}>
            <ChapterContent content={chapterContent} />
          </Paper>
        </>
      )}
    </Box>
  </Container>
  );
};

export default App;