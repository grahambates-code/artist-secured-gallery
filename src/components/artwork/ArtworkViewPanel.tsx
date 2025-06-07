
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
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-background border-l border-border">
        <SheetHeader>
          <SheetTitle className="text-left font-light tracking-wide text-foreground">{artwork.title}</SheetTitle>
          <SheetDescription className="text-left text-muted-foreground font-light">
            Artwork details
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-8 space-y-8">
          {/* Artwork Image */}
          <div className="w-full">
            <img 
              src={artwork.image_url} 
              alt={artwork.title}
              className="w-full h-auto max-h-96 object-contain border border-border"
            />
          </div>

          {/* Artwork Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-light tracking-wide mb-4 text-foreground">DETAILS</h3>
              <div className="grid grid-cols-1 gap-4 text-sm">
                {artwork.profiles?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-light">Artist:</span>
                    <span className="font-mono text-foreground">{artwork.profiles.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-light">Uploaded:</span>
                  <span className="text-foreground">{new Date(artwork.created_at).toLocaleDateString()}</span>
                </div>

                {artwork.medium && (
                  <div className="flex items-center gap-3">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-light">Medium:</span>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-light tracking-wide">
                      {artwork.medium}
                    </Badge>
                  </div>
                )}

                {artwork.year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-light">Year:</span>
                    <span className="text-foreground">{artwork.year}</span>
                  </div>
                )}
              </div>
            </div>

            {artwork.description && (
              <div>
                <h3 className="text-lg font-light tracking-wide mb-4 text-foreground">DESCRIPTION</h3>
                <p className="text-muted-foreground leading-relaxed font-light">{artwork.description}</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ArtworkViewPanel;
