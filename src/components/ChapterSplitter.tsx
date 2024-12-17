import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface ChapterSplitterProps {
  content: string;
}

const DEFAULT_TEXTS = ["", "", ""];
const DEFAULT_TOGGLES = [false, false, false];

const ChapterSplitter: React.FC<ChapterSplitterProps> = ({ content }) => {
  const [parts, setParts] = useState<string[]>([]);
  const [charCount, setCharCount] = useState<number>(1000);
  const [numParts, setNumParts] = useState<number>(2);
  const [splitByCharCount, setSplitByCharCount] = useState<boolean>(false);
  const [optionalTexts, setOptionalTexts] = useState<string[]>(DEFAULT_TEXTS);
  const [optionalTextToggles, setOptionalTextToggles] = useState<boolean[]>(DEFAULT_TOGGLES);

  useEffect(() => {
    try {
      const storedTexts = JSON.parse(localStorage.getItem("optionalTexts") || "[]");
      const storedToggles = JSON.parse(localStorage.getItem("optionalTextToggles") || "[]");

      if (Array.isArray(storedTexts) && storedTexts.length === DEFAULT_TEXTS.length) {
        setOptionalTexts(storedTexts);
      } else {
        throw new Error("Invalid texts in localStorage");
      }

      if (Array.isArray(storedToggles) && storedToggles.length === DEFAULT_TOGGLES.length) {
        setOptionalTextToggles(storedToggles);
      } else {
        throw new Error("Invalid toggles in localStorage");
      }
    } catch (error) {
      console.error("Error reading localStorage data:", error);
      setOptionalTexts(DEFAULT_TEXTS);
      setOptionalTextToggles(DEFAULT_TOGGLES);

      localStorage.setItem("optionalTexts", JSON.stringify(DEFAULT_TEXTS));
      localStorage.setItem("optionalTextToggles", JSON.stringify(DEFAULT_TOGGLES));
    }
  }, []);

  const handleOptionalTextChanges = (newTexts: string[], newToggles: boolean[]) => {
    setOptionalTexts(newTexts);
    setOptionalTextToggles(newToggles);
    localStorage.setItem("optionalTexts", JSON.stringify(newTexts));
    localStorage.setItem("optionalTextToggles", JSON.stringify(newToggles));
  };

  const splitContentByCharCount = () => {
    const sentences = content.split(/(?<=[.!?])\s+/);
    let currentPart = "";
    const newParts: string[] = [];

    sentences.forEach((sentence) => {
      if (currentPart.length + sentence.length <= charCount) {
        currentPart += sentence + " ";
      } else {
        newParts.push(currentPart.trim());
        currentPart = sentence + " ";
      }
    });

    if (currentPart) {
      newParts.push(currentPart.trim());
    }

    setParts(
      newParts.map((part) => {
        let optionalText = "";
        optionalTextToggles.forEach((toggle, i) => {
          if (toggle && optionalTexts[i]) {
            optionalText += optionalTexts[i] + "\n";
          }
        });
        return optionalText + part;
      })
    );
  };

  const splitContentByNumParts = () => {
    const sentences = content.split(/(?<=[.!?])\s+/);
    const totalLength = sentences.reduce((acc, sentence) => acc + sentence.length, 0);
    const partLength = Math.ceil(totalLength / numParts);
    let currentPart = "";
    const newParts: string[] = [];

    sentences.forEach((sentence) => {
      if (currentPart.length + sentence.length <= partLength) {
        currentPart += sentence + " ";
      } else {
        newParts.push(currentPart.trim());
        currentPart = sentence + " ";
      }
    });

    if (currentPart) {
      newParts.push(currentPart.trim());
    }

    if (newParts.length > numParts) {
      const lastPart = newParts.splice(numParts - 1).join(" ");
      newParts.push(lastPart);
    }

    setParts(
      newParts.map((part) => {
        let optionalText = "";
        optionalTextToggles.forEach((toggle, i) => {
          if (toggle && optionalTexts[i]) {
            optionalText += optionalTexts[i] + "\n";
          }
        });
        return optionalText + part;
      })
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSplit = () => {
    if (splitByCharCount) {
      splitContentByCharCount();
    } else {
      splitContentByNumParts();
    }
  };

  // Increment/Decrement Handlers
  const handleIncreaseParts = () => setNumParts((prev) => prev + 1);
  const handleDecreaseParts = () => setNumParts((prev) => Math.max(1, prev - 1));

  const handleIncreaseCharCount = () => setCharCount((prev) => prev + 100);
  const handleDecreaseCharCount = () => setCharCount((prev) => Math.max(100, prev - 100));

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: "auto", textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Split Chapter Content
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={splitByCharCount}
            onChange={(e) => setSplitByCharCount(e.target.checked)}
            name="splitByCharCount"
            color="primary"
          />
        }
        label="Split by Character Count"
      />
      {splitByCharCount ? (
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            label="Character Count per Part"
            type="number"
            value={charCount}
            onChange={(e) => setCharCount(Number(e.target.value))}
            sx={{ marginBottom: 2, width: "100%" }}
          />
          <Button onClick={handleIncreaseCharCount} sx={{ marginRight: 1 }} variant="outlined">
            +100
          </Button>
          <Button onClick={handleDecreaseCharCount} variant="outlined">
            -100
          </Button>
        </Box>
      ) : (
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            label="Number of Parts"
            type="number"
            value={numParts}
            onChange={(e) => setNumParts(Number(e.target.value))}
            sx={{ marginBottom: 2, width: "100%" }}
          />
          <Button onClick={handleIncreaseParts} sx={{ marginRight: 1 }} variant="outlined">
            +1 Part
          </Button>
          <Button onClick={handleDecreaseParts} variant="outlined">
            -1 Part
          </Button>
        </Box>
      )}

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Optional Texts</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {optionalTexts.map((text, index) => (
            <Box key={index} sx={{ marginBottom: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={optionalTextToggles[index]}
                    onChange={(e) => {
                      const newToggles = [...optionalTextToggles];
                      newToggles[index] = e.target.checked;
                      setOptionalTextToggles(newToggles);
                    }}
                    name={`optionalTextToggle${index}`}
                    color="primary"
                  />
                }
                label={`Enable Optional Text ${index + 1}`}
              />
              {optionalTextToggles[index] && (
                <TextField
                  label={`Optional Text ${index + 1}`}
                  value={text}
                  onChange={(e) => {
                    const newTexts = [...optionalTexts];
                    newTexts[index] = e.target.value;
                    handleOptionalTextChanges(newTexts, optionalTextToggles);
                  }}
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ marginBottom: 2 }}
                />
              )}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      <Button
        variant="contained"
        onClick={handleSplit}
        sx={{
          margin: "20px auto",
          padding: "10px 20px",
          display: "block",
          borderRadius: "20px",
        }}
      >
        Split Content
      </Button>

      <Grid container spacing={2} justifyContent="center">
        {parts.map((part, index) => {
          const charCount = part.length;
          const wordCount = part.split(/\s+/).filter(Boolean).length;
          return (
            <Grid item key={index} xs={12} sm={6}>
              <Box
                sx={{
                  padding: 2,
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  textAlign: "left",
                  wordBreak: "break-word",
                }}
              >
                <Typography variant="h6">Part {index + 1}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {charCount} characters, {wordCount} words
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => handleCopy(part)}
                  sx={{ marginTop: 2, display: "block" }}
                >
                  Copy to Clipboard
                </Button>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ChapterSplitter;