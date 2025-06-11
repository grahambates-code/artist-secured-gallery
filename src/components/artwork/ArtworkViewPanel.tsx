import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Mail, Calendar, Palette, Trash2, FileText, Box } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ThreeViewer from './ThreeViewer';

interface Artwork {
  id: string;
  title: string;
  description: string | null;
  medium: string | null;
  year: number | null;
  created_at: string;
  user_id: string;
  type?: string;
  content?: any;
  profiles?: {
    email: string;
    artist_name: string | null;
  };
}

interface ArtworkViewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artwork: Artwork | null;
  onArtworkDeleted?: () => void;
}

const ArtworkViewPanel = ({ open, onOpenChange, artwork, onArtworkDeleted }: ArtworkViewPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!artwork) return null;

  const isOwner = user && user.id === artwork.user_id;
  const artworkType = artwork.type || 'image';
  const imageUrl = artwork.content?.image_url;
  const textContent = artwork.content?.text;
  const threeData = artwork.content;

  const handleDeleteArtwork = async () => {
    if (!user || user.id !== artwork.user_id) {
      toast({
        title: "Permission denied",
        description: "You can only delete your own artwork",
        variant: "destructive"
      });
      return;
    }

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

      // Close the panel
      onOpenChange(false);

      // Trigger refresh of artwork list
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-background border-l border-border">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-left font-light tracking-wide text-foreground">{artwork.title}</SheetTitle>
              <SheetDescription className="text-left text-muted-foreground font-light">
                Artwork details
              </SheetDescription>
            </div>
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{artwork.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteArtwork}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </SheetHeader>
        
        <div className="mt-8 space-y-8">
          {/* Artwork Content */}
          <div className="w-full">
            {artworkType === 'image' && imageUrl ? (
              <img 
                src={imageUrl} 
                alt={artwork.title}
                className="w-full h-auto max-h-96 object-contain border border-border"
              />
            ) : artworkType === 'text' && textContent ? (
              <div className="border border-border p-6 rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">Text Artwork</span>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {textContent}
                  </p>
                </div>
              </div>
            ) : artworkType === 'threejs' && threeData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Box className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-medium">Interactive 3D Scene</span>
                </div>
                <ThreeViewer sceneData={threeData} />
                <p className="text-sm text-muted-foreground">
                  Use your mouse to rotate and interact with the 3D scene
                </p>
              </div>
            ) : null}
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
