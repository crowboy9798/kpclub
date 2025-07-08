-- Create events table for admin management
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date_start DATE NOT NULL,
  date_end DATE,
  time_start TIME,
  time_end TIME,
  location TEXT,
  category TEXT NOT NULL DEFAULT 'Social',
  featured BOOLEAN NOT NULL DEFAULT false,
  max_attendees INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Events are viewable by everyone" 
ON public.events 
FOR SELECT 
USING (true);

-- Create policies for admin management (simplified for demo)
CREATE POLICY "Anyone can insert events" 
ON public.events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update events" 
ON public.events 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete events" 
ON public.events 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample events
INSERT INTO public.events (title, description, date_start, time_start, time_end, location, category, featured) VALUES
('Monthly Social Gathering', 'Join us for our monthly social meeting with coffee, light refreshments, and community updates. A perfect opportunity to catch up with fellow members and welcome newcomers.', '2024-12-15', '14:00', '16:00', 'Kensington Community Center - Main Hall', 'Social', true),
('Holiday Celebration', 'Celebrate the holiday season with festive activities, seasonal refreshments, live music, and good cheer. Bring your family and friends for an evening of joy and community spirit.', '2024-12-20', '18:00', '21:00', 'Kensington Community Center - Main Hall', 'Special Event', true),
('Guest Speaker Series: Local History', 'Join renowned historian Dr. Sarah Williams for a fascinating presentation on the rich heritage and history of our local area. Light refreshments will be served.', '2025-01-08', '19:00', '20:30', 'Community Center - Conference Room', 'Educational', false),
('Coffee Morning & Book Club', 'Informal gathering for book lovers and coffee enthusiasts. This month we will be discussing "The Seven Husbands of Evelyn Hugo" by Taylor Jenkins Reid.', '2025-01-15', '10:00', '12:00', 'Local Café - Main Street', 'Social', false),
('Community Service Day', 'Give back to our community by participating in park cleanup and beautification activities. Tools and refreshments provided. Suitable for all fitness levels.', '2025-01-22', '09:00', '13:00', 'Kensington Park', 'Community Service', false),
('Wine Tasting Evening', 'Enjoy an elegant evening of wine tasting featuring local vineyards. Professional sommelier will guide us through wine selections paired with artisanal cheeses.', '2025-02-05', '19:00', '21:30', 'The Vineyard Restaurant', 'Social', false);