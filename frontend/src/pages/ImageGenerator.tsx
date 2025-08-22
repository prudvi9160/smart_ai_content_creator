import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { contentService } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PexelsImage {
  url: string;
  photographer: string;
  alt: string;
}

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<PexelsImage[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      toast({
        title: 'Missing Prompt',
        description: 'Please enter a search term for images.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await contentService.getPexelsImages(prompt, 12);
      setImages(response);
      toast({
        title: 'Images Found',
        description: 'Successfully fetched images from Pexels.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveImage = async (image: PexelsImage) => {
    try {
      await contentService.generateContent({
        topic: image.alt || prompt,
        type: 'image',
        imageUrl: image.url,
        content: `Image by ${image.photographer} on Pexels\nDescription: ${image.alt}`
      });
      
      toast({
        title: 'Image Saved',
        description: 'The image has been saved to your collection.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save image. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-gradient">Image Search</h1>
      
      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            placeholder="Enter search terms for images..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search Images'}
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <LoadingSpinner />
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <Card key={index} className="overflow-hidden group">
              <div className="relative aspect-[4/3]">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <Button 
                    onClick={() => handleSaveImage(image)}
                    variant="secondary"
                  >
                    Save to Collection
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">
                  Photo by {image.photographer}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Enter a search term to find images from Pexels
        </div>
      )}
    </div>
  );
};
