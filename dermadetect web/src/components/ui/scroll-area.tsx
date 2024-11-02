// src/components/ui/scroll-area.tsx
import React from 'react';

export const ScrollArea = ({ children }) => {
  return (
    <div className="overflow-auto">
      {children}
    </div>
  );
};
