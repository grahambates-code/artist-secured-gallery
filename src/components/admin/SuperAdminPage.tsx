
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Image as ImageIcon, User, Calendar } from 'lucide-react';

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
  user_email: string | null;
  artist_name: string | null;
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
      console.log('Fetching all artworks...');
      
      // First get all artwork
      const { data: artworkData, error: artworkError } = await supabase
        .from('artwork')
        .select('*')
        .order('created_at', { ascending: false });

      if (artworkError) throw artworkError;

      console.log('Artwork data:', artworkData);

      // Then get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, artist_name');

      if (profilesError) throw profilesError;

      console.log('Profiles data:', profilesData);

      // Manually join the data
      const artworksWithProfiles: ArtworkWithProfile[] = (artworkData || []).map(artwork => {
        const profile = profilesData?.find(p => p.id === artwork.user_id);
        return {
          ...artwork,
          user_email: profile?.email || null,
          artist_name: profile?.artist_name || null
        };
      });

      console.log('Merged artwork with profiles:', artworksWithProfiles);
      setArtworks(artworksWithProfiles);
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
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access the admin panel.</p>
            <p className="text-sm text-gray-500 mt-2">Current email: {user.email}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-purple-600" />
            Super Admin Panel
          </h1>
          <p className="text-gray-600">Manage all artwork submissions across the platform</p>
          <p className="text-sm text-gray-500">Logged in as: {user.email}</p>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{artworks.length}</div>
                  <div className="text-sm text-gray-600">Total Artworks</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {artworks.filter(a => a.published).length}
                  </div>
                  <div className="text-sm text-gray-600">Published</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {new Set(artworks.map(a => a.user_id)).size}
                  </div>
                  <div className="text-sm text-gray-600">Unique Artists</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <img
                  src={artwork.image_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={artwork.published ? "default" : "secondary"}>
                    {artwork.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{artwork.title}</h3>
                
                {artwork.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {artwork.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {artwork.artist_name || 'Unknown Artist'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {artwork.user_email || 'No email'}
                    </span>
                  </div>
                  
                  {artwork.medium && (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                      <span>{artwork.medium}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
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
          <Card className="text-center py-12">
            <CardContent>
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No artwork found</h3>
              <p className="text-gray-600">No artwork has been uploaded yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPage;
