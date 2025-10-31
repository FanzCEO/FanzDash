-- Migration: Add content_items table to match application schema
-- This table is expected by the application but was missing from the initial migration

CREATE TABLE IF NOT EXISTS public.content_items (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type VARCHAR NOT NULL, -- 'image', 'video', 'text', 'live_stream'
  url TEXT,
  content TEXT, -- for text content
  user_id UUID REFERENCES public.users(id),
  status VARCHAR NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'auto_blocked'
  risk_score DECIMAL(3, 2),
  moderator_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_items_user_id ON public.content_items(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON public.content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON public.content_items(created_at);

-- Update moderation_results to reference content_items if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'moderation_results'
  ) THEN
    CREATE TABLE public.moderation_results (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      content_id VARCHAR REFERENCES public.content_items(id) NOT NULL,
      model_type VARCHAR NOT NULL, -- 'nudenet', 'detoxify', 'pdq_hash'
      confidence DECIMAL(3, 2),
      detections JSONB,
      pdq_hash TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- Add indexes for moderation_results
CREATE INDEX IF NOT EXISTS idx_moderation_results_content_id ON public.moderation_results(content_id);
CREATE INDEX IF NOT EXISTS idx_moderation_results_created_at ON public.moderation_results(created_at);

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.moderation_results TO authenticated;
