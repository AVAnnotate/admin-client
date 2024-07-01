import { createContext, useState, type ReactElement } from 'react';

type SpreadsheetInputContextObj = {
  headerMap: { [key: string]: number };
  setHeaderMap: (arg: { [key: string]: number }) => void;
  requiredFieldsSet: boolean;
  setRequiredFieldsSet: (arg: boolean) => void;
};

const initialValue = {
  headerMap: {},
  setHeaderMap: () => {},
  requiredFieldsSet: false,
  setRequiredFieldsSet: () => {},
};

export const SpreadsheetInputContext =
  createContext<SpreadsheetInputContextObj>(initialValue);

interface SpreadsheetInputContextComponentProps {
  children: ReactElement | ReactElement[];
}

export const SpreadsheetInputContextComponent: React.FC<
  SpreadsheetInputContextComponentProps
> = ({ children }) => {
  const [headerMap, setHeaderMap] = useState<{ [key: string]: number }>({});
  const [requiredFieldsSet, setRequiredFieldsSet] = useState<boolean>(false);

  return (
    <SpreadsheetInputContext.Provider
      value={{
        headerMap,
        setHeaderMap,
        requiredFieldsSet,
        setRequiredFieldsSet,
      }}
    >
      {children}
    </SpreadsheetInputContext.Provider>
  );
};
