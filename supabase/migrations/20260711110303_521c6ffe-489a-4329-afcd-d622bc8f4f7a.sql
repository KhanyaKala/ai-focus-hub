
CREATE TABLE public.ms_connections (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ms_email TEXT,
  ms_display_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ms_connections TO authenticated;
GRANT ALL ON public.ms_connections TO service_role;

ALTER TABLE public.ms_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own MS connection"
  ON public.ms_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.ms_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER ms_connections_updated
BEFORE UPDATE ON public.ms_connections
FOR EACH ROW EXECUTE FUNCTION public.ms_touch_updated_at();
