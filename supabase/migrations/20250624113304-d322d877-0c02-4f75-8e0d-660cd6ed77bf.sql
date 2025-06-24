
-- Create user interests table for personalization
CREATE TABLE public.user_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interest TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Add AI-related columns to articles table
ALTER TABLE public.articles 
ADD COLUMN ai_summary TEXT,
ADD COLUMN ai_tags TEXT[],
ADD COLUMN is_trending BOOLEAN DEFAULT false,
ADD COLUMN view_count INTEGER DEFAULT 0;

-- Enable RLS for new tables
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_interests
CREATE POLICY "Users can view their own interests" 
  ON public.user_interests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interests" 
  ON public.user_interests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interests" 
  ON public.user_interests 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interests" 
  ON public.user_interests 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for bookmarks
CREATE POLICY "Users can view their own bookmarks" 
  ON public.bookmarks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
  ON public.bookmarks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
  ON public.bookmarks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update articles table to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(article_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.articles 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = article_id;
END;
$$;

-- Function to get personalized articles
CREATE OR REPLACE FUNCTION public.get_personalized_articles(user_id UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  summary TEXT,
  ai_summary TEXT,
  source TEXT,
  category TEXT,
  ai_tags TEXT[],
  is_live BOOLEAN,
  is_trending BOOLEAN,
  reading_time INTEGER,
  view_count INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  is_bookmarked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.subtitle,
    a.content,
    a.summary,
    a.ai_summary,
    a.source,
    a.category,
    a.ai_tags,
    a.is_live,
    a.is_trending,
    a.reading_time,
    a.view_count,
    a.published_at,
    (b.id IS NOT NULL) as is_bookmarked
  FROM public.articles a
  LEFT JOIN public.bookmarks b ON a.id = b.article_id AND b.user_id = get_personalized_articles.user_id
  WHERE a.is_live = true
    AND (
      -- Show trending articles
      a.is_trending = true
      OR
      -- Show articles matching user interests
      EXISTS (
        SELECT 1 FROM public.user_interests ui 
        WHERE ui.user_id = get_personalized_articles.user_id 
        AND (
          LOWER(a.category) LIKE '%' || LOWER(ui.interest) || '%'
          OR 
          EXISTS (
            SELECT 1 FROM unnest(a.ai_tags) as tag 
            WHERE LOWER(tag) LIKE '%' || LOWER(ui.interest) || '%'
          )
        )
      )
      OR
      -- If user has no interests, show all articles
      NOT EXISTS (SELECT 1 FROM public.user_interests WHERE user_id = get_personalized_articles.user_id)
    )
  ORDER BY 
    CASE WHEN a.is_trending THEN 1 ELSE 2 END,
    a.published_at DESC
  LIMIT limit_count;
END;
$$;
