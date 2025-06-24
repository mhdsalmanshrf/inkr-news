
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Bell, Bookmark, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const INTEREST_OPTIONS = [
  'Technology', 'Politics', 'Business', 'UAE', 'India', 'World News',
  'Energy', 'Artificial Intelligence', 'Climate', 'Health', 'Sports',
  'Entertainment', 'Science', 'Finance', 'Startups', 'Cryptocurrency'
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Get user interests
      const { data: interests } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', user.id);

      setUserInterests(interests?.map(i => i.interest) || []);

      // Get bookmark count
      const { count } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setBookmarkCount(count || 0);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setUserInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSaveInterests = async () => {
    if (!user) return;

    setIsUpdating(true);

    try {
      // Clear existing interests
      await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id);

      // Insert new interests
      if (userInterests.length > 0) {
        const interests = userInterests.map(interest => ({
          user_id: user.id,
          interest
        }));

        const { error } = await supabase
          .from('user_interests')
          .insert(interests);

        if (error) throw error;
      }

      toast({
        title: "Interests updated!",
        description: "Your news feed will be personalized accordingly."
      });
    } catch (error) {
      console.error('Error saving interests:', error);
      toast({
        title: "Failed to update interests",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/home');
      toast({
        title: "Signed out successfully"
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-read-bg px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={() => navigate('/home')}
            variant="ghost"
            className="text-read-text-dim hover:text-read-text mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card className="bg-read-surface border-read-border">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-serif text-read-text mb-4">
                Sign in to access settings
              </h2>
              <p className="text-read-text-dim mb-6">
                Create an account to personalize your news feed and save bookmarks.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-read-accent hover:bg-read-accent/90 text-black"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-read-bg px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate('/home')}
            variant="ghost"
            className="text-read-text-dim hover:text-read-text"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-2xl font-serif text-read-text">Settings</h1>
          
          <div></div>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="bg-read-surface border-read-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-read-text">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-read-text-dim text-sm">Email</label>
                <p className="text-read-text">{user.email}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-read-text-dim text-sm">Bookmarks</label>
                  <p className="text-read-text flex items-center gap-2">
                    <Bookmark className="h-4 w-4" />
                    {bookmarkCount} saved articles
                  </p>
                </div>
              </div>

              <Separator className="bg-read-border" />
              
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Interests Section */}
          <Card className="bg-read-surface border-read-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-read-text">
                <Bell className="h-5 w-5" />
                News Interests
              </CardTitle>
              <p className="text-read-text-dim text-sm">
                Select topics you're interested in to personalize your news feed
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTEREST_OPTIONS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={userInterests.includes(interest) ? "default" : "outline"}
                    className={`
                      cursor-pointer p-3 text-center justify-center transition-all
                      ${userInterests.includes(interest) 
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

              <div className="flex justify-between items-center">
                <p className="text-read-text-dim text-sm">
                  {userInterests.length} interests selected
                </p>
                
                <Button
                  onClick={handleSaveInterests}
                  disabled={isUpdating}
                  className="bg-read-accent hover:bg-read-accent/90 text-black"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* View Bookmarks */}
          <Card className="bg-read-surface border-read-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-read-text">
                <Eye className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/home?filter=bookmarked')}
                  variant="outline"
                  className="border-read-border text-read-text-dim hover:text-read-text"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  View Bookmarks ({bookmarkCount})
                </Button>
                
                <Button
                  onClick={() => navigate('/onboarding')}
                  variant="outline"
                  className="border-read-border text-read-text-dim hover:text-read-text"
                >
                  Retake Interest Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
