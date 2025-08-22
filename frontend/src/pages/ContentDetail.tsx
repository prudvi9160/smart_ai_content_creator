import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { contentService, type ContentResponse } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

export const ContentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<ContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      try {
        const data = await contentService.getContentById(id);
        setContent(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch content details. Please try again.',
          variant: 'destructive',
        });
        navigate('/content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id, navigate, toast]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!content) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold mb-4">Content Not Found</h1>
        <Button onClick={() => navigate('/content')}>Back to List</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        onClick={() => navigate('/content')}
        className="mb-6"
      >
        Back to List
      </Button>

      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{content.topic}</h1>
            <div className="flex items-center gap-4">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary">
                {content.type}
              </span>
              <span className="text-sm text-muted-foreground">
                Created on {new Date(content.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {content.imageUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={content.imageUrl}
                alt={content.topic}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">Generated Content</h2>
            <div className="whitespace-pre-wrap rounded-lg bg-muted p-4">
              {content.content}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => navigator.clipboard.writeText(content.content)}
            >
              Copy Content
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
