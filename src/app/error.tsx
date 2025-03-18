'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error,reset);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
    </div>
  );
} 