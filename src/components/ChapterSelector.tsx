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
  selectedChapterIndex?: number; // Optional prop to sync with parent state
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  chapters,
  onSelectChapter,
  epubName,
  selectedChapterIndex,
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

  // Sync with parent's selectedChapterIndex when it changes
  useEffect(() => {
    if (selectedChapterIndex !== undefined && selectedChapterIndex !== currentChapterIndex) {
      setCurrentChapterIndex(selectedChapterIndex);
    }
  }, [selectedChapterIndex, currentChapterIndex]);

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
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 3,
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
          color: 'text.primary',
        }}
      >
        Select Chapter
      </Typography>

      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <Select
          id="chapter-selector"
          value={chapters[currentChapterIndex]?.href || ""}
          onChange={handleSelectChange}
          displayEmpty
          sx={{
            backgroundColor: 'background.default',
            borderRadius: 1,
          }}
        >
          {chapters.map((chapter, index) => (
            <MenuItem
              id={`chapter-menuitem-${index}`}
              key={chapter.href}
              value={chapter.href}
              sx={{
                backgroundColor: openedChapters.includes(chapter.href)
                  ? "action.selected"
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
            textTransform: "none",
            background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
            color: '#fff',
            borderRadius: '12px',
            '&:hover': {
              background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
            },
            '&:disabled': {
              background: '#424242',
              color: '#666',
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
            textTransform: "none",
            background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
            color: '#fff',
            borderRadius: '12px',
            '&:hover': {
              background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
            },
            '&:disabled': {
              background: '#424242',
              color: '#666',
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
          color: 'text.secondary',
        }}
      >
        Chapter {currentChapterIndex + 1} of {chapters.length}
      </Typography>
    </Box>
  );
};

export default ChapterSelector;
