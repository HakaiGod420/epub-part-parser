import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  SelectChangeEvent,
} from "@mui/material";

interface ChapterSelectorProps {
  chapters: Array<{ label: string; href: string }>;
  onSelectChapter: (href: string) => void;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  chapters,
  onSelectChapter,
}) => {
  // Track the index of the currently selected chapter
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

  useEffect(() => {
    // Load the stored chapter from localStorage
    const storedChapter = localStorage.getItem("selectedChapter");

    if (storedChapter) {
      const storedIndex = chapters.findIndex(
        (chapter) => chapter.href === storedChapter
      );

      // If valid chapter is found, set it
      if (storedIndex !== -1) {
        setCurrentChapterIndex(storedIndex);
        onSelectChapter(storedChapter);
      }
    }
  }, [chapters, onSelectChapter]);

  useEffect(() => {
    // Save the selected chapter to localStorage only if it's valid
    if (chapters[currentChapterIndex]) {
      const selectedChapter = chapters[currentChapterIndex].href;
      onSelectChapter(selectedChapter);
    }
  }, [currentChapterIndex, chapters, onSelectChapter]);


  const handleBack = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prevIndex) => prevIndex - 1);
      localStorage.setItem("selectedChapter", chapters[currentChapterIndex - 1].href);
    }
  };

  const handleNext = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex((prevIndex) => prevIndex + 1);
      localStorage.setItem("selectedChapter", chapters[currentChapterIndex + 1].href);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const newIndex = chapters.findIndex(
      (chapter) => chapter.href === event.target.value
    );
    if (newIndex !== -1) {
      setCurrentChapterIndex(newIndex);
      localStorage.setItem("selectedChapter", event.target.value);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Select Chapter:
      </Typography>
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <Select
          value={chapters[currentChapterIndex]?.href || ""}
          onChange={handleSelectChange}
        >
          {chapters.map((chapter, index) => (
            <MenuItem key={chapter.href} value={chapter.href}>
              {chapter.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <Button
          variant="contained"
          onClick={handleBack}
          disabled={currentChapterIndex === 0}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={currentChapterIndex === chapters.length - 1}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default ChapterSelector;