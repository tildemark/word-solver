// src/hooks/useDictionary.ts
import { useState, useEffect } from 'react';

export function useDictionary() {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/dictionary.txt')
      .then((res) => res.text())
      .then((text) => {
        // Split by new line and remove empty strings
        const list = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
        setWords(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dictionary", err);
        setLoading(false);
      });
  }, []);

  return { words, loading };
}