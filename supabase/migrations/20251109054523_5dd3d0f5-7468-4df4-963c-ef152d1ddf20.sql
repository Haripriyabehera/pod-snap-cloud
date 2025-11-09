-- Create storage bucket for proof of delivery media
INSERT INTO storage.buckets (id, name, public)
VALUES ('pod-media', 'pod-media', false)
ON CONFLICT (id) DO NOTHING;

-- Create proof of delivery table
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  awb_number TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  driver_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for now - adjust based on your auth requirements)
CREATE POLICY "Anyone can view deliveries"
  ON public.deliveries
  FOR SELECT
  USING (true);

-- Allow public insert (for now - adjust based on your auth requirements)
CREATE POLICY "Anyone can create deliveries"
  ON public.deliveries
  FOR INSERT
  WITH CHECK (true);

-- Storage policies for pod-media bucket
CREATE POLICY "Anyone can upload POD media"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'pod-media');

CREATE POLICY "Anyone can view POD media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'pod-media');

-- Create index for faster AWB lookups
CREATE INDEX IF NOT EXISTS idx_deliveries_awb ON public.deliveries(awb_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_created_at ON public.deliveries(created_at DESC);