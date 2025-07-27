import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Newsletter {
  id: string;
  title: string;
  description: string | null;
  pdf_url: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
  published: boolean;
}

const Newsletter = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching newsletters:', error);
        toast({
          title: "Error",
          description: "Failed to load newsletters",
          variant: "destructive"
        });
      } else {
        setNewsletters(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load newsletters",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (newsletter: Newsletter) => {
    window.open(newsletter.pdf_url, '_blank');
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">Loading newsletters...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title mb-4">Club Newsletter</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay up to date with the latest news, events, and activities from Kensington Probus Club.
            Download our newsletters to read about member stories, upcoming events, and club updates.
          </p>
        </div>

        {/* Newsletters Grid */}
        {newsletters.length === 0 ? (
          <Card className="card-elegant text-center">
            <CardContent className="py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Newsletters Available</h3>
              <p className="text-muted-foreground">
                Check back soon for the latest club newsletters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {newsletters.map((newsletter) => (
              <Card key={newsletter.id} className="card-elegant">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-primary mb-2">
                        {newsletter.title}
                      </CardTitle>
                      {newsletter.description && (
                        <p className="text-muted-foreground mb-3">
                          {newsletter.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(newsletter.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {newsletter.file_name}
                        </div>
                        {newsletter.file_size && (
                          <span>{formatFileSize(newsletter.file_size)}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(newsletter)}
                      className="ml-4 shrink-0"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Newsletter;