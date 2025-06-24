
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Brain, Lightbulb, Baby } from 'lucide-react';

interface AIInsightsProps {
  articleId: string;
  title: string;
  content: string;
  aiSummary?: string;
  explanation?: string;
  simpleExplanation?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ 
  articleId, 
  title, 
  content, 
  aiSummary, 
  explanation, 
  simpleExplanation 
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generateAIContent = async (type: 'summary' | 'explanation' | 'simple') => {
    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      // This would call your AI generation edge function
      const prompt = type === 'summary' 
        ? `Provide a brief TL;DR summary of this article: ${title}\n\n${content}`
        : type === 'explanation'
        ? `Explain what this news means and its relevance: ${title}\n\n${content}`
        : `Explain this news article in simple terms for a 5-year-old: ${title}\n\n${content}`;

      // For now, we'll show placeholder content
      console.log('Would generate AI content for:', type, prompt);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Error generating AI content:', error);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const sections = [
    {
      id: 'summary',
      title: 'TL;DR',
      icon: Brain,
      content: aiSummary,
      placeholder: 'Get a quick summary of this article...',
      description: 'Short summary of the key points'
    },
    {
      id: 'explanation',
      title: 'What this means',
      icon: Lightbulb,
      content: explanation,
      placeholder: 'Understand the relevance and context...',
      description: 'Relevance and broader context'
    },
    {
      id: 'simple',
      title: 'Explain Like I\'m 5',
      icon: Baby,
      content: simpleExplanation,
      placeholder: 'Get a simple explanation...',
      description: 'Simplified explanation of complex terms'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-serif text-read-text mb-4">AI Insights</h3>
      
      {sections.map((section) => {
        const Icon = section.icon;
        const isExpanded = expandedSections[section.id];
        const isLoading = loading[section.id];
        
        return (
          <Card key={section.id} className="bg-read-surface border-read-border">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleSection(section.id)}
            >
              <CardTitle className="flex items-center justify-between text-read-text">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-read-accent" />
                  <span>{section.title}</span>
                </div>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              <p className="text-read-text-dim text-sm">{section.description}</p>
            </CardHeader>
            
            {isExpanded && (
              <CardContent>
                {section.content ? (
                  <p className="text-read-text leading-relaxed">{section.content}</p>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-read-text-dim mb-4">{section.placeholder}</p>
                    <Button
                      onClick={() => generateAIContent(section.id as 'summary' | 'explanation' | 'simple')}
                      disabled={isLoading}
                      className="bg-read-accent hover:bg-read-accent/90 text-black"
                    >
                      {isLoading ? 'Generating...' : `Generate ${section.title}`}
                    </Button>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default AIInsights;
