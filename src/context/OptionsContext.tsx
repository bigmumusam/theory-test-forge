import React, { createContext, useContext, useState } from 'react';

export interface OptionsData {
  roles?: Record<string, string>;
  categories?: Record<string, string>;
  departments?: Record<string, string>;
}

interface OptionsContextType {
  options: OptionsData | null;
  setOptions: (opts: OptionsData) => void;
}

const OptionsContext = createContext<OptionsContextType>({
  options: null,
  setOptions: () => {},
});

export const OptionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [options, setOptions] = useState<OptionsData | null>(null);
  return (
    <OptionsContext.Provider value={{ options, setOptions }}>
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptions = () => useContext(OptionsContext); 