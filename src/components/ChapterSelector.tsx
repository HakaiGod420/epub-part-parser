import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  Alert,
  SelectChangeEvent,
} from "@mui/material";

interface ChapterSelectorProps {
  chapters: Array<{ label: string; href: string }>;
  onSelectChapter: (href: string) => void;
  epubName: string;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  chapters,
  onSelectChapter,
  epubName,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [openedChapters, setOpenedChapters] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    try {
      const storedChapters = localStorage.getItem(`${epubName}-openedChapters`);
      if (storedChapters) {
        setOpenedChapters(JSON.parse(storedChapters));
      }

      const storedChapter = localStorage.getItem(`${epubName}-selectedChapter`);
      if (storedChapter) {
        const storedIndex = chapters.findIndex(
          (chapter) => chapter.href === storedChapter
        );
        if (storedIndex !== -1) {
          setCurrentChapterIndex(storedIndex);
          onSelectChapter(storedChapter);
        }
      }
    } catch (err) {
      console.error("Error loading chapters:", err);
      setError("Failed to load chapters from storage.");
    }
  }, [chapters, onSelectChapter, epubName]);

  const saveToLocalStorage = (index: number) => {
    try {
      const selectedChapter = chapters[index].href;
      onSelectChapter(selectedChapter);
      localStorage.setItem(`${epubName}-selectedChapter`, selectedChapter);

      if (!openedChapters.includes(selectedChapter)) {
        const newOpenedChapters = [...openedChapters, selectedChapter];
        setOpenedChapters(newOpenedChapters);
        localStorage.setItem(
          `${epubName}-openedChapters`,
          JSON.stringify(newOpenedChapters)
        );
      }
    } catch (err) {
      console.error("Error saving chapter:", err);
      setError("Failed to save chapter selection.");
    }
  };

  const handleBack = () => {
    try {
      if (currentChapterIndex > 0) {
        setCurrentChapterIndex((prevIndex) => prevIndex - 1);
        saveToLocalStorage(currentChapterIndex - 1);
      }
    } catch (err) {
      console.error("Error navigating back:", err);
      setError("Failed to load the previous chapter.");
    }
  };

  const handleNext = () => {
    try {
      if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex((prevIndex) => prevIndex + 1);
        saveToLocalStorage(currentChapterIndex + 1);
      }
    } catch (err) {
      console.error("Error navigating next:", err);
      setError("Failed to load the next chapter.");
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    try {
      const newIndex = chapters.findIndex(
        (chapter) => chapter.href === event.target.value
      );
      if (newIndex !== -1) {
        setCurrentChapterIndex(newIndex);
        saveToLocalStorage(newIndex);
      }
    } catch (err) {
      console.error("Error selecting chapter:", err);
      setError("Failed to load the selected chapter.");
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box
      sx={{
        padding: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        margin: "0 auto",
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        position: "relative", // Ensure relative positioning for the alert
      }}
    >
      {/* Top Alert for Errors */}
      {error && (
        <Alert
          severity="error"
          onClose={handleCloseError}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            borderRadius: 0,
          }}
        >
          {error}
        </Alert>
      )}

      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 600,
          marginBottom: 2,
          color: "#333",
        }}
      >
        Select Chapter
      </Typography>

      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <Select
          value={chapters[currentChapterIndex]?.href || ""}
          onChange={handleSelectChange}
          displayEmpty
          sx={{
            backgroundColor: "#fff",
            borderRadius: 1,
          }}
        >
          {chapters.map((chapter, index) => (
            <MenuItem
              key={chapter.href}
              value={chapter.href}
              style={{
                backgroundColor: openedChapters.includes(chapter.href)
                  ? "#e0f7fa"
                  : "inherit",
              }}
            >
              {chapter.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={handleBack}
          disabled={currentChapterIndex === 0}
          sx={{
            backgroundColor: currentChapterIndex === 0 ? "#ccc" : "#1976d2",
            color: "#fff",
            textTransform: "none",
            "&:hover": {
              backgroundColor:
                currentChapterIndex === 0 ? "#ccc" : "#1565c0",
            },
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={currentChapterIndex === chapters.length - 1}
          sx={{
            backgroundColor:
              currentChapterIndex === chapters.length - 1 ? "#ccc" : "#1976d2",
            color: "#fff",
            textTransform: "none",
            "&:hover": {
              backgroundColor:
                currentChapterIndex === chapters.length - 1
                  ? "#ccc"
                  : "#1565c0",
            },
          }}
        >
          Next
        </Button>
      </Box>

      <Typography
        variant="body1"
        sx={{
          marginTop: 3,
          fontWeight: 500,
          color: "#555",
        }}
      >
        Chapter {currentChapterIndex + 1} of {chapters.length}
      </Typography>
    </Box>
  );
};

export default ChapterSelector;
