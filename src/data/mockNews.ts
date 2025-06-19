
import { NewsEdition, NewsStory } from '../types/news';

const generateMockStory = (id: string, title: string, category: string): NewsStory => ({
  id,
  title,
  subtitle: `Understanding the implications and what it means for the future`,
  content: `
    This is a thoughtfully curated piece of news that has been selected for today's edition. The story provides context and depth without overwhelming the reader with unnecessary details.

    The key points are presented clearly and concisely, allowing you to understand the essential information without the noise typically found in traditional news consumption.

    We believe that informed citizens deserve better than clickbait headlines and sensationalized content. This is why each story in your daily edition has been carefully selected and refined for clarity and relevance.

    The implications of this development extend beyond the immediate circumstances, potentially affecting various aspects of society and economy in the coming months.

    What makes this particularly noteworthy is the convergence of multiple factors that have led to this moment. Understanding these underlying causes helps provide the context necessary for making sense of current events.

    As we continue to monitor this developing situation, we'll provide updates in future editions when significant new information becomes available. For now, this represents the most accurate and complete picture available.
  `,
  source: 'Reuters',
  publishedAt: new Date().toISOString(),
  readingTime: 3,
  category
});

export const todaysEdition: NewsEdition = {
  id: 'edition-today',
  date: new Date().toISOString().split('T')[0],
  title: "Today's Edition",
  isToday: true,
  stories: [
    generateMockStory('story-1', 'Global Climate Summit Reaches Historic Agreement', 'World'),
    generateMockStory('story-2', 'Technology Giants Face New Regulatory Framework', 'Technology'),
    generateMockStory('story-3', 'Economic Indicators Show Unexpected Growth Pattern', 'Economy'),
    generateMockStory('story-4', 'Scientific Breakthrough in Renewable Energy Storage', 'Science'),
    generateMockStory('story-5', 'Cultural Shifts in Remote Work Policies', 'Society'),
    generateMockStory('story-6', 'Healthcare Innovation Improves Patient Outcomes', 'Health'),
  ]
};

export const pastEditions: NewsEdition[] = [
  {
    id: 'edition-yesterday',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: "Yesterday's Edition",
    isToday: false,
    stories: [
      generateMockStory('story-y1', 'International Trade Talks Show Promise', 'World'),
      generateMockStory('story-y2', 'Artificial Intelligence Ethics Guidelines Released', 'Technology'),
      generateMockStory('story-y3', 'Urban Planning Revolution Takes Shape', 'Society'),
    ]
  },
  {
    id: 'edition-2days',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    title: "Two Days Ago",
    isToday: false,
    stories: [
      generateMockStory('story-2d1', 'Space Exploration Milestone Achieved', 'Science'),
      generateMockStory('story-2d2', 'Financial Markets Adapt to New Regulations', 'Economy'),
      generateMockStory('story-2d3', 'Educational Technology Transforms Learning', 'Education'),
    ]
  }
];
