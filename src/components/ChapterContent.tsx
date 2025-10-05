import React, { useState, useMemo } from "react";
import { Box, Typography, Button, Stack, Paper, Chip } from "@mui/material";
import { stripHtml } from "../utils/stripHtml";
import { ImageGallery } from "./ImageGallery";

interface ChapterContentProps {
  content: string;
  images: Uint8Array[];
  chapterTitle?: string;
}

const ChapterContent: React.FC<ChapterContentProps> = ({ content, images, chapterTitle }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const previewLength = 300; // Number of characters to show in the preview

  // Memoize the stripped content to avoid recalculation
  const strippedContent = useMemo(() => stripHtml(content), [content]);

  // Memoize the preview content
  const previewContent = useMemo(() => {
    return strippedContent.length > previewLength
      ? strippedContent.substring(0, previewLength) + "..."
      : strippedContent;
  }, [strippedContent, previewLength]);

  // Memoize the word count calculation
  const wordCount = useMemo(() => {
    return strippedContent.trim().split(/\s+/).length;
  }, [strippedContent]);

  // Only process full content when needed
  const displayContent = useMemo(() => {
    if (!showFullContent) {
      return previewContent;
    }
    return content;
  }, [showFullContent, previewContent, content]);

  const handleToggleContent = () => {
    setShowFullContent(!showFullContent);
  };

  const handleToggleImages = () => {
    setShowImages(!showImages);
  };

  const hasImages = images && images.length > 0;

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
          <Chip 
            label={`${strippedContent.length} characters`} 
            variant="outlined" 
            color="primary" 
            size="small"
          />
          <Chip 
            label={`${wordCount} words`} 
            variant="outlined" 
            color="primary" 
            size="small"
          />
          {hasImages && (
            <Chip 
              label={`${images.length} images`} 
              variant="outlined" 
              color="secondary" 
              size="small"
            />
          )}
        </Stack>

        {/* Images Section - Only show button if images exist */}
        {hasImages && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Button 
              variant="outlined" 
              onClick={handleToggleImages}
              sx={{
                color: '#a78bfa',
                borderColor: 'rgba(124, 58, 237, 0.4)',
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  borderColor: 'rgba(124, 58, 237, 0.6)',
                },
              }}
            >
              {showImages ? `Hide Images (${images.length})` : `Show Images (${images.length})`}
            </Button>
          </Box>
        )}

        {/* Image Gallery - Only render when user wants to see images */}
        {hasImages && showImages && (
          <Box sx={{ mb: 3 }}>
            <ImageGallery images={images} />
          </Box>
        )}

        {/* Chapter Content */}
        <Typography variant="h5" gutterBottom sx={{ color: '#a78bfa', fontWeight: 'bold' }}>
          Chapter Content:
        </Typography>
        <Box
          dangerouslySetInnerHTML={{ __html: displayContent }}
          sx={{
            typography: "body1",
            lineHeight: 1.6,
            mb: 2,
            px: 1,
            userSelect: 'text', // Enable text selection
            WebkitUserSelect: 'text',
            MozUserSelect: 'text',
            msUserSelect: 'text',
            cursor: 'text',
          }}
        />

        {/* Show More/Show Less Button */}
        {strippedContent.length > previewLength && (
          <Box textAlign="center">
            <Button 
              variant="contained" 
              onClick={handleToggleContent}
              sx={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                color: '#fff',
                borderRadius: '12px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
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
