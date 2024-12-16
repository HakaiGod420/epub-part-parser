import React, { useState } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { stripHtml } from '../utils/stripHtml';

interface ChapterContentProps {
  content: string;
}

const ChapterContent: React.FC<ChapterContentProps> = ({ content }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const previewLength = 300; // Number of characters to show in the preview

  const handleToggleContent = () => {
    setShowFullContent(!showFullContent);
  };

  const strippedContent = stripHtml(content);
  const previewContent =
    strippedContent.length > previewLength ? strippedContent.substring(0, previewLength) + "..." : strippedContent;

  // Calculate word count
  const wordCount = strippedContent.trim().split(/\s+/).length;

  return (
    <Box sx={{ padding: 2 }}>
      {/* Character and Word Count Section */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ marginBottom: 2 }}
      >
        <Typography variant="subtitle1" color="text.secondary">
          Character Count: {strippedContent.length}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Word Count: {wordCount}
        </Typography>
      </Stack>

      {/* Chapter Content */}
      <Typography variant="h5" gutterBottom>
        Chapter Content:
      </Typography>
      <Box
        dangerouslySetInnerHTML={{ __html: showFullContent ? content : previewContent }}
        sx={{
          typography: "body1",
          lineHeight: 1.6,
        }}
      />
      {content.length > previewLength && (
        <Button onClick={handleToggleContent} sx={{ marginTop: 2 }}>
          {showFullContent ? "Show Less" : "Show More"}
        </Button>
      )}
    </Box>
  );
};

export default ChapterContent;