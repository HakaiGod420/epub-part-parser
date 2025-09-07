import React, { useState, useEffect } from "react";
import FileUploader from "./components/FileUploader";
import ChapterSelector from "./components/ChapterSelector";
import ChapterContent from "./components/ChapterContent";
import ChapterSplitter from "./components/ChapterSplitter";
import TranslationComponent from "./components/TranslationComponent";
import GearMenu from "./components/GearMenu"; // Import GearMenu
import { parseEpub, getChapterContent, getBookTitle } from "./utils/epubParser";
import { stripHtml } from "./utils/stripHtml";
import { Box, Container, Typography, Paper, Alert, IconButton, Collapse } from "@mui/material";
import './App.css'; // Import the CSS file
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const App: React.FC = () => {
  const [chapters, setChapters] = useState<Array<{ label: string; href: string }>>([]);
  const [book, setBook] = useState<any>(null);
  const [chapterContent, setChapterContent] = useState<string>("");
  const [images, setImages] = useState<Uint8Array[]>([]);
  const [epubName, setEpubName] = useState<string>("");
  const [bookTitle, setBookTitle] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string | null | undefined>("");
  const [error, setError] = useState<string | null>(null);

  // Expand/Collapse state for each section
  const [fileUploadExpanded, setFileUploadExpanded] = useState<boolean>(true);
  const [chapterSelectionExpanded, setChapterSelectionExpanded] = useState<boolean>(true);
  const [chapterSplitterExpanded, setChapterSplitterExpanded] = useState<boolean>(true);
  const [chapterContentExpanded, setChapterContentExpanded] = useState<boolean>(true);
  const [translationExpanded, setTranslationExpanded] = useState<boolean>(true);

  const handleFileUpload = async (file: File) => {
    const { book, chapters } = await parseEpub(file);
    setBook(book);
    setChapters(chapters || []);
    setEpubName(file.name); // Set the EPUB name
    const extractedTitle = getBookTitle(book);
    setBookTitle(extractedTitle); // Extract and set the book title
  };

  const handleSelectChapter = async (href: string) => {
    if (book && href) {
      try{
        const content = await getChapterContent(book, href);
        setCurrentTitle(content.title);
        setChapterContent(content.content);
        setImages(content.images);
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

  // Toggle functions for expand/collapse
  const toggleFileUpload = () => setFileUploadExpanded(!fileUploadExpanded);
  const toggleChapterSelection = () => setChapterSelectionExpanded(!chapterSelectionExpanded);
  const toggleChapterSplitter = () => setChapterSplitterExpanded(!chapterSplitterExpanded);
  const toggleChapterContent = () => setChapterContentExpanded(!chapterContentExpanded);
  const toggleTranslation = () => setTranslationExpanded(!translationExpanded);

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
          backgroundColor: 'error.dark',
          color: 'error.contrastText',
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
        boxShadow: 3
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
        EPUB Content Splitter
      </Typography>
      {bookTitle && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontStyle: 'italic',
            marginTop: 1
          }}
        >
          Book: {bookTitle}
        </Typography>
      )}
      <GearMenu bookTitle={bookTitle} />
    </Box>

    {/* Main Content */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* File Upload Section */}
      <Paper elevation={2} sx={{ 
        borderRadius: 3,
        backgroundColor: 'background.paper',
        boxShadow: 3
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: 2,
          borderBottom: fileUploadExpanded ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            File Upload
          </Typography>
          <IconButton 
            onClick={toggleFileUpload}
            sx={{ 
              color: 'primary.main',
              '&:hover': { backgroundColor: 'rgba(144, 202, 249, 0.08)' }
            }}
          >
            {fileUploadExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Collapse in={fileUploadExpanded}>
          <Box sx={{ padding: 3 }}>
            <FileUploader onFileUpload={handleFileUpload} />
          </Box>
        </Collapse>
      </Paper>

      {/* Chapter Selection */}
      {chapters.length > 0 && (
        <Paper elevation={2} sx={{ 
          borderRadius: 3,
          backgroundColor: 'background.paper',
          boxShadow: 3
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: 2,
            borderBottom: chapterSelectionExpanded ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Chapter Selection
            </Typography>
            <IconButton 
              onClick={toggleChapterSelection}
              sx={{ 
                color: 'primary.main',
                '&:hover': { backgroundColor: 'rgba(144, 202, 249, 0.08)' }
              }}
            >
              {chapterSelectionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={chapterSelectionExpanded}>
            <Box sx={{ padding: 3 }}>
              <ChapterSelector 
                chapters={chapters} 
                onSelectChapter={handleSelectChapter} 
                epubName={epubName} 
              />
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Chapter Processing */}
      {chapterContent && (
        <>
          <Paper elevation={2} sx={{ 
            borderRadius: 3,
            backgroundColor: 'background.paper',
            boxShadow: 3
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: 2,
              borderBottom: chapterSplitterExpanded ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Chapter Splitter
              </Typography>
              <IconButton 
                onClick={toggleChapterSplitter}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(144, 202, 249, 0.08)' }
                }}
              >
                {chapterSplitterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={chapterSplitterExpanded}>
              <Box sx={{ padding: 3 }}>
                <ChapterSplitter 
                  content={stripHtml(chapterContent).replace(currentTitle ?? "", "").trim()} 
                  chapterTitle={currentTitle || undefined}
                  bookTitle={bookTitle}
                />
              </Box>
            </Collapse>
          </Paper>

          <Paper elevation={2} sx={{ 
            borderRadius: 3,
            backgroundColor: 'background.paper',
            boxShadow: 3,
            '& pre': { 
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: 2,
              borderBottom: chapterContentExpanded ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Chapter Content
              </Typography>
              <IconButton 
                onClick={toggleChapterContent}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(144, 202, 249, 0.08)' }
                }}
              >
                {chapterContentExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={chapterContentExpanded}>
              <Box sx={{ padding: 3 }}>
                <ChapterContent 
                  content={chapterContent} 
                  images={images} 
                  chapterTitle={currentTitle || undefined}
                />
              </Box>
            </Collapse>
          </Paper>

          {/* Translation Section - Separate from Chapter Content */}
          <Paper elevation={2} sx={{ 
            borderRadius: 3,
            backgroundColor: 'background.paper',
            boxShadow: 3,
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: 2,
              borderBottom: translationExpanded ? '1px solid rgba(255, 255, 255, 0.12)' : 'none'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Translation
              </Typography>
              <IconButton 
                onClick={toggleTranslation}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(144, 202, 249, 0.08)' }
                }}
              >
                {translationExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Collapse in={translationExpanded}>
              <Box sx={{ padding: 3 }}>
                <TranslationComponent 
                  text={stripHtml(chapterContent)} 
                  chapterTitle={currentTitle || undefined}
                  bookTitle={bookTitle}
                />
              </Box>
            </Collapse>
          </Paper>
        </>
      )}
    </Box>
  </Container>
  );
};

export default App;