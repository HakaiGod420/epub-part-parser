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
  epubName: string; // Add epubName prop
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  chapters,
  onSelectChapter,
  epubName,
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [openedChapters, setOpenedChapters] = useState<string[]>([]);

  useEffect(() => {
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
  }, [chapters, onSelectChapter, epubName]);

  const saveToLocalStorage = (index:number) => {
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
  }

  const handleBack = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prevIndex) => prevIndex - 1);
      saveToLocalStorage(currentChapterIndex - 1);
      
    }
  };

  const handleNext = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex((prevIndex) => prevIndex + 1);
      saveToLocalStorage(currentChapterIndex + 1);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const newIndex = chapters.findIndex(
      (chapter) => chapter.href === event.target.value
    );
    if (newIndex !== -1) {
      setCurrentChapterIndex(newIndex);
      saveToLocalStorage(newIndex);
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