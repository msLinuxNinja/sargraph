import { createContext } from "react";

const DataContext = createContext({
  cpuData: undefined,
  setCPUData: () => {},
  memoryData: undefined,
  setMemoryData: () => {},
  blockData: undefined,
  setBlockData: () => {},
  selectedOption: undefined,
  setSelectedOption: () => {},
});

export const DataContextProvider = ({ children }) => {
  const [cpuData, setCpuData] = useState(undefined);
  const [memoryData, setMemoryData] = useState(undefined);
  const [blockData, setBlockData] = useState(undefined);
  const [selectedOption, setSelectedOption] = useState();

  const contextValue = {
    cpuData,
    setCpuData,
    memoryData,
    setMemoryData,
    blockData,
    setBlockData,
    selectedOption,
    setSelectedOption,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useDataContext = () => {
  return useContext(DataContext);
};
