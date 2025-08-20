import { useState, useEffect } from 'react';

/**
 * A custom hook for fetching data with loading and error states
 * 
 * @param url The URL to fetch data from
 * @param options Optional fetch options
 * @returns Object containing data, loading state, error state, and a refetch function
 */
export function useFetchData<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (customOptions?: RequestInit) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, customOptions || options);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: () => fetchData() };
}
