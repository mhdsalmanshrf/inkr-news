
-- Create articles table for storing news content
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  summary TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  category TEXT DEFAULT 'general',
  reading_time INTEGER DEFAULT 5,
  is_live BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for articles table
-- Public can only see published articles
CREATE POLICY "Public can view published articles" 
  ON public.articles 
  FOR SELECT 
  USING (is_live = true);

-- Authenticated users can view all articles if they are admin
CREATE POLICY "Admins can view all articles" 
  ON public.articles 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert articles
CREATE POLICY "Admins can create articles" 
  ON public.articles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can update articles
CREATE POLICY "Admins can update articles" 
  ON public.articles 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete articles
CREATE POLICY "Admins can delete articles" 
  ON public.articles 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample articles to get started
INSERT INTO public.articles (title, subtitle, content, source, category, is_live, reading_time) VALUES
('Breaking: Global Climate Summit Reaches Historic Agreement', 'World leaders unite on ambitious carbon reduction targets', 'In a landmark decision that could reshape the global response to climate change, representatives from 195 countries have reached a comprehensive agreement at the Global Climate Summit. The accord includes binding commitments to reduce carbon emissions by 50% within the next decade and achieve net-zero emissions by 2050. The agreement also establishes a $100 billion annual fund to support developing nations in their transition to renewable energy sources. Environmental activists have hailed this as a crucial step forward, while economists predict significant impacts on global markets as industries adapt to new regulations.', 'Reuters', 'environment', true, 4),
('Tech Giants Face New AI Regulation Framework', 'Comprehensive oversight measures target artificial intelligence development', 'Governments worldwide are implementing new regulatory frameworks specifically designed to oversee artificial intelligence development and deployment. The regulations focus on transparency requirements, algorithmic bias prevention, and data privacy protection. Major technology companies will need to undergo regular audits and provide detailed documentation of their AI systems. Industry leaders express mixed reactions, with some welcoming clear guidelines while others worry about innovation constraints. The framework is expected to be fully implemented within 18 months.', 'BBC', 'technology', true, 5),
('Economic Markets Show Resilience Amid Global Uncertainty', 'Analysts point to strong fundamentals despite geopolitical tensions', 'Global financial markets have demonstrated remarkable stability over the past quarter, with major indices posting modest gains despite ongoing geopolitical uncertainties. Economic analysts attribute this resilience to strong corporate earnings, stable employment rates, and effective monetary policy coordination among central banks. However, experts caution that emerging market volatility and supply chain disruptions continue to pose risks. The technology and healthcare sectors have been particular bright spots, while energy markets remain volatile due to ongoing geopolitical tensions.', 'Al Jazeera', 'business', true, 6);
