
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to the new HomePage
    navigate('/home');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-read-bg flex items-center justify-center">
      <div className="text-read-text">Redirecting...</div>
    </div>
  );
};

export default Index;
