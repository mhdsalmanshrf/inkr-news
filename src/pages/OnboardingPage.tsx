
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const INTEREST_OPTIONS = [
  'Technology', 'Politics', 'Business', 'UAE', 'India', 'World News',
  'Energy', 'Artificial Intelligence', 'Climate', 'Health', 'Sports',
  'Entertainment', 'Science', 'Finance', 'Startups', 'Cryptocurrency'
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (selectedInterests.length === 0) {
      toast({
        title: "Please select at least one interest",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Clear existing interests
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);

      // Insert new interests
      const interests = selectedInterests.map(interest => ({
        user_id: user.id,
        interest
      }));

      const { error } = await supabase
        .from('user_interests')
        .insert(interests);

      if (error) throw error;

      toast({
        title: "Interests saved!",
        description: "Your personalized news feed is ready."
      });

      navigate('/');
    } catch (error) {
      console.error('Error saving interests:', error);
      toast({
        title: "Failed to save interests",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-read-bg px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-read-surface border-read-border">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-serif text-read-text mb-4">
              Welcome to Your Personalized News
            </CardTitle>
            <p className="text-read-text-dim text-lg">
              What topics do you care about? We'll curate your feed based on your interests.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INTEREST_OPTIONS.map((interest) => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  className={`
                    cursor-pointer p-3 text-center justify-center transition-all
                    ${selectedInterests.includes(interest) 
                      ? 'bg-read-accent text-black hover:bg-read-accent/90' 
                      : 'border-read-border text-read-text-dim hover:text-read-text hover:border-read-accent'
                    }
                  `}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>

            <div className="text-center space-y-4">
              <p className="text-read-text-dim text-sm">
                Selected {selectedInterests.length} interests
              </p>
              
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="border-read-border text-read-text-dim hover:text-read-text"
                >
                  Skip for now
                </Button>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || selectedInterests.length === 0}
                  className="bg-read-accent hover:bg-read-accent/90 text-black"
                >
                  {isSubmitting ? 'Saving...' : 'Continue'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
