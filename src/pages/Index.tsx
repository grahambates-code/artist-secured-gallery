
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import UserProfile from '@/components/auth/UserProfile';
import { Palette, Heart, Share2, Upload, Shield } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  const isAdmin = user.email === 'mogmog@gmail.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Art Gallery
          </h1>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/upload')} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Art
            </Button>
            {isAdmin && (
              <Button 
                onClick={() => navigate('/admin')} 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome back, {user.user_metadata?.full_name || user.user_metadata?.name || 'Artist'}!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your creative journey continues here. Share your artwork, discover new pieces, and connect with fellow artists.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Palette className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Create & Upload</CardTitle>
              <CardDescription>
                Share your latest artwork with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/upload')}>
                Upload Artwork
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="h-8 w-8 text-pink-600 mb-2" />
              <CardTitle>Discover Art</CardTitle>
              <CardDescription>
                Explore amazing artwork from talented artists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Browse Gallery</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Share2 className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Connect</CardTitle>
              <CardDescription>
                Follow artists and build your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Find Artists</Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Access */}
        {isAdmin && (
          <Card className="mb-12 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Shield className="h-5 w-5" />
                Admin Access
              </CardTitle>
              <CardDescription className="text-yellow-700">
                You have super admin privileges and can view all artwork submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/admin')} 
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Access Admin Panel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Activity</CardTitle>
            <CardDescription>
              Keep track of your artwork and interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              No recent activity yet. Start by uploading your first artwork!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;
