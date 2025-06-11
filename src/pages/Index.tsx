import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import GalleryHeader from '@/components/gallery/GalleryHeader';
import GalleryContent from '@/components/gallery/GalleryContent';
import ArtworkUploadPanel from '@/components/artwork/ArtworkUploadPanel';
import ArtworkViewPanel from '@/components/artwork/ArtworkViewPanel';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useArtworkData } from '@/hooks/useArtworkData';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false);
  const [viewPanelOpen, setViewPanelOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);

  const isAdmin = user?.email === 'mogmog@gmail.com';

  // Redirect super admin to admin panel
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

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
    navigate('/auth');
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

  // Don't render anything for admin users as they'll be redirected
  if (user && isAdmin) {
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

      {/* Slide-in Upload Panel - Only show if user is authenticated */}
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
