import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Modal, 
  IconButton, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface ImageGalleryProps {
  open: boolean;
  onClose: () => void;
  images: Uint8Array[];
  title?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  open, 
  onClose, 
  images,
  title,
}) => {
  const [enlargedIndex, setEnlargedIndex] = useState<number | null>(null);
  const [imageURLs, setImageURLs] = useState<string[]>([]);

  // Create image URLs when dialog opens
  useEffect(() => {
    if (open && images.length > 0) {
      const urls = images.map((imgData) => {
        try {
          // Create a copy of the data as a regular Uint8Array
          const data = new Uint8Array(imgData);
          const blob = new Blob([data.buffer as ArrayBuffer], { type: 'image/jpeg' });
          return URL.createObjectURL(blob);
        } catch (e) {
          console.error('Error creating blob URL:', e);
          return '';
        }
      });
      setImageURLs(urls);
    }
    
    // Cleanup when dialog closes
    return () => {
      if (!open) {
        imageURLs.forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        setImageURLs([]);
      }
    };
  }, [open, images]);

  // Cleanup all URLs when component unmounts
  useEffect(() => {
    return () => {
      imageURLs.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleEnlarge = (index: number) => {
    setEnlargedIndex(index);
  };

  const handleCloseEnlarged = () => {
    setEnlargedIndex(null);
  };

  const handlePrevImage = useCallback(() => {
    if (enlargedIndex !== null && enlargedIndex > 0) {
      setEnlargedIndex(enlargedIndex - 1);
    }
  }, [enlargedIndex]);

  const handleNextImage = useCallback(() => {
    if (enlargedIndex !== null && enlargedIndex < imageURLs.length - 1) {
      setEnlargedIndex(enlargedIndex + 1);
    }
  }, [enlargedIndex, imageURLs.length]);

  // Keyboard navigation for enlarged view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (enlargedIndex === null) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') handleCloseEnlarged();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enlargedIndex, handlePrevImage, handleNextImage]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#1a1a2e',
          color: '#f1f5f9',
          border: '1px solid rgba(124, 58, 237, 0.2)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
        bgcolor: '#0f0f1a'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PhotoLibraryIcon sx={{ color: '#7c3aed' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Image Gallery
            </Typography>
            {title && (
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                {title}
              </Typography>
            )}
          </Box>
          {images.length > 0 && (
            <Chip 
              label={`${images.length} image${images.length > 1 ? 's' : ''}`} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(124, 58, 237, 0.2)', 
                color: '#a78bfa',
                fontWeight: 600 
              }} 
            />
          )}
        </Box>
        
        <IconButton onClick={onClose} sx={{ color: '#f1f5f9' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, overflowY: 'auto' }}>
        {images.length === 0 ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#94a3b8'
          }}>
            <PhotoLibraryIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography>No images in this chapter</Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: 2 
          }}>
            {imageURLs.map((url, index) => (
              <Box 
                key={index} 
                onClick={() => handleEnlarge(index)}
                sx={{ 
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  aspectRatio: '1 / 1',
                  position: 'relative',
                  bgcolor: 'rgba(0,0,0,0.3)',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
                    zIndex: 1,
                  }
                }}
              >
                {url ? (
                  <img
                    src={url}
                    alt={`Chapter image ${index + 1}`}
                    loading="lazy"
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      console.error(`Failed to load image ${index + 1}`);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Box sx={{ 
                    width: '100%',
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.05)'
                  }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      Loading...
                    </Typography>
                  </Box>
                )}
                {/* Image number overlay */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {index + 1}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      {/* Enlarged Image Modal */}
      <Modal 
        open={enlargedIndex !== null} 
        onClose={handleCloseEnlarged}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          bgcolor: 'rgba(0,0,0,0.9)',
        }}
      >
        <Box sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}>
          {/* Close Button - Top Right Corner */}
          <IconButton
            onClick={handleCloseEnlarged}
            sx={{ 
              position: 'fixed', 
              top: 20, 
              right: 20, 
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.7)',
              zIndex: 20,
              width: 48,
              height: 48,
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.8)' }
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Previous Arrow - Fixed Left Side */}
          {imageURLs.length > 1 && enlargedIndex !== null && enlargedIndex > 0 && (
            <IconButton
              onClick={handlePrevImage}
              sx={{ 
                position: 'fixed', 
                left: 20, 
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.7)',
                zIndex: 20,
                width: 56,
                height: 56,
                '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.9)' }
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
          )}

          {/* Next Arrow - Fixed Right Side */}
          {imageURLs.length > 1 && enlargedIndex !== null && enlargedIndex < imageURLs.length - 1 && (
            <IconButton
              onClick={handleNextImage}
              sx={{ 
                position: 'fixed', 
                right: 20, 
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.7)',
                zIndex: 20,
                width: 56,
                height: 56,
                '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.9)' }
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          )}
          
          {/* Image Container */}
          {enlargedIndex !== null && imageURLs[enlargedIndex] && (
            <Box sx={{ 
              position: 'relative',
              maxWidth: 'calc(100vw - 160px)',
              maxHeight: 'calc(100vh - 100px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={imageURLs[enlargedIndex]}
                alt={`Enlarged view ${enlargedIndex + 1}`}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 'calc(100vh - 100px)', 
                  display: 'block', 
                  boxShadow: '0 0 60px rgba(0,0,0,0.8)',
                  borderRadius: '8px',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}

          {/* Image Counter - Fixed Bottom */}
          {imageURLs.length > 1 && enlargedIndex !== null && (
            <Box sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              px: 3,
              py: 1,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 600,
              zIndex: 20,
            }}>
              {enlargedIndex + 1} / {imageURLs.length}
            </Box>
          )}
        </Box>
      </Modal>
    </Dialog>
  );
};
