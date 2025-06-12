
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import sharp from 'https://deno.land/x/sharp@0.32.6/mod.ts'

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
    
    // Use Sharp to crop the image
    const croppedImageBuffer = await sharp(new Uint8Array(arrayBuffer))
      .extract({ 
        left: x, 
        top: y, 
        width: width, 
        height: height 
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log(`Successfully cropped image. Original size: ${arrayBuffer.byteLength}, Cropped size: ${croppedImageBuffer.length}`);

    return new Response(croppedImageBuffer, {
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
