CREATE POLICY "Temp: anyone can insert" ON public.capability_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Temp: anyone can update" ON public.capability_posts FOR UPDATE USING (true);
CREATE POLICY "Temp: anyone can delete" ON public.capability_posts FOR DELETE USING (true);
CREATE POLICY "All posts visible for editing" ON public.capability_posts FOR SELECT USING (true);