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
import CheckIcon from "@mui/icons-material/Check";
import { encodingForModel} from "js-tiktoken"
import EditIcon from "@mui/icons-material/Edit";
 import { DictionaryEditModal } from "./DictionaryEditModal";

interface DictionaryTerm {
  term: string;
  explanation: string;
}

interface ChapterSplitterProps {
  content: string;
  chapterTitle?: string;
  bookTitle?: string;
}

const DEFAULT_TEXTS = ["Translate to english:", "", ""];
const DEFAULT_TOGGLES = [true, false, false];

const ChapterSplitter: React.FC<ChapterSplitterProps> = ({ content, chapterTitle, bookTitle = "" }) => {
  const [parts, setParts] = useState<string[]>([]);
  const [charCount, setCharCount] = useState<number>(1000);
  const [numParts, setNumParts] = useState<number>(1);
  const [splitByCharCount, setSplitByCharCount] = useState<boolean>(false);
  const [includeDictionary, setIncludeDictionary] = useState<boolean>(true);
  const [includeChapterTitle, setIncludeChapterTitle] = useState<boolean>(false);
  const [optionalTexts, setOptionalTexts] = useState<string[]>(DEFAULT_TEXTS);
  const [optionalTextToggles, setOptionalTextToggles] = useState<boolean[]>(DEFAULT_TOGGLES);
  const [dictionary, setDictionary] = useState<DictionaryTerm[]>([]);
  const [copiedParts, setCopiedParts] = useState<Set<number>>(new Set());
  const [wordCounts, setWordCounts] = useState<number[]>([]);
  const [charCounts, setCharCounts] = useState<number[]>([]);
  const [tokenCounts, setTokenCounts] = useState<number[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTermIndex, setEditingTermIndex] = useState<number | null>(null);

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
            ? parsedDictionary.map((term: any) => ({ 
                term: term.term, 
                explanation: term.explanation 
              }))
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

  const addTermToDictionary = (term: string, explanation: string) => {
    const updatedDictionary = [...dictionary, { term, explanation }];
    saveDictionary(updatedDictionary);
  };

  const splitContent = async () => {
    setCopiedParts(new Set()); // Reset copied state when splitting
    const tokenizer = encodingForModel("gpt-4o"); // Use GPT-4 encoding
  
    const sentences = content.split(/(?<=[.!?])\s+/);
    const totalLength = splitByCharCount
      ? Math.ceil(sentences.reduce((acc, sentence) => acc + sentence.length, 0) / charCount)
      : numParts;
  
    const chunkSize = Math.ceil(sentences.length / totalLength);
    const newParts = Array.from({ length: totalLength }, (_, i) =>
      sentences.slice(i * chunkSize, (i + 1) * chunkSize).join(" ")
    );
  
    const newWordCounts = newParts.map((part) => part.split(/\s+/).filter(Boolean).length);
    const newCharCounts = newParts.map((part) => part.length);
    const newTokenCounts = newParts.map((part) => tokenizer.encode(part).length); // Tokenize each part
  
    setWordCounts(newWordCounts);
    setCharCounts(newCharCounts);
    setTokenCounts(newTokenCounts); // Set token counts
  
    setParts(
      newParts.map((part, index) => {
        const dictionaryText = includeDictionary
          ? dictionary
              .map(({ term, explanation }) => `${term}: ${explanation}`)
              .join("\n")
          : "";
  
        const optionalText = optionalTextToggles
          .map((toggle, i) => (toggle ? optionalTexts[i] : ""))
          .filter(Boolean)
          .join("\n");

        const chapterTitleText = includeChapterTitle && chapterTitle && index === 0
          ? `Chapter: ${chapterTitle}` 
          : "";
  
        return `${dictionaryText ? `Dictionary Terms:\n${dictionaryText}\n\n` : ""}${
          optionalText ? `${optionalText}\n\n` : ""
        }${chapterTitleText ? `${chapterTitleText}\n\n` : ""}${part}`;
      })
    );
  };

  const handleCopy = async (index: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedParts((prev) => new Set(prev).add(index));
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers or non-secure contexts
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        document.execCommand('copy');
        setCopiedParts((prev) => new Set(prev).add(index));
        
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
    }
  };

  const handleEditOpen = (index: number | null) => {
    setEditingTermIndex(index);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditingTermIndex(null);
  };

  const handleEditSave = (newTerm: string, newExplanation: string) => {
    const updatedDictionary = [...dictionary];
    if (editingTermIndex !== null) {
      updatedDictionary[editingTermIndex] = {
        ...updatedDictionary[editingTermIndex],
        term: newTerm,
        explanation: newExplanation,
      };
    }
    saveDictionary(updatedDictionary);
  };

  const increaseParts = () => setNumParts((prev) => prev + 1);
  const decreaseParts = () => setNumParts((prev) => Math.max(prev - 1, 1)); // Minimum 1 part

  return (
    <Box sx={{ padding: 2, maxWidth: 800, margin: "auto", textAlign: "center" }}>
      <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
        Split Chapter Content
      </Typography>
      <DictionaryEditModal
         open={editModalOpen}
         handleClose={handleEditClose}
         term={
           editingTermIndex !== null
             ? { term: dictionary[editingTermIndex].term, explanation: dictionary[editingTermIndex].explanation }
             : { term: "", explanation: "" }
         }
         onSave={handleEditSave}
       />
      {/* Number of Parts */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 2 }}>
        <Button
          variant="outlined"
          onClick={decreaseParts}
          sx={{ 
            marginRight: 1, 
            borderRadius: "20px",
            borderColor: '#666',
            color: '#fff',
            '&:hover': {
              borderColor: '#888',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          -1 Part
        </Button>
        <Typography variant="body1" sx={{ marginX: 2 }}>
          Number of Parts: {numParts}
        </Typography>
        <Button
          variant="outlined"
          onClick={increaseParts}
          sx={{ 
            marginLeft: 1, 
            borderRadius: "20px",
            borderColor: '#666',
            color: '#fff',
            '&:hover': {
              borderColor: '#888',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
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
              sx={{
                backgroundColor: '#4caf50',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#45a049',
                },
              }}
            >
              Add
            </Button>
          </Box>
          <List>
            {dictionary.map((item, index) => (
              <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <ListItemText primary={item.term} secondary={item.explanation} />
                <Box>
                  <IconButton 
                    onClick={() => handleEditOpen(index)} 
                    sx={{
                      color: '#4caf50',
                      '&:hover': {
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
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
                    sx={{
                      '& .MuiSwitch-switchBase': {
                        color: '#bdbdbd',
                        '&.Mui-checked': {
                          color: '#4caf50',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#4caf50',
                            opacity: 0.6,
                          },
                        },
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor: '#757575',
                        opacity: 0.4,
                      },
                    }}
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
            sx={{
              '& .MuiSwitch-switchBase': {
                color: '#bdbdbd',
                '&.Mui-checked': {
                  color: '#4caf50',
                  '& + .MuiSwitch-track': {
                    backgroundColor: '#4caf50',
                    opacity: 0.6,
                  },
                },
              },
              '& .MuiSwitch-track': {
                backgroundColor: '#757575',
                opacity: 0.4,
              },
            }}
          />
        }
        label="Include Dictionary Terms"
      />

      <FormControlLabel
        control={
          <Switch
            checked={includeChapterTitle}
            onChange={(e) => setIncludeChapterTitle(e.target.checked)}
            name="includeChapterTitle"
            sx={{
              '& .MuiSwitch-switchBase': {
                color: '#bdbdbd',
                '&.Mui-checked': {
                  color: '#4caf50',
                  '& + .MuiSwitch-track': {
                    backgroundColor: '#4caf50',
                    opacity: 0.6,
                  },
                },
              },
              '& .MuiSwitch-track': {
                backgroundColor: '#757575',
                opacity: 0.4,
              },
            }}
          />
        }
        label="Include Chapter Title"
      />

      <Button
        variant="contained"
        onClick={splitContent}
        sx={{ 
          margin: "20px auto", 
          padding: "10px 20px", 
          display: "block", 
          borderRadius: "20px",
          backgroundColor: '#4caf50',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#45a049',
          },
        }}
      >
        Split Content
      </Button>

      <Grid container spacing={2} justifyContent="center">
  {parts.map((part, index) => (
    <Grid item key={index} xs={12} sm={6}>
      <Box
        sx={{
          padding: 2,
          border: "1px solid",
          borderColor: 'divider',
          borderRadius: "10px",
          boxShadow: 3,
          textAlign: "left",
          wordBreak: "break-word",
          position: "relative",
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h6" sx={{ color: 'text.primary' }}>Part {index + 1}</Typography>
        <Typography variant="body2" color="text.secondary">
          {charCounts[index]} characters, {wordCounts[index]} words, {tokenCounts[index]} tokens
        </Typography>
        <Button
          variant="outlined"
          onClick={() => handleCopy(index, part)}
          sx={{
            marginTop: 2,
            display: "block",
            width: "100%",
            borderRadius: "20px",
            backgroundColor: copiedParts.has(index) ? "#4caf50" : "transparent",
            color: copiedParts.has(index) ? "#fff" : "#fff",
            borderColor: copiedParts.has(index) ? "#4caf50" : "#666",
            "&:hover": {
              backgroundColor: copiedParts.has(index) ? "#45a049" : "rgba(255, 255, 255, 0.08)",
              borderColor: copiedParts.has(index) ? "#45a049" : "#888",
            },
          }}
          startIcon={copiedParts.has(index) ? <CheckIcon /> : undefined}
        >
          {copiedParts.has(index) ? "Copied" : "Copy to Clipboard"}
        </Button>
      </Box>
    </Grid>
  ))}
</Grid>
    </Box>
  );
};

export default ChapterSplitter;