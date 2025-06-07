
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Artwork {
  id: string;
  title: string;
  image_url: string;
  description?: string;
  medium?: string;
  year?: number;
  created_at: string;
  user_id: string;
  published?: boolean;
  profiles?: {
    email: string;
    artist_name?: string;
  };
}

interface ArtworkImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artwork: Artwork | null;
}

const ArtworkImageDialog = ({ open, onOpenChange, artwork }: ArtworkImageDialogProps) => {
  if (!artwork) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-0 bg-transparent">
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={artwork.image_url} 
            alt={artwork.title}
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkImageDialog;
