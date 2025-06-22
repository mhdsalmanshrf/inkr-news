
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

interface Article {
  id?: string;
  title: string;
  subtitle?: string;
  content: string;
  source: string;
  category: string;
  is_live: boolean;
  reading_time: number;
}

interface ArticleEditorProps {
  article?: Article;
  onBack: () => void;
  onSave: () => void;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onBack, onSave }) => {
  const [formData, setFormData] = useState<Article>({
    title: '',
    subtitle: '',
    content: '',
    source: 'Manual Entry',
    category: 'general',
    is_live: false,
    reading_time: 5,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (article) {
      setFormData(article);
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const articleData = {
        ...formData,
        reading_time: Math.max(1, Math.floor(formData.content.length / 250)),
      };

      if (article?.id) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', article.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Article updated successfully',
        });
      } else {
        // Create new article
        const { error } = await supabase
          .from('articles')
          .insert(articleData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Article created successfully',
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: 'Error',
        description: 'Failed to save article',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-read-text-dim hover:text-read-text"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-serif text-read-text">
          {article?.id ? 'Edit Article' : 'Create New Article'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-read-surface border border-read-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-read-text font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-read-bg border border-read-border rounded px-3 py-2 text-read-text"
              required
            />
          </div>

          <div>
            <label className="block text-read-text font-medium mb-2">Subtitle (Optional)</label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full bg-read-bg border border-read-border rounded px-3 py-2 text-read-text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-read-text font-medium mb-2">Source</label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full bg-read-bg border border-read-border rounded px-3 py-2 text-read-text"
                required
              />
            </div>

            <div>
              <label className="block text-read-text font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-read-bg border border-read-border rounded px-3 py-2 text-read-text"
              >
                <option value="general">General</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="politics">Politics</option>
                <option value="environment">Environment</option>
                <option value="health">Health</option>
                <option value="science">Science</option>
                <option value="sports">Sports</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-read-text font-medium mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={20}
              className="w-full bg-read-bg border border-read-border rounded px-3 py-2 text-read-text font-serif leading-relaxed"
              placeholder="Write your article content here..."
              required
            />
            <div className="text-sm text-read-text-dim mt-1">
              Estimated reading time: {Math.max(1, Math.floor(formData.content.length / 250))} minutes
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-read-text">
              <input
                type="checkbox"
                checked={formData.is_live}
                onChange={(e) => setFormData({ ...formData, is_live: e.target.checked })}
                className="rounded"
              />
              Publish immediately
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={saving}
            className="bg-read-accent hover:bg-read-accent/90 text-black"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Article'}
          </Button>
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="border-read-border text-read-text hover:bg-read-surface"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditor;
