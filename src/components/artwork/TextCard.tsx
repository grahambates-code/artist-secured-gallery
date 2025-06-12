
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

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

interface TextCardProps {
  artwork: Artwork;
  canDelete: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const TextCard = ({ artwork, canDelete, onClick, onDelete }: TextCardProps) => {
  const textContent = artwork.content?.text || '';
  const previewText = textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent;

  return (
    <Card 
      className="gallery-card group hover:bg-accent/50 transition-colors relative cursor-pointer"
      onClick={onClick}
    >
      {/* Force square aspect ratio to match other cards */}
      <div className="w-full aspect-square relative">
        <div className="relative overflow-hidden bg-card border border-border transition-all duration-300 hover:border-foreground w-full h-full p-6 flex items-center justify-center">
          <div className="text-center w-full h-full flex flex-col justify-center">
            <div className="prose prose-sm max-w-none text-foreground leading-relaxed overflow-hidden">
              <div className="whitespace-pre-wrap text-sm line-clamp-6">
                {previewText || 'No text content'}
              </div>
            </div>
          </div>
          
          {canDelete && (
            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="destructive"
                onClick={onDelete}
                className="h-8 w-8 p-0 bg-destructive/90 hover:bg-destructive backdrop-blur-sm"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Metadata overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-light text-lg mb-1 truncate">{artwork.title}</h3>
            <div className="flex items-center justify-between text-white/80 text-sm">
              <span>{artwork.year || 'Year not specified'}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                Text
              </span>
            </div>
          </div>

          {/* Minimal corner indicator */}
          <div className="absolute top-6 right-6 w-0 h-0 border-l border-b border-foreground/0 group-hover:border-foreground/60 group-hover:w-3 group-hover:h-3 transition-all duration-200 ease-out delay-200 pointer-events-none"></div>
        </div>
      </div>
    </Card>
  );
};

export default TextCard;
