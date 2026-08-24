import { useState, useEffect } from 'react';
import { generatePdfThumbnail } from '../utils/pdfUtils';

interface UseThumbnailResult {
  thumbnailUrl: string | null;
  isLoading: boolean;
  isError: boolean;
}

export function useThumbnail(pdfUrl: string, enabled = true): UseThumbnailResult {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled || !pdfUrl) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    generatePdfThumbnail(pdfUrl, 360)
      .then((dataUrl) => {
        if (isMounted) {
          setThumbnailUrl(dataUrl);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn(`Failed to generate thumbnail for ${pdfUrl}:`, err?.message || err);
        setIsError(true);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pdfUrl, enabled]);

  return { thumbnailUrl, isLoading, isError };
}
