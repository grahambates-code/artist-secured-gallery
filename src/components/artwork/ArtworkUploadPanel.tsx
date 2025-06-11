
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Upload } from 'lucide-react';
import ArtworkTypeSelector from './ArtworkTypeSelector';
import TextArtworkForm from './TextArtworkForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon } from 'lucide-react';

interface ArtworkUploadPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: () => void;
}

const ArtworkUploadPanel = ({ open, onOpenChange, onUploadSuccess }: ArtworkUploadPanelProps) => {
  const [selectedType, setSelectedType] = useState<'image' | 'text' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [medium, setMedium] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMedium('');
    setYear('');
    setFile(null);
    setPreviewUrl('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select an image",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artwork-images')
        .upload(fileName, file, {
          metadata: {
            user_id: user.id
          }
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artwork-images')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('artwork')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          medium: medium.trim() || null,
          year: year ? parseInt(year) : null,
          user_id: user.id,
          published: true,
          type: 'image',
          content: {
            image_url: publicUrl
          }
        });

      if (dbError) throw dbError;

      toast({
        title: "Artwork uploaded successfully!",
        description: "Your artwork has been added to the gallery"
      });

      resetForm();
      onOpenChange(false);
      onUploadSuccess?.();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading your artwork",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTypeSelect = (type: 'image' | 'text') => {
    setSelectedType(type);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleSuccess = () => {
    setSelectedType(null);
    onOpenChange(false);
    onUploadSuccess?.();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedType(null);
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Artwork
          </SheetTitle>
          <SheetDescription>
            Share your creative work with the community
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {!selectedType && (
            <ArtworkTypeSelector onTypeSelect={handleTypeSelect} />
          )}
          
          {selectedType === 'text' && (
            <TextArtworkForm 
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          )}
          
          {selectedType === 'image' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Artwork Image *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                      <div>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Choose File
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                          PNG, JPG, WEBP, or GIF (max 50MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
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
                  placeholder="Describe your artwork (optional)"
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
                    placeholder="e.g., Oil on canvas, Digital"
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
                {uploading ? "Uploading..." : "Upload Artwork"}
              </Button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ArtworkUploadPanel;
