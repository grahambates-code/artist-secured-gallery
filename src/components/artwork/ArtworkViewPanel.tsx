
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Palette, Hash, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ThreeViewer2 from './ThreeViewer2';

interface Artwork {
  id: string;
  title: string;
  description?: string;
  medium?: string;
  year?: number;
  created_at: string;
  user_id: string;
  published?: boolean;
  type?: string;
  content?: any;
  profiles?: {
    email: string;
    artist_name?: string;
  };
}

interface ArtworkViewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artwork: Artwork | null;
  onArtworkDeleted?: () => void;
  onArtworkUpdated?: () => void;
}

const ArtworkViewPanel = ({ 
  open, 
  onOpenChange, 
  artwork, 
  onArtworkDeleted,
  onArtworkUpdated 
}: ArtworkViewPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!artwork) return null;

  const isOwner = user && user.id === artwork.user_id;
  const artworkType = artwork.type || 'image';

  const handleDelete = async () => {
    if (!isOwner || !artwork) return;

    try {
      const { error } = await supabase
        .from('artwork')
        .delete()
        .eq('id', artwork.id);

      if (error) throw error;

      toast({
        title: "Artwork deleted",
        description: `"${artwork.title}" has been successfully deleted`,
      });

      onOpenChange(false);
      if (onArtworkDeleted) {
        onArtworkDeleted();
      }
    } catch (error: any) {
      console.error('Error deleting artwork:', error);
      toast({
        title: "Error deleting artwork",
        description: error.message || "Failed to delete artwork",
        variant: "destructive"
      });
    }
  };

  const renderArtworkContent = () => {
    if (artworkType === 'text') {
      const textContent = artwork.content?.text || '';
      return (
        <div className="bg-card border border-border p-6 rounded-lg">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {textContent || 'No text content'}
            </div>
          </div>
        </div>
      );
    }

    if (artworkType === 'threejs') {
      return (
        <ThreeViewer2
          sceneData={artwork.content}
          artworkId={artwork.id}
          canEdit={isOwner}
          onSceneUpdate={onArtworkUpdated}
          size="large"
        />
      );
    }

    // Default to image display
    if (artwork.content?.url) {
      return (
        <div className="relative">
          <img 
            src={artwork.content.url} 
            alt={artwork.title}
            className="w-full h-auto max-h-[70vh] object-contain border border-border"
          />
        </div>
      );
    }

    return (
      <div className="bg-muted p-8 text-center text-muted-foreground">
        No content available
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[90vw] sm:max-w-none overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-2xl font-light tracking-wide mb-2">
                {artwork.title}
              </SheetTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{artwork.profiles?.artist_name || artwork.profiles?.email?.split('@')[0] || 'Unknown Artist'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{artwork.year || 'Year not specified'}</span>
                </div>
              </div>
              {artwork.description && (
                <p className="text-muted-foreground font-light leading-relaxed mb-4">
                  {artwork.description}
                </p>
              )}
            </div>
            
            {isOwner && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="font-light">
              {artworkType === 'text' ? 'Text Artwork' : 
               artworkType === 'threejs' ? '3D Scene' : 'Image'}
            </Badge>
            {artwork.medium && (
              <Badge variant="outline" className="font-light">
                <Palette className="h-3 w-3 mr-1" />
                {artwork.medium}
              </Badge>
            )}
            <Badge variant="outline" className="font-light">
              <Hash className="h-3 w-3 mr-1" />
              {artwork.id.slice(0, 8)}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {renderArtworkContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ArtworkViewPanel;
