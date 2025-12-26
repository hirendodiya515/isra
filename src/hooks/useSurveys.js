import { useState, useEffect } from 'react';
import { surveyService } from '../services/surveyService';

export const useSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = surveyService.subscribeToSurveys(
      (data) => {
        setSurveys(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { surveys, loading, error };
};
