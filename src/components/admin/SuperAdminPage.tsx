
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Image as ImageIcon, User, Calendar, Mail } from 'lucide-react';

interface ArtworkWithProfile {
  id: string;
  title: string;
  description: string | null;
  medium: string | null;
  year: number | null;
  image_url: string;
  published: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    email: string | null;
    artist_name: string | null;
  } | null;
}

const SuperAdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<ArtworkWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllArtworks();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    console.log('Checking admin status for user:', user.email);
    
    // Check if user email is mogmog@gmail.com
    const adminStatus = user.email === 'mogmog@gmail.com';
    console.log('Admin status:', adminStatus);
    setIsAdmin(adminStatus);
    
    if (!adminStatus) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive"
      });
    }
  };

  const fetchAllArtworks = async () => {
    try {
      console.log('Fetching all artworks with inner join...');
      
      const { data, error } = await supabase
        .from('artwork')
        .select(`
          *,
          profiles!inner (
            email,
            artist_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Artwork data with profiles (inner join):', data);
      setArtworks(data || []);
    } catch (error: any) {
      console.error('Error fetching artworks:', error);
      toast({
        title: "Error loading artworks",
        description: error.message || "Failed to load artwork data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground font-light">Please log in to access this page.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md gallery-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive font-light tracking-wide">
              <Shield className="h-5 w-5" />
              ACCESS DENIED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground font-light">You don't have permission to access the admin panel.</p>
            <p className="text-sm text-muted-foreground mt-2 font-light">Current email: {user.email}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-[0.3em] flex items-center gap-2 mb-2 text-foreground">
            <Shield className="h-8 w-8 text-accent-foreground" />
            SUPER ADMIN PANEL
          </h1>
          <p className="text-muted-foreground font-light tracking-wide">Manage all artwork submissions across the platform</p>
          <p className="text-sm text-muted-foreground font-light">Logged in as: {user.email}</p>
        </div>

        <div className="mb-6">
          <Card className="gallery-card">
            <CardHeader>
              <CardTitle className="text-foreground font-light tracking-wide">STATISTICS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-accent rounded-lg">
                  <div className="text-2xl font-light text-accent-foreground">{artworks.length}</div>
                  <div className="text-sm text-muted-foreground font-light tracking-wide">Total Artworks</div>
                </div>
                <div className="text-center p-4 bg-accent rounded-lg">
                  <div className="text-2xl font-light text-accent-foreground">
                    {artworks.filter(a => a.published).length}
                  </div>
                  <div className="text-sm text-muted-foreground font-light tracking-wide">Published</div>
                </div>
                <div className="text-center p-4 bg-accent rounded-lg">
                  <div className="text-2xl font-light text-accent-foreground">
                    {new Set(artworks.map(a => a.user_id)).size}
                  </div>
                  <div className="text-sm text-muted-foreground font-light tracking-wide">Unique Artists</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <Card key={artwork.id} className="gallery-card overflow-hidden hover:bg-accent/50 transition-colors">
              <div className="aspect-square relative">
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={artwork.published ? "default" : "secondary"} className="font-light">
                    {artwork.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-light text-lg mb-2 text-foreground tracking-wide">{artwork.title}</h3>
                
                {artwork.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 font-light">
                    {artwork.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-light text-foreground">
                      {artwork.profiles?.artist_name || 'Unknown Artist'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground font-light">
                      {artwork.profiles?.email || 'No email'}
                    </span>
                  </div>
                  
                  {artwork.medium && (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground font-light">{artwork.medium}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-light">
                      {artwork.year || 'Year not specified'} • 
                      Added {new Date(artwork.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {artworks.length === 0 && (
          <Card className="gallery-card text-center py-12">
            <CardContent>
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-light mb-2 text-foreground tracking-wide">No artwork found</h3>
              <p className="text-muted-foreground font-light">No artwork has been uploaded yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPage;
