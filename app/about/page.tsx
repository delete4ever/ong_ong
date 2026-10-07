'use client';

import { useEffect } from 'react';
import { sitePath } from '@/lib/site-path';

export default function LegacyAboutPage() {
  useEffect(() => {
    window.location.replace(sitePath('/documents/'));
  }, []);

  return <main><p>This page has moved to <a href={sitePath('/documents/')}>Documents</a>.</p></main>;
}
