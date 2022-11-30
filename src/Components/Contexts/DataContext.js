import { createContext, useState, useContext } from "react";

const DataContext = createContext({
  cpuData: undefined,
  setCPUData: () => {},
  memoryData: undefined,
  setMemoryData: () => {},
  blockData: undefined,
  setBlockData: () => {},
  selectedCPU: undefined,
  setSelectedCPU: () => {},
  selectedBlock: undefined,
  setSelectedBlock: () => {},
  hasData: false,
});

export const DataContextProvider = ({ children }) => {
  const [cpuData, setCpuData] = useState(undefined);
  const [memoryData, setMemoryData] = useState(undefined);
  const [blockData, setBlockData] = useState(undefined);
  const [selectedCPU, setSelectedCPU] = useState();
  const [selectedBlock, setSelectedBlock] = useState();

  const hasData = cpuData || memoryData || blockData;

  const contextValue = {
    cpuData,
    setCpuData,
    memoryData,
    setMemoryData,
    blockData,
    setBlockData,
    selectedCPU,
    setSelectedCPU,
    selectedBlock,
    setSelectedBlock,
    hasData,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useDataContext = () => {
  return useContext(DataContext);
};
