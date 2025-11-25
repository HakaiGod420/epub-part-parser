import React, { useState, useEffect, useCallback } from "react";
import FileUploader from "./components/FileUploader";
import ChapterSelector from "./components/ChapterSelector";
import ChapterContent from "./components/ChapterContent";
import ChapterSplitter from "./components/ChapterSplitter";
import TranslationComponent from "./components/TranslationComponent";
import GearMenu from "./components/GearMenu"; // Import GearMenu
import { parseEpub, getChapterContent, getBookTitle } from "./utils/epubParser";
import { stripHtml } from "./utils/stripHtml";
import { Box, Container, Typography, Paper, Alert, IconButton, Collapse, Chip } from "@mui/material";
import './App.css'; // Import the CSS file
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [chapters, setChapters] = useState<Array<{ label: string; href: string }>>([]);
  const [book, setBook] = useState<any>(null);
  const [chapterContent, setChapterContent] = useState<string>("");
  const [images, setImages] = useState<Uint8Array[]>([]);
  const [epubName, setEpubName] = useState<string>("");
  const [bookTitle, setBookTitle] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string | null | undefined>("");
  const [error, setError] = useState<string | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(-1);

  // Expand/Collapse state for each section
  const [fileUploadExpanded, setFileUploadExpanded] = useState<boolean>(true);
  const [chapterSelectionExpanded, setChapterSelectionExpanded] = useState<boolean>(false);
  const [chapterSplitterExpanded, setChapterSplitterExpanded] = useState<boolean>(false);
  const [chapterContentExpanded, setChapterContentExpanded] = useState<boolean>(false);
  const [translationExpanded, setTranslationExpanded] = useState<boolean>(true);

  const handleFileUpload = async (file: File) => {
    const { book, chapters } = await parseEpub(file);
    setBook(book);
    setChapters(chapters || []);
    setEpubName(file.name); // Set the EPUB name
    const extractedTitle = getBookTitle(book);
    setBookTitle(extractedTitle); // Extract and set the book title
  };

  const handleSelectChapter = useCallback(async (href: string) => {
    if (book && href) {
      try{
        const content = await getChapterContent(book, href);
        setCurrentTitle(content.title);
        setChapterContent(content.content);
        setImages(content.images);
        
        // Update current chapter index
        const chapterIndex = chapters.findIndex(chapter => chapter.href === href);
        setCurrentChapterIndex(chapterIndex);
        
        // Save selected chapter to localStorage (using same format as ChapterSelector)
        localStorage.setItem(`${epubName}-selectedChapter`, href);
        
        // Update opened chapters list (sync with ChapterSelector)
        try {
          const storedChapters = localStorage.getItem(`${epubName}-openedChapters`);
          const openedChapters = storedChapters ? JSON.parse(storedChapters) : [];
          if (!openedChapters.includes(href)) {
            const newOpenedChapters = [...openedChapters, href];
            localStorage.setItem(`${epubName}-openedChapters`, JSON.stringify(newOpenedChapters));
          }
        } catch (err) {
          console.error("Error updating opened chapters:", err);
        }
      }
      catch (error){
        console.error("Failed to load chapter content:", error);
        setError("Failed to load chapter content.");
      }
    }
  }, [book, chapters, epubName]);

  const handleCloseError = () => {
    setError(null);
  }

  // Chapter navigation functions
  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      const previousChapter = chapters[currentChapterIndex - 1];
      handleSelectChapter(previousChapter.href);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1];
      handleSelectChapter(nextChapter.href);
    }
  };

  // Check if navigation is available
  const hasPreviousChapter = currentChapterIndex > 0;
  const hasNextChapter = currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1;

  // Toggle functions for expand/collapse
  const toggleFileUpload = () => setFileUploadExpanded(!fileUploadExpanded);
  const toggleChapterSelection = () => setChapterSelectionExpanded(!chapterSelectionExpanded);
  const toggleChapterSplitter = () => setChapterSplitterExpanded(!chapterSplitterExpanded);
  const toggleChapterContent = () => setChapterContentExpanded(!chapterContentExpanded);
  const toggleTranslation = () => setTranslationExpanded(!translationExpanded);

  useEffect(() => {
    const selectedChapter = localStorage.getItem(`${epubName}-selectedChapter`);
    if (selectedChapter && book && epubName) {
      handleSelectChapter(selectedChapter).catch((error: any) => {
        console.error("Failed to load chapter content:", error);
      });
    }
  }, [book, handleSelectChapter, epubName]);

  return (
    <Container maxWidth="lg" className="container" sx={{ position: 'relative', marginTop: 4, marginBottom: 4 }}>
    {/* Improved Alert */}
    <AnimatePresence>
    {error && (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
      >
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
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
          borderRadius: 3,
          borderLeft: '4px solid',
          borderColor: 'error.main',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'error.light',
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
      </motion.div>
    )}
    </AnimatePresence>

    {/* Header Section */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <Paper
      elevation={0}
      sx={{ 
        mb: 4,
        padding: 3,
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
        borderRadius: 4,
        border: '1px solid rgba(124, 58, 237, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)',
        }
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)',
            }}
          >
            <MenuBookIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              EPUB Content Splitter
            </Typography>
            {bookTitle && (
              <Chip
                label={bookTitle}
                icon={<MenuBookIcon />}
                sx={{ 
                  mt: 1,
                  backgroundColor: 'rgba(124, 58, 237, 0.15)',
                  color: 'primary.light',
                  fontWeight: 600,
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                }}
              />
            )}
          </Box>
        </Box>
        <GearMenu bookTitle={bookTitle} />
      </Box>
    </Paper>
    </motion.div>

    {/* Main Content */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* File Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
      <Paper elevation={0} sx={{ 
        borderRadius: 4,
        backgroundColor: 'background.paper',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: 2.5,
          background: fileUploadExpanded 
            ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)'
            : 'transparent',
          borderBottom: fileUploadExpanded ? '1px solid rgba(124, 58, 237, 0.15)' : 'none',
          cursor: 'pointer',
          '&:hover': {
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
          }
        }}
        onClick={toggleFileUpload}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            📤 File Upload
          </Typography>
          <IconButton 
            sx={{ 
              color: 'primary.main',
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
      </motion.div>

      {/* Chapter Selection */}
      {chapters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
        <Paper elevation={0} sx={{ 
          borderRadius: 4,
          backgroundColor: 'background.paper',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: 2.5,
            background: chapterSelectionExpanded 
              ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)'
              : 'transparent',
            borderBottom: chapterSelectionExpanded ? '1px solid rgba(124, 58, 237, 0.15)' : 'none',
            cursor: 'pointer',
            '&:hover': {
              background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
            }
          }}
          onClick={toggleChapterSelection}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              📚 Chapter Selection
              <Chip 
                label={chapters.length} 
                size="small" 
                sx={{ 
                  ml: 1,
                  backgroundColor: 'rgba(124, 58, 237, 0.2)',
                  color: 'primary.light',
                  fontWeight: 700,
                }}
              />
            </Typography>
            <IconButton 
              sx={{ 
                color: 'primary.main',
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
                selectedChapterIndex={currentChapterIndex}
              />
            </Box>
          </Collapse>
        </Paper>
        </motion.div>
      )}

      {/* Chapter Processing */}
      {chapterContent && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
          <Paper elevation={0} sx={{ 
            borderRadius: 4,
            backgroundColor: 'background.paper',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: 2.5,
              background: chapterSplitterExpanded 
                ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)'
                : 'transparent',
              borderBottom: chapterSplitterExpanded ? '1px solid rgba(124, 58, 237, 0.15)' : 'none',
              cursor: 'pointer',
              '&:hover': {
                background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
              }
            }}
            onClick={toggleChapterSplitter}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                ✂️ Chapter Splitter
              </Typography>
              <IconButton 
                sx={{ 
                  color: 'primary.main',
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
          <Paper elevation={0} sx={{ 
            borderRadius: 4,
            backgroundColor: 'background.paper',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
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
              padding: 2.5,
              background: chapterContentExpanded 
                ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)'
                : 'transparent',
              borderBottom: chapterContentExpanded ? '1px solid rgba(124, 58, 237, 0.15)' : 'none',
              cursor: 'pointer',
              '&:hover': {
                background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
              }
            }}
            onClick={toggleChapterContent}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                📄 Chapter Content
              </Typography>
              <IconButton 
                sx={{ 
                  color: 'primary.main',
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
          </motion.div>

          {/* Translation Section - Separate from Chapter Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
          <Paper elevation={0} sx={{ 
            borderRadius: 4,
            backgroundColor: 'background.paper',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: 2.5,
              background: translationExpanded 
                ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)'
                : 'transparent',
              borderBottom: translationExpanded ? '1px solid rgba(124, 58, 237, 0.15)' : 'none',
              cursor: 'pointer',
              '&:hover': {
                background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
              }
            }}
            onClick={toggleTranslation}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                🌐 Translation
              </Typography>
              <IconButton 
                sx={{ 
                  color: 'primary.main',
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
                  images={images}
                  bookTitle={bookTitle}
                  onPreviousChapter={handlePreviousChapter}
                  onNextChapter={handleNextChapter}
                  hasPreviousChapter={hasPreviousChapter}
                  hasNextChapter={hasNextChapter}
                  currentChapter={currentChapterIndex >= 0 ? currentChapterIndex + 1 : undefined}
                  totalChapters={chapters.length > 0 ? chapters.length : undefined}
                />
              </Box>
            </Collapse>
          </Paper>
          </motion.div>
        </>
      )}
    </Box>
  </Container>
  );
};

export default App;