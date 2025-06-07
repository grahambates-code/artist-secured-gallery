
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse w-12 h-12 border-2 border-foreground border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground font-light tracking-wide">LOADING</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Geometric Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-border opacity-60"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-px bg-border opacity-40"></div>
        <div className="absolute bottom-1/4 left-1/3 w-px h-24 bg-border opacity-50"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-px bg-border opacity-30"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Main Gallery Branding - Left Aligned */}
          <div className="text-left mb-16">
            <div className="inline-block border border-border p-8 mb-8">
              <h1 className="text-5xl font-light tracking-[0.3em] text-foreground mb-2">
                GALLERY
              </h1>
              <div className="w-full h-px bg-border mb-2"></div>
              <p className="text-xs font-light tracking-[0.2em] text-muted-foreground uppercase">
                Curated Digital Art Space
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="gallery-card bg-card/80 backdrop-blur-sm border border-border">
            <CardHeader className="text-left pb-8">
              <CardTitle className="text-xl font-light tracking-[0.15em] text-foreground mb-4">
                ARTIST ACCESS
              </CardTitle>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border"></div>
                <div className="w-2 h-2 border border-border"></div>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <CardDescription className="text-muted-foreground font-light text-sm tracking-wide leading-relaxed">
                Join our curated community of digital artists.<br />
                Showcase your work in a minimalist gallery environment.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 pt-0">
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full group relative overflow-hidden bg-transparent text-muted-foreground border border-border hover:bg-muted hover:text-foreground font-light tracking-[0.05em] py-3 text-sm transition-all duration-200"
                variant="outline"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-4 h-4 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </div>
              </Button>

              {/* Decorative Elements */}
              <div className="flex items-center justify-center space-x-6 text-border">
                <div className="w-3 h-3 border border-current"></div>
                <div className="w-1 h-1 bg-current"></div>
                <div className="w-3 h-3 border border-current"></div>
              </div>

              <div className="text-left">
                <p className="text-xs text-muted-foreground font-light tracking-wide">
                  By continuing, you agree to our terms
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-left mt-12">
            <p className="text-xs text-muted-foreground font-light tracking-[0.15em]">
              EST. 2024 — DIGITAL ART COLLECTIVE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
