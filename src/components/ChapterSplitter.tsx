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
  IconButton,
  List,
  ListItem,
  ListItemText,
  Grid2,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CheckIcon from "@mui/icons-material/Check";

interface DictionaryTerm {
  term: string;
  explanation: string;
  likes: number;
}

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
  const [includeDictionary, setIncludeDictionary] = useState<boolean>(false);
  const [optionalTexts, setOptionalTexts] = useState<string[]>(DEFAULT_TEXTS);
  const [optionalTextToggles, setOptionalTextToggles] = useState<boolean[]>(DEFAULT_TOGGLES);
  const [dictionary, setDictionary] = useState<DictionaryTerm[]>([]);
  const [copiedParts, setCopiedParts] = useState<Set<number>>(new Set());

  useEffect(() => {
    const storedTexts = JSON.parse(localStorage.getItem("optionalTexts") || "[]");
    const storedToggles = JSON.parse(localStorage.getItem("optionalTextToggles") || "[]");
    const storedDictionary = localStorage.getItem("dictionaryTerms");

    setOptionalTexts(Array.isArray(storedTexts) && storedTexts.length ? storedTexts : DEFAULT_TEXTS);
    setOptionalTextToggles(
      Array.isArray(storedToggles) && storedToggles.length ? storedToggles : DEFAULT_TOGGLES
    );

    if (storedDictionary) {
      try {
        const parsedDictionary = JSON.parse(storedDictionary);
        setDictionary(
          Array.isArray(parsedDictionary)
            ? parsedDictionary.map((term: any) => ({ ...term, likes: term.likes || 0 }))
            : []
        );
      } catch {
        console.error("Failed to parse dictionary data.");
      }
    }
  }, []);

  const handleOptionalTextChanges = (newTexts: string[], newToggles: boolean[]) => {
    setOptionalTexts(newTexts);
    setOptionalTextToggles(newToggles);
    localStorage.setItem("optionalTexts", JSON.stringify(newTexts));
    localStorage.setItem("optionalTextToggles", JSON.stringify(newToggles));
  };

  const handleOptionalTextChange = (index: number, value: string) => {
    const newTexts = [...optionalTexts];
    newTexts[index] = value;
    handleOptionalTextChanges(newTexts, optionalTextToggles);
  };

  const handleOptionalToggleChange = (index: number, checked: boolean) => {
    const newToggles = [...optionalTextToggles];
    newToggles[index] = checked;
    handleOptionalTextChanges(optionalTexts, newToggles);
  };

  const saveDictionary = (updatedDictionary: DictionaryTerm[]) => {
    setDictionary(updatedDictionary);
    localStorage.setItem("dictionaryTerms", JSON.stringify(updatedDictionary));
  };

  const handleLike = (index: number) => {
    const updatedDictionary = [...dictionary];
    updatedDictionary[index].likes += 1;
    saveDictionary(updatedDictionary);
  };

  const addTermToDictionary = (term: string, explanation: string) => {
    const updatedDictionary = [...dictionary, { term, explanation, likes: 0 }];
    saveDictionary(updatedDictionary);
  };

  const splitContent = () => {
    setCopiedParts(new Set()); // Reset copied state when splitting
    const sentences = content.split(/(?<=[.!?])\s+/);
    const totalLength = splitByCharCount
      ? Math.ceil(sentences.reduce((acc, sentence) => acc + sentence.length, 0) / charCount)
      : numParts;

    const chunkSize = Math.ceil(sentences.length / totalLength);
    const newParts = Array.from({ length: totalLength }, (_, i) =>
      sentences.slice(i * chunkSize, (i + 1) * chunkSize).join(" ")
    );

    setParts(
      newParts.map((part) => {
        const dictionaryText = includeDictionary
          ? dictionary
              .sort((a, b) => b.likes - a.likes)
              .map(({ term, explanation }) => `${term}: ${explanation}`)
              .join("\n")
          : "";

        const optionalText = optionalTextToggles
          .map((toggle, i) => (toggle ? optionalTexts[i] : ""))
          .filter(Boolean)
          .join("\n");

        return `${dictionaryText ? `Dictionary Terms:\n${dictionaryText}\n\n` : ""}${
          optionalText ? `${optionalText}\n\n` : ""
        }${part}`;
      })
    );
  };

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedParts((prev) => new Set(prev).add(index));
  };

  const increaseParts = () => setNumParts((prev) => prev + 1);
  const decreaseParts = () => setNumParts((prev) => Math.max(prev - 1, 1)); // Minimum 1 part

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: "auto", textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Split Chapter Content
      </Typography>

      {/* Number of Parts */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2 }}>
        <Button
          variant="outlined"
          onClick={decreaseParts}
          sx={{ marginRight: 1, borderRadius: "20px" }}
        >
          -1 Part
        </Button>
        <Typography variant="body1" sx={{ marginX: 2 }}>
          Number of Parts: {numParts}
        </Typography>
        <Button
          variant="outlined"
          onClick={increaseParts}
          sx={{ marginLeft: 1, borderRadius: "20px" }}
        >
          +1 Part
        </Button>
      </Box>

      {/* Add Dictionary Term */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Dictionary Terms</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
            <TextField
              label="Term"
              variant="outlined"
              fullWidth
              id="new-term"
              sx={{ flexGrow: 1 }}
            />
            <TextField
              label="Explanation"
              variant="outlined"
              fullWidth
              id="new-explanation"
              sx={{ flexGrow: 2 }}
            />
            <Button
              variant="contained"
              onClick={() => {
                const term = (document.getElementById("new-term") as HTMLInputElement).value;
                const explanation = (
                  document.getElementById("new-explanation") as HTMLInputElement
                ).value;
                if (term && explanation) {
                  addTermToDictionary(term, explanation);
                  (document.getElementById("new-term") as HTMLInputElement).value = "";
                  (document.getElementById("new-explanation") as HTMLInputElement).value = "";
                }
              }}
            >
              Add
            </Button>
          </Box>
          <List>
            {dictionary.map((item, index) => (
              <ListItem key={index} sx={{ display: "flex", justifyContent: "space-between" }}>
                <ListItemText
                  primary={item.term}
                  secondary={`${item.explanation} (Likes: ${item.likes})`}
                />
                <IconButton onClick={() => handleLike(index)} color="primary">
                  <ThumbUpIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Optional Texts */}
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
                    onChange={(e) => handleOptionalToggleChange(index, e.target.checked)}
                    name={`optionalTextToggle${index}`}
                    color="primary"
                  />
                }
                label={`Enable Optional Text ${index + 1}`}
              />
              {optionalTextToggles[index] && (
                <TextField
                  value={text}
                  onChange={(e) => handleOptionalTextChange(index, e.target.value)}
                  label={`Optional Text ${index + 1}`}
                  fullWidth
                />
              )}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      <FormControlLabel
        control={
          <Switch
            checked={includeDictionary}
            onChange={(e) => setIncludeDictionary(e.target.checked)}
            name="includeDictionary"
            color="primary"
          />
        }
        label="Include Dictionary Terms"
      />

      <Button
        variant="contained"
        onClick={splitContent}
        sx={{ margin: "20px auto", padding: "10px 20px", display: "block", borderRadius: "20px" }}
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
                  position: "relative",
                }}
              >
                <Typography variant="h6">Part {index + 1}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {charCount} characters, {wordCount} words
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => handleCopy(index, part)}
                  sx={{
                    marginTop: 2,
                    display: "block",
                    width: "100%",
                    borderRadius: "20px",
                    backgroundColor: copiedParts.has(index) ? "#4caf50" : "inherit",
                    color: copiedParts.has(index) ? "#fff" : "inherit",
                    "&:hover": {
                      backgroundColor: copiedParts.has(index) ? "#45a049" : "#f5f5f5",
                    },
                  }}
                  startIcon={copiedParts.has(index) ? <CheckIcon /> : undefined}
                >
                  {copiedParts.has(index) ? "Copied" : "Copy to Clipboard"}
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