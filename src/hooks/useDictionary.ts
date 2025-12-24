// src/hooks/useDictionary.ts
import { useState, useEffect } from 'react';

export function useDictionary() {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dictionary')
      .then((res) => res.json())
      .then((data) => {
        const list = (data?.dictionary || []).map((w: string) => w.trim()).filter((w: string) => w.length > 0);
        setWords(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dictionary', err);
        setLoading(false);
      });
  }, []);

  return { words, loading };
}