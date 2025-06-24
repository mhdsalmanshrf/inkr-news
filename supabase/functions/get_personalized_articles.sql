
CREATE OR REPLACE FUNCTION public.get_personalized_articles(
  user_id uuid, 
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, 
  title text, 
  subtitle text, 
  content text, 
  summary text, 
  ai_summary text, 
  source text, 
  category text, 
  ai_tags text[], 
  is_live boolean, 
  is_trending boolean, 
  reading_time integer, 
  view_count integer, 
  published_at timestamp with time zone, 
  is_bookmarked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
      a.is_trending = true
      OR
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
      NOT EXISTS (SELECT 1 FROM public.user_interests WHERE user_id = get_personalized_articles.user_id)
    )
  ORDER BY 
    CASE WHEN a.is_trending THEN 1 ELSE 2 END,
    a.published_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$function$
