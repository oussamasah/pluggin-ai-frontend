// src/context/hooks/useTypingText.ts
'use client' // Add this if using Next.js App Router

import { useState, useEffect } from "react";

export function useTypingText(text: string, speed: number = 400) {
    
  const [displayedText, setDisplayedText] = useState<string>("");

  useEffect(() => {
    // Validate inputs
    if (!text || typeof text !== 'string') {
      setDisplayedText("");
      return;
    }

    const words = text.split(" ").filter(word => 
      word && word.trim() !== "" && word !== "undefined"
    );

    if (words.length === 0) {
      setDisplayedText("");
      return;
    }

    setDisplayedText("");

    let index = 0;
    const interval = setInterval(() => {
      if (index < words.length) {
        setDisplayedText(prev => 
          prev ? `${prev} ${words[index]}` : words[index]
        );
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => {
      clearInterval(interval);
    };
  }, [text, speed]);

  return displayedText;
}