
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, FileText } from 'lucide-react';

interface ArtworkTypeSelectorProps {
  onTypeSelect: (type: 'image' | 'text') => void;
}

const ArtworkTypeSelector = ({ onTypeSelect }: ArtworkTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Choose Artwork Type</h3>
        <p className="text-muted-foreground">Select the type of artwork you want to create</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onTypeSelect('image')}
        >
          <CardContent className="p-6 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h4 className="font-medium mb-2">Image Artwork</h4>
            <p className="text-sm text-muted-foreground">
              Upload photos, paintings, drawings, or digital art
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onTypeSelect('text')}
        >
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h4 className="font-medium mb-2">Text Artwork</h4>
            <p className="text-sm text-muted-foreground">
              Create poetry, stories, or written creative works
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArtworkTypeSelector;
