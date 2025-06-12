
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');
    const x = parseInt(url.searchParams.get('x') || '0');
    const y = parseInt(url.searchParams.get('y') || '0');
    const width = parseInt(url.searchParams.get('width') || '100');
    const height = parseInt(url.searchParams.get('height') || '100');
    const bucket = url.searchParams.get('bucket') || 'artwork-images';

    if (!path) {
      return new Response('Missing path parameter', { 
        status: 400,
        headers: corsHeaders
      });
    }

    console.log(`Cropping image: ${path} at (${x}, ${y}) with size ${width}x${height}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the original image
    const { data: imageData, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      console.error('Error downloading image:', error);
      return new Response('Image not found', { 
        status: 404,
        headers: corsHeaders
      });
    }

    // Convert blob to array buffer
    const arrayBuffer = await imageData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Create a simple crop function using Canvas API simulation
    // Note: This is a basic implementation. For production use, consider using a proper image processing library
    const croppedImageData = await cropImage(uint8Array, x, y, width, height);

    return new Response(croppedImageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error in crop-image function:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders
    });
  }
});

async function cropImage(imageData: Uint8Array, x: number, y: number, width: number, height: number): Promise<Uint8Array> {
  // This is a simplified version. In a real implementation, you'd use a proper image processing library
  // For now, we'll return the original image data as a placeholder
  // You can integrate libraries like 'imagescript' or use WebAssembly-based solutions
  
  console.log('Cropping parameters:', { x, y, width, height });
  
  // Placeholder: return original image data
  // TODO: Implement actual cropping logic with a proper image library
  return imageData;
}
