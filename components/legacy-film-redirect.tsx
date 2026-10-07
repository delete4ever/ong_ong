'use client';

import { useEffect } from 'react';
import { sitePath } from '@/lib/site-path';

export default function LegacyFilmRedirect() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('narrative') || params.has('location')) {
      window.location.replace(sitePath(`/films/${window.location.search}${window.location.hash}`));
    }
  }, []);

  return null;
}
