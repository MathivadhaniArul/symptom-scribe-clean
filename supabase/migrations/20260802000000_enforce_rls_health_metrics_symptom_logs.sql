-- Enforce Row Level Security (RLS) policies on health_metrics, symptom_logs, and symptom_history tables

-- 1. Ensure symptom_logs table exists and is secured with RLS
CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT,
  severity_level TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "symptom_logs_own_rows" ON public.symptom_logs;
CREATE POLICY "symptom_logs_own_rows" ON public.symptom_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Enable Row Level Security and enforce owner access policies on health_metrics table
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "health_metrics_own_rows" ON public.health_metrics;
CREATE POLICY "health_metrics_own_rows" ON public.health_metrics
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Enable Row Level Security and enforce owner access policies on symptom_history table
ALTER TABLE public.symptom_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "symptom_history_own_rows" ON public.symptom_history;
CREATE POLICY "symptom_history_own_rows" ON public.symptom_history
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
