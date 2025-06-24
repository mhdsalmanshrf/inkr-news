
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import HomePage from './HomePage';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-read-bg flex items-center justify-center">
        <div className="text-read-text">Loading...</div>
      </div>
    );
  }

  // Show HomePage directly instead of redirecting
  return <HomePage />;
};

export default Index;
