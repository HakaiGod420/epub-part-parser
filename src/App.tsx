import React, { useState, useEffect } from "react";
import FileUploader from "./components/FileUploader";
import ChapterSelector from "./components/ChapterSelector";
import ChapterContent from "./components/ChapterContent";
import ChapterSplitter from "./components/ChapterSplitter";
import GearMenu from "./components/GearMenu"; // Import GearMenu
import { parseEpub, getChapterContent } from "./utils/epubParser";
import { stripHtml } from "./utils/stripHtml";
import { Box, Container, Typography, Paper, Divider } from "@mui/material";
import './App.css'; // Import the CSS file

const App: React.FC = () => {
  const [chapters, setChapters] = useState<Array<{ label: string; href: string }>>([]);
  const [book, setBook] = useState<any>(null);
  const [chapterContent, setChapterContent] = useState<string>("");
  const [epubName, setEpubName] = useState<string>("");
  const [currentTitle, setCurrentTitle] = useState<string | null | undefined>("");

  const handleFileUpload = async (file: File) => {
    const { book, chapters } = await parseEpub(file);
    setBook(book);
    setChapters(chapters || []);
    setEpubName(file.name); // Set the EPUB name
  };

  const handleSelectChapter = async (href: string) => {
    if (book && href) {
      const content = await getChapterContent(book, href);
      setCurrentTitle(content.title);
      setChapterContent(content.content);
    }
  };

  useEffect(() => {
    const selectedChapter = localStorage.getItem("selectedChapter");
    if (selectedChapter && book) {
      handleSelectChapter(selectedChapter).catch((error) => {
        console.error("Failed to load chapter content:", error);
      });
    }
  }, [book]);

  return (
    <Container maxWidth="md" className="container">
      {/* Heading */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h3" align="center" gutterBottom>
          EPUB Reader
        </Typography>
        <GearMenu /> {/* Add GearMenu here */}
      </Box>
      <Divider sx={{ marginBottom: 4 }} />

      {/* File Uploader */}
      <Paper elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
        <FileUploader onFileUpload={handleFileUpload} />
      </Paper>

      {/* Chapter Selector */}
      {chapters.length > 0 && (
        <Paper elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
          <ChapterSelector chapters={chapters} onSelectChapter={handleSelectChapter} epubName={epubName} />
        </Paper>
      )}

      {/* Chapter Splitter */}
      {chapterContent && (
      <Paper elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
        <ChapterSplitter 
          content={stripHtml(chapterContent).replace(currentTitle ?? "", "").trim()} 
        />
      </Paper>
      )}

      {/* Chapter Content */}
      {chapterContent && (
        <Paper elevation={3} sx={{ padding: 2 }}>
          <ChapterContent content={chapterContent} />
        </Paper>
      )}
    </Container>
  );
};

export default App;