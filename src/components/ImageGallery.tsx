import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Modal, ImageList, ImageListItem, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ImageGalleryProps {
  images: Uint8Array[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Memoize the creation of image URLs - only create when needed
  const imageURLs = useMemo(() => {
    return images.map((imgData, index) => {
      if (loadedImages.has(index)) {
        const blob = new Blob([new Uint8Array(imgData)], { type: 'image/jpeg' });
        return URL.createObjectURL(blob);
      }
      return null;
    });
  }, [images, loadedImages]);

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      imageURLs.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imageURLs]);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  }, []);

  const handleOpen = useCallback((index: number) => {
    handleImageLoad(index); // Ensure image is loaded when opening
    setSelectedIndex(index);
    setOpen(true);
  }, [handleImageLoad]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSelectedIndex(null);
  }, []);

  return (
    <Box>
      <ImageList variant="masonry" cols={3} gap={8}>
        {imageURLs.map((url, index) => {
          if (!url) {
            // Show placeholder or load button for unloaded images
            return (
              <ImageListItem key={index} onClick={() => handleImageLoad(index)}>
                <Box
                  sx={{
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    cursor: 'pointer',
                    border: '2px dashed #ccc',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Click to load image {index + 1}
                  </Typography>
                </Box>
              </ImageListItem>
            );
          }
          
          return (
            <ImageListItem key={index} onClick={() => handleOpen(index)}>
              <img
                src={url}
                alt={`${index + 1}`}
                loading="lazy"
                style={{ cursor: 'pointer', width: '100%', display: 'block' }}
              />
            </ImageListItem>
          );
        })}
      </ImageList>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            outline: 'none',
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
        >
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>
          {selectedIndex !== null && imageURLs[selectedIndex] && (
            <img
              src={imageURLs[selectedIndex]!}
              alt={`Enlarged view ${selectedIndex + 1}`}
              style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', margin: '0 auto' }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};
