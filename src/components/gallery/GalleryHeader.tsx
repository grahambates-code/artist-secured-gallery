
import React from 'react';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/auth/UserProfile';
import { Upload } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface GalleryHeaderProps {
  user: User | null;
  onUploadClick: () => void;
  onSignInClick: () => void;
}

const GalleryHeader = ({ user, onUploadClick, onSignInClick }: GalleryHeaderProps) => {
  return (
    <header className="gallery-header">
      <div className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-left">
          <h1 className="text-3xl font-light tracking-[0.3em] text-foreground mb-1">
            GALLERY
          </h1>
          <p className="text-xs font-light tracking-[0.2em] text-muted-foreground uppercase">
            {user ? 'Your Digital Art Collection' : 'Curated Digital Art Space'}
          </p>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Button 
                onClick={onUploadClick} 
                className="gallery-button flex items-center gap-3 px-6 py-2 font-light tracking-wide"
              >
                <Upload className="h-4 w-4" />
                UPLOAD
              </Button>
              <UserProfile />
            </>
          ) : (
            <button 
              onClick={onSignInClick}
              className="text-muted-foreground hover:text-foreground transition-colors font-light tracking-wide text-sm underline-offset-4 hover:underline"
            >
              Artist Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default GalleryHeader;
