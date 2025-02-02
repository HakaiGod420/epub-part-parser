import React, { useState, useEffect } from 'react';
import { Box, Modal, ImageList, ImageListItem, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ImageGalleryProps {
  images: Uint8Array[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageURLs, setImageURLs] = useState<string[]>([]);

  // Convert Uint8Array images to blob URLs once the images array changes
  useEffect(() => {
    const urls = images.map((imgData) => {
      // Adjust the MIME type as needed (e.g., "image/png")
      const blob = new Blob([imgData.buffer], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    });
    setImageURLs(urls);

    // Cleanup: revoke each URL when the component unmounts or images change
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleOpen = (index: number) => {
    setSelectedIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedIndex(null);
  };

  return (
    <Box>
      {/* Render the image grid */}
      <ImageList variant="masonry" cols={3} gap={8}>
        {imageURLs.map((url, index) => (
          <ImageListItem key={index} onClick={() => handleOpen(index)}>
            <img
              src={url}
              alt={`Gallery image ${index}`}
              loading="lazy"
              style={{ cursor: 'pointer', width: '100%', display: 'block' }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      {/* Modal for displaying the selected image */}
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
          {selectedIndex !== null && (
            <img
              src={imageURLs[selectedIndex]}
              alt={`Large view of image ${selectedIndex}`}
              style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', margin: '0 auto' }}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};
