// src/components/ui/textarea.tsx
import React from 'react';

export const Textarea = ({ value, onChange, placeholder }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border rounded p-2 w-full"
    />
  );
};
