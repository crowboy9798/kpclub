import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Clock, MapPin, Users, Star } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date_start: string;
  date_end: string | null;
  time_start: string | null;
  time_end: string | null;
  location: string | null;
  category: string;
  featured: boolean;
  max_attendees: number | null;
  image_url: string | null;
  detailed_content: string | null;
}

interface EventFormData {
  title: string;
  description: string;
  date_start: Date | undefined;
  date_end: Date | undefined;
  time_start: string;
  time_end: string;
  location: string;
  category: string;
  featured: boolean;
  max_attendees: string;
  image_url?: string;
  detailed_content?: string;
}

interface EventManagementProps {
  isReadOnly?: boolean;
}

const EventManagement = ({ isReadOnly = false }: EventManagementProps) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date_start: undefined,
    date_end: undefined,
    time_start: '',
    time_end: '',
    location: '',
    category: 'Social',
    featured: false,
    max_attendees: '',
    image_url: '',
    detailed_content: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date_start', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date_start: undefined,
      date_end: undefined,
      time_start: '',
      time_end: '',
      location: '',
      category: 'Social',
      featured: false,
      max_attendees: '',
      image_url: '',
      detailed_content: ''
    });
    setEditingEvent(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  const handleImagePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (!file) continue;

        try {
          const fileName = `pasted-${Date.now()}.png`;
          const { data, error } = await supabase.storage
            .from('event-images')
            .upload(fileName, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(fileName);

          // Add image markdown to the detailed content
          const imageMarkdown = `\n\n![Event Image](${publicUrl})\n\n`;
          setFormData({ 
            ...formData, 
            detailed_content: (formData.detailed_content || '') + imageMarkdown 
          });
          
          toast({
            title: "Success",
            description: "Image pasted successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to paste image",
            variant: "destructive"
          });
        }
        break;
      }
    }
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date_start: event.date_start ? new Date(event.date_start) : undefined,
      date_end: event.date_end ? new Date(event.date_end) : undefined,
      time_start: event.time_start || '',
      time_end: event.time_end || '',
      location: event.location || '',
      category: event.category,
      featured: event.featured,
      max_attendees: event.max_attendees?.toString() || '',
      image_url: event.image_url || '',
      detailed_content: event.detailed_content || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date_start) {
      toast({
        title: "Error",
        description: "Start date is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const eventData = {
        title: formData.title,
        description: formData.description || null,
        date_start: formData.date_start.getFullYear() + '-' + 
          String(formData.date_start.getMonth() + 1).padStart(2, '0') + '-' + 
          String(formData.date_start.getDate()).padStart(2, '0'),
        date_end: formData.date_end ? 
          formData.date_end.getFullYear() + '-' + 
          String(formData.date_end.getMonth() + 1).padStart(2, '0') + '-' + 
          String(formData.date_end.getDate()).padStart(2, '0') : null,
        time_start: formData.time_start || null,
        time_end: formData.time_end || null,
        location: formData.location || null,
        category: formData.category,
        featured: formData.featured,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        image_url: formData.image_url || null,
        detailed_content: formData.detailed_content || null
      };

      let error;
      if (editingEvent) {
        const { error: updateError } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('events')
          .insert([eventData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Event ${editingEvent ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingEvent ? 'update' : 'create'} event`,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Social':
        return 'bg-secondary/20 text-secondary-foreground';
      case 'Educational':
        return 'bg-primary/20 text-primary';
      case 'Special Event':
        return 'bg-red-100 text-red-800';
      case 'Community Service':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading events...</div>;
  }

  return (
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-primary">Event Management</h2>
        {!isReadOnly && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Event
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Optional - Add event description"
                  />
                </div>

                <div>
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date_start && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date_start ? format(formData.date_start, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date_start}
                        onSelect={(date) => setFormData({ ...formData, date_start: date })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date_end && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date_end ? format(formData.date_end, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date_end}
                        onSelect={(date) => setFormData({ ...formData, date_end: date })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="time_start">Start Time</Label>
                  <Input
                    id="time_start"
                    type="time"
                    value={formData.time_start}
                    onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="time_end">End Time</Label>
                  <Input
                    id="time_end"
                    type="time"
                    value={formData.time_end}
                    onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Educational">Educational</SelectItem>
                      <SelectItem value="Special Event">Special Event</SelectItem>
                      <SelectItem value="Community Service">Community Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max_attendees">Max Attendees</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Featured Event</Label>
                </div>

                {formData.featured && (
                  <>
                     <div className="md:col-span-2">
                       <Label htmlFor="detailed_content">Detailed Event Write-up</Label>
                       <p className="text-xs text-muted-foreground mb-2">
                         💡 Tip: You can paste images directly (Ctrl+V) into this text area!
                       </p>
                       <Textarea
                         id="detailed_content"
                         value={formData.detailed_content || ''}
                         onChange={(e) => setFormData({ ...formData, detailed_content: e.target.value })}
                         onPaste={handleImagePaste}
                         rows={6}
                         placeholder="Add detailed information about this featured event... You can also paste images directly here!"
                       />
                     </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="image_upload">Event Image (JPG, PNG, PDF)</Label>
                      <Input
                        id="image_upload"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                      />
                      {formData.image_url && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Current file: <a href={formData.image_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View file</a>
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="card-elegant">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
                  <div className="flex items-center space-x-2">
                   {event.featured && <Star className="w-4 h-4 text-secondary" />}
                   {!isReadOnly && (
                     <>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => openEditDialog(event)}
                       >
                         <Edit2 className="w-4 h-4" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleDelete(event.id)}
                         className="text-destructive hover:text-destructive"
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </>
                   )}
                 </div>
              </div>

              <h3 className="text-lg font-semibold text-primary mb-2">{event.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <CalendarIcon className="w-3 h-3 mr-2 text-primary" />
                  {format(new Date(event.date_start), 'PPP')}
                </div>
                {event.time_start && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 mr-2 text-primary" />
                    {event.time_start} {event.time_end && `- ${event.time_end}`}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-2 text-primary" />
                    {event.location}
                  </div>
                )}
                {event.max_attendees && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="w-3 h-3 mr-2 text-primary" />
                    Max: {event.max_attendees} attendees
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <Card className="card-elegant">
          <CardContent className="p-8 text-center">
            <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">No Events</h3>
            <p className="text-muted-foreground">
              Get started by creating your first event.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventManagement;