
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/auth/UserProfile';
import ArtworkUploadPanel from '@/components/artwork/ArtworkUploadPanel';
import ArtworkViewPanel from '@/components/artwork/ArtworkViewPanel';
import ArtworkGrid from '@/components/artwork/ArtworkGrid';
import { Upload, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false);
  const [viewPanelOpen, setViewPanelOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);

  // Fetch artwork based on authentication status
  // If user is signed in, show their own artwork
  // If user is not signed in, show all published artwork
  const { data: artworkData, isLoading: artworkLoading, refetch: refetchArtwork } = useQuery({
    queryKey: ['artwork', user?.id],
    queryFn: async () => {
      if (user) {
        // Fetch user's own artwork (both published and unpublished)
        const { data, error } = await supabase
          .from('artwork')
          .select(`
            id, 
            title, 
            created_at, 
            image_url,
            description,
            medium,
            year,
            user_id,
            published,
            profiles!inner (
              email,
              artist_name
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching user artwork:', error);
          return [];
        }

        return data || [];
      } else {
        // Fetch all published artwork for non-authenticated users
        const { data, error } = await supabase
          .from('artwork')
          .select(`
            id, 
            title, 
            created_at, 
            image_url,
            description,
            medium,
            year,
            user_id,
            profiles!inner (
              email,
              artist_name
            )
          `)
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching artwork:', error);
          return [];
        }

        return data || [];
      }
    },
  });

  // Fetch user's recent artwork for the activity section
  const { data: recentArtwork, isLoading: recentLoading } = useQuery({
    queryKey: ['user-recent-artwork', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('artwork')
        .select(`
          id, 
          title, 
          created_at, 
          image_url,
          description,
          medium,
          year,
          profiles!inner (
            email,
            artist_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent artwork:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleArtworkClick = (artwork: any) => {
    setSelectedArtwork(artwork);
    setViewPanelOpen(true);
  };

  const handleUploadSuccess = () => {
    refetchArtwork();
  };

  const handleSignInClick = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent"></div>
      </div>
    );
  }

  const isAdmin = user?.email === 'mogmog@gmail.com';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                  onClick={() => setUploadPanelOpen(true)} 
                  className="gallery-button flex items-center gap-3 px-6 py-2 font-light tracking-wide"
                >
                  <Upload className="h-4 w-4" />
                  UPLOAD
                </Button>
                {isAdmin && (
                  <Button 
                    onClick={() => navigate('/admin')} 
                    className="gallery-button-outline flex items-center gap-3 px-6 py-2 font-light tracking-wide"
                    variant="outline"
                  >
                    <Shield className="h-4 w-4" />
                    ADMIN
                  </Button>
                )}
                <UserProfile />
              </>
            ) : (
              <button 
                onClick={handleSignInClick}
                className="text-muted-foreground hover:text-foreground transition-colors font-light tracking-wide text-sm underline-offset-4 hover:underline"
              >
                Artist Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Admin Access - Only show if user is admin */}
        {user && isAdmin && (
          <Card className="gallery-card mb-12 border-accent bg-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground font-light tracking-wide">
                <Shield className="h-5 w-5" />
                ADMIN ACCESS
              </CardTitle>
              <CardDescription className="text-muted-foreground font-light">
                Super admin privileges - view all artwork submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin')} 
                className="gallery-button px-6 py-2 font-light tracking-wide"
              >
                ACCESS ADMIN PANEL
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Gallery Section - Main Content */}
        <div className="mb-16">
          {artworkLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent"></div>
            </div>
          ) : artworkData && artworkData.length > 0 ? (
            <ArtworkGrid artworks={artworkData} onArtworkClick={handleArtworkClick} />
          ) : (
            <div className="text-center py-24 border border-border">
              <p className="text-muted-foreground font-light text-lg">
                {user ? 'You haven\'t uploaded any artwork yet.' : 'No artwork available in the gallery yet.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Slide-in Panels - Only show if user is authenticated */}
      {user && (
        <>
          <ArtworkUploadPanel 
            open={uploadPanelOpen} 
            onOpenChange={setUploadPanelOpen}
            onUploadSuccess={handleUploadSuccess}
          />
        </>
      )}
      
      <ArtworkViewPanel 
        open={viewPanelOpen} 
        onOpenChange={setViewPanelOpen}
        artwork={selectedArtwork}
      />
    </div>
  );
};

export default Index;
