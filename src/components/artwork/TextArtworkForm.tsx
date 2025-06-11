
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface TextArtworkFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const TextArtworkForm = ({ onBack, onSuccess }: TextArtworkFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState('');
  const [year, setYear] = useState('');
  const [textContent, setTextContent] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !textContent.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and text content",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase
        .from('artwork')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          medium: medium.trim() || null,
          year: year ? parseInt(year) : null,
          user_id: user.id,
          published: true,
          type: 'text',
          content: {
            text: textContent.trim()
          }
        });

      if (error) throw error;

      toast({
        title: "Text artwork created successfully!",
        description: "Your text artwork has been added to the gallery"
      });

      onSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while creating your text artwork",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">Create Text Artwork</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-content">Text Content *</Label>
        <Textarea
          id="text-content"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Enter your creative text content..."
          rows={8}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter artwork title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your text artwork (optional)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="medium">Medium</Label>
          <Input
            id="medium"
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
            placeholder="e.g., Poetry, Prose, Flash Fiction"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g., 2024"
            min="1000"
            max="9999"
          />
        </div>
      </div>

      <Button type="submit" disabled={uploading} className="w-full">
        {uploading ? "Creating..." : "Create Text Artwork"}
      </Button>
    </form>
  );
};

export default TextArtworkForm;
