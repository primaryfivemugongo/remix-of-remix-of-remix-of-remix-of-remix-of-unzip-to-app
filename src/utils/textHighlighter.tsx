import React from 'react';

interface HighlightTextProps {
  text: string;
  searchTerm: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, searchTerm }) => {
  if (!searchTerm.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} className="bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 px-1 rounded">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};