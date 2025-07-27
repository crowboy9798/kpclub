import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Download, Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

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

const NewsletterManagement = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    published: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Invalid File",
          description: "Please select a PDF file",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('newsletters')
      .upload(fileName, file);

    if (error) {
      console.error('File upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('newsletters')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingNewsletter && !selectedFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      let pdfUrl = editingNewsletter?.pdf_url;
      let fileName = editingNewsletter?.file_name;
      let fileSize = editingNewsletter?.file_size;

      // Upload new file if selected
      if (selectedFile) {
        pdfUrl = await uploadFile(selectedFile);
        if (!pdfUrl) {
          toast({
            title: "Error",
            description: "Failed to upload PDF file",
            variant: "destructive"
          });
          return;
        }
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
      }

      if (editingNewsletter) {
        // Update existing newsletter
        const { error } = await supabase
          .from('newsletters')
          .update({
            title: formData.title,
            description: formData.description || null,
            published: formData.published,
            ...(selectedFile && {
              pdf_url: pdfUrl,
              file_name: fileName,
              file_size: fileSize
            })
          })
          .eq('id', editingNewsletter.id);

        if (error) {
          console.error('Error updating newsletter:', error);
          toast({
            title: "Error",
            description: "Failed to update newsletter",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Success",
          description: "Newsletter updated successfully"
        });
      } else {
        // Create new newsletter
        const { error } = await supabase
          .from('newsletters')
          .insert({
            title: formData.title,
            description: formData.description || null,
            pdf_url: pdfUrl!,
            file_name: fileName!,
            file_size: fileSize!,
            published: formData.published
          });

        if (error) {
          console.error('Error creating newsletter:', error);
          toast({
            title: "Error",
            description: "Failed to create newsletter",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Success",
          description: "Newsletter created successfully"
        });
      }

      // Reset form and close dialog
      setFormData({ title: '', description: '', published: true });
      setSelectedFile(null);
      setEditingNewsletter(null);
      setIsDialogOpen(false);
      fetchNewsletters();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter);
    setFormData({
      title: newsletter.title,
      description: newsletter.description || '',
      published: newsletter.published
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (newsletter: Newsletter) => {
    if (!confirm(`Are you sure you want to delete "${newsletter.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('newsletters')
        .delete()
        .eq('id', newsletter.id);

      if (error) {
        console.error('Error deleting newsletter:', error);
        toast({
          title: "Error",
          description: "Failed to delete newsletter",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Newsletter deleted successfully"
      });
      fetchNewsletters();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const togglePublished = async (newsletter: Newsletter) => {
    try {
      const { error } = await supabase
        .from('newsletters')
        .update({ published: !newsletter.published })
        .eq('id', newsletter.id);

      if (error) {
        console.error('Error updating newsletter:', error);
        toast({
          title: "Error",
          description: "Failed to update newsletter status",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Newsletter ${!newsletter.published ? 'published' : 'unpublished'} successfully`
      });
      fetchNewsletters();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openAddDialog = () => {
    setEditingNewsletter(null);
    setFormData({ title: '', description: '', published: true });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <p className="text-muted-foreground">Loading newsletters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Management</h2>
          <p className="text-muted-foreground">Manage club newsletters and PDFs</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Newsletter
        </Button>
      </div>

      <Card className="card-elegant">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newsletters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No newsletters found</p>
                  </TableCell>
                </TableRow>
              ) : (
                newsletters.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{newsletter.title}</div>
                        {newsletter.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {newsletter.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{newsletter.file_name}</TableCell>
                    <TableCell>{formatFileSize(newsletter.file_size)}</TableCell>
                    <TableCell>{formatDate(newsletter.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={newsletter.published ? "default" : "secondary"}>
                          {newsletter.published ? "Published" : "Draft"}
                        </Badge>
                        <Switch
                          checked={newsletter.published}
                          onCheckedChange={() => togglePublished(newsletter)}
                          aria-label="Toggle published status"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(newsletter.pdf_url, '_blank')}
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(newsletter)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(newsletter)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingNewsletter ? 'Edit Newsletter' : 'Add Newsletter'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Newsletter title"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the newsletter"
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="pdf">PDF File {editingNewsletter ? '(Optional - leave empty to keep current file)' : ''}</Label>
              <Input
                id="pdf"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="mt-1"
                required={!editingNewsletter}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    {editingNewsletter ? 'Updating...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {editingNewsletter ? 'Update' : 'Upload'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsletterManagement;