-- Create newsletters table
CREATE TABLE public.newsletters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    pdf_url text NOT NULL,
    file_name text NOT NULL,
    file_size integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    published boolean DEFAULT true NOT NULL
);

-- Enable RLS
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletters
CREATE POLICY "Newsletters are viewable by everyone" 
ON public.newsletters 
FOR SELECT 
USING (published = true);

CREATE POLICY "Only authenticated users can manage newsletters" 
ON public.newsletters 
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_newsletters_updated_at
    BEFORE UPDATE ON public.newsletters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for newsletters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('newsletters', 'newsletters', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for newsletters
CREATE POLICY "Newsletter PDFs are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'newsletters');

CREATE POLICY "Authenticated users can upload newsletters" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'newsletters' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update newsletters" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'newsletters' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete newsletters" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'newsletters' AND auth.uid() IS NOT NULL);