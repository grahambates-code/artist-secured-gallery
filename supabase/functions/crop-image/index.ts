
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
    
    // Use ImageScript for image processing (works in Deno)
    const { decode, encode, crop } = await import('https://deno.land/x/imagescript@1.2.15/mod.ts');
    
    // Decode the image
    const image = decode(new Uint8Array(arrayBuffer));
    
    // Crop the image
    const croppedImage = crop(image, x, y, width, height);
    
    // Encode back to JPEG
    const croppedBuffer = encode(croppedImage, 'jpeg', 90);

    console.log(`Successfully cropped image. Original size: ${arrayBuffer.byteLength}, Cropped size: ${croppedBuffer.length}`);

    return new Response(croppedBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error in crop-image function:', error);
    return new Response(`Internal server error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders
    });
  }
});
