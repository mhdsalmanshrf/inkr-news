
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { source } = await req.json()

    let rssUrl = ''
    switch (source) {
      case 'aljazeera':
        rssUrl = 'https://www.aljazeera.com/xml/rss/all.xml'
        break
      case 'bbc':
        rssUrl = 'https://feeds.bbci.co.uk/news/world/rss.xml'
        break
      case 'reuters':
        rssUrl = 'https://www.reutersagency.com/feed/?best-top-news'
        break
      default:
        throw new Error('Invalid news source')
    }

    console.log(`Fetching RSS from: ${rssUrl}`)

    // Fetch RSS feed
    const response = await fetch(rssUrl)
    const rssText = await response.text()
    
    // Simple RSS parser
    const items = parseRSSFeed(rssText, source)
    
    // Insert articles into database with AI enhancements
    const insertPromises = items.map(async (item) => {
      // Generate AI summary and tags
      const aiEnhancements = await generateAIEnhancements(item.title, item.description || '')
      
      const { data, error } = await supabaseClient
        .from('articles')
        .insert({
          title: item.title,
          content: item.description || item.title,
          summary: item.description,
          ai_summary: aiEnhancements.summary,
          ai_tags: aiEnhancements.tags,
          source: item.source,
          source_url: item.link,
          category: aiEnhancements.category || 'general',
          is_live: false,
          is_trending: aiEnhancements.isTrending,
          reading_time: Math.max(1, Math.floor((item.description?.length || 0) / 250))
        })
        .select()

      if (error) {
        console.error('Error inserting article:', error)
        return null
      }
      return data[0]
    })

    const results = await Promise.all(insertPromises)
    const successCount = results.filter(r => r !== null).length

    return new Response(
      JSON.stringify({ 
        message: `Successfully fetched ${successCount} articles from ${source}`,
        count: successCount 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in fetch-news function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function generateAIEnhancements(title: string, content: string) {
  // Simple AI categorization and tagging based on keywords
  const text = (title + ' ' + content).toLowerCase()
  
  // Category detection
  let category = 'general'
  if (text.includes('tech') || text.includes('ai') || text.includes('artificial intelligence') || text.includes('software')) {
    category = 'technology'
  } else if (text.includes('politic') || text.includes('government') || text.includes('election')) {
    category = 'politics'
  } else if (text.includes('business') || text.includes('economy') || text.includes('market') || text.includes('financial')) {
    category = 'business'
  } else if (text.includes('health') || text.includes('medical') || text.includes('doctor')) {
    category = 'health'
  } else if (text.includes('climate') || text.includes('environment') || text.includes('energy')) {
    category = 'environment'
  } else if (text.includes('sport') || text.includes('football') || text.includes('soccer')) {
    category = 'sports'
  }

  // Tag extraction
  const tags: string[] = []
  const tagKeywords = [
    'AI', 'Technology', 'Politics', 'Business', 'Health', 'Climate',
    'Energy', 'UAE', 'India', 'China', 'USA', 'Europe', 'Finance',
    'Cryptocurrency', 'Startup', 'Innovation', 'Science'
  ]
  
  tagKeywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      tags.push(keyword)
    }
  })

  // Trending detection (simple heuristic)
  const trendingKeywords = ['breaking', 'urgent', 'major', 'historic', 'unprecedented', 'crisis']
  const isTrending = trendingKeywords.some(keyword => text.includes(keyword))

  // Generate simple summary (first sentence or truncated content)
  let summary = content
  if (content.length > 200) {
    const sentences = content.split('. ')
    summary = sentences[0] + (sentences.length > 1 ? '...' : '')
  }

  return {
    category,
    tags: tags.slice(0, 5), // Limit to 5 tags
    summary,
    isTrending
  }
}

function parseRSSFeed(rssText: string, source: string) {
  const items: any[] = []
  
  // Simple regex-based RSS parsing
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
  let match
  
  while ((match = itemRegex.exec(rssText)) !== null) {
    const itemContent = match[1]
    
    const title = extractTag(itemContent, 'title')
    const description = extractTag(itemContent, 'description')
    const link = extractTag(itemContent, 'link')
    
    if (title) {
      items.push({
        title: cleanText(title),
        description: cleanText(description || ''),
        link: link || '',
        source: source.charAt(0).toUpperCase() + source.slice(1)
      })
    }
  }
  
  return items.slice(0, 10) // Limit to 10 articles per fetch
}

function extractTag(content: string, tagName: string): string | null {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
  const match = content.match(regex)
  return match ? match[1] : null
}

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}
