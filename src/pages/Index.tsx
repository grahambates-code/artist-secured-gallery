
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GalleryHeader from '@/components/gallery/GalleryHeader';
import GalleryContent from '@/components/gallery/GalleryContent';
import ArtworkUploadPanel from '@/components/artwork/ArtworkUploadPanel';
import ArtworkViewPanel from '@/components/artwork/ArtworkViewPanel';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useArtworkData } from '@/hooks/useArtworkData';

const Index = () => {
  const { user, loading } = useAuth();
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false);
  const [viewPanelOpen, setViewPanelOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);

  const { data: artworkData, isLoading: artworkLoading, refetch: refetchArtwork } = useArtworkData(user);

  const handleArtworkClick = (artwork: any) => {
    setSelectedArtwork(artwork);
    setViewPanelOpen(true);
  };

  const handleUploadSuccess = () => {
    refetchArtwork();
  };

  const handleArtworkDeleted = () => {
    refetchArtwork();
  };

  const handleArtworkUpdated = () => {
    refetchArtwork();
  };

  const handleSignInClick = () => {
    window.location.href = '/auth';
  };

  const handleUploadClick = () => {
    setUploadPanelOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GalleryHeader 
        user={user}
        onUploadClick={handleUploadClick}
        onSignInClick={handleSignInClick}
      />

      <GalleryContent 
        user={user}
        artworkData={artworkData}
        artworkLoading={artworkLoading}
        onArtworkClick={handleArtworkClick}
        onArtworkDeleted={handleArtworkDeleted}
      />

      {/* Slide-in Upload Panel - Show for all authenticated users including super admin */}
      {user && (
        <ArtworkUploadPanel 
          open={uploadPanelOpen} 
          onOpenChange={setUploadPanelOpen}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
      
      {/* Artwork View Panel for detailed view */}
      <ArtworkViewPanel 
        open={viewPanelOpen} 
        onOpenChange={setViewPanelOpen}
        artwork={selectedArtwork}
        onArtworkDeleted={handleArtworkDeleted}
        onArtworkUpdated={handleArtworkUpdated}
      />
    </div>
  );
};

export default Index;
