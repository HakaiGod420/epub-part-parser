import React, { useState } from "react";
import { Box, Typography, Button, Stack, Paper } from "@mui/material";
import { stripHtml } from "../utils/stripHtml";
import { ImageGallery } from "./ImageGallery";

interface ChapterContentProps {
  content: string;
  images: Uint8Array[];
  chapterTitle?: string;
}

const ChapterContent: React.FC<ChapterContentProps> = ({ content, images, chapterTitle }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const previewLength = 300; // Number of characters to show in the preview

  const handleToggleContent = () => {
    setShowFullContent(!showFullContent);
  };

  const strippedContent = stripHtml(content);
  const previewContent =
    strippedContent.length > previewLength
      ? strippedContent.substring(0, previewLength) + "..."
      : strippedContent;

  // Calculate word count
  const wordCount = strippedContent.trim().split(/\s+/).length;

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{ 
          p: 3, 
          maxWidth: 800, 
          mx: "auto", 
          my: 4, 
          borderRadius: 2, 
          backgroundColor: "background.paper",
          boxShadow: 3
        }}
      >
        {/* Character and Word Count Section */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Character Count: {strippedContent.length}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Word Count: {wordCount}
          </Typography>
        </Stack>

        {/* Image Gallery */}
        {images.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <ImageGallery images={images} />
          </Box>
        )}

        {/* Chapter Content */}
        <Typography variant="h5" gutterBottom>
          Chapter Content:
        </Typography>
        <Box
          dangerouslySetInnerHTML={{ __html: showFullContent ? content : previewContent }}
          sx={{
            typography: "body1",
            lineHeight: 1.6,
            mb: 2,
            px: 1,
          }}
        />

        {/* Show More/Show Less Button */}
        {strippedContent.length > previewLength && (
          <Box textAlign="center">
            <Button 
              variant="contained" 
              onClick={handleToggleContent}
              sx={{
                backgroundColor: '#4caf50',
                color: '#fff',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: '#45a049',
                },
              }}
            >
              {showFullContent ? "Show Less" : "Show More"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ChapterContent;
