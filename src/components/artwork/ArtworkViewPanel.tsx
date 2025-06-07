
import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, Palette } from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  description: string | null;
  medium: string | null;
  year: number | null;
  image_url: string;
  created_at: string;
  profiles?: {
    email: string;
    artist_name: string | null;
  };
}

interface ArtworkViewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artwork: Artwork | null;
}

const ArtworkViewPanel = ({ open, onOpenChange, artwork }: ArtworkViewPanelProps) => {
  if (!artwork) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{artwork.title}</SheetTitle>
          <SheetDescription className="text-left">
            Artwork details
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Artwork Image */}
          <div className="w-full">
            <img 
              src={artwork.image_url} 
              alt={artwork.title}
              className="w-full h-auto max-h-96 object-contain rounded-lg border"
            />
          </div>

          {/* Artwork Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Details</h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {artwork.profiles?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Artist:</span>
                    <span className="font-mono">{artwork.profiles.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Uploaded:</span>
                  <span>{new Date(artwork.created_at).toLocaleDateString()}</span>
                </div>

                {artwork.medium && (
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Medium:</span>
                    <Badge variant="secondary">{artwork.medium}</Badge>
                  </div>
                )}

                {artwork.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Year:</span>
                    <span>{artwork.year}</span>
                  </div>
                )}
              </div>
            </div>

            {artwork.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{artwork.description}</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ArtworkViewPanel;
