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
  fileDetails: undefined,
  setFileDetails: () => {},
  isLoading: true,
  setIsLoading: () => {},
  dataLoaded: false,
  setDataLoaded: () => {},

});

export const DataContextProvider = ({ children }) => {
  const [cpuData, setCpuData] = useState(undefined);
  const [memoryData, setMemoryData] = useState(undefined);
  const [blockData, setBlockData] = useState(undefined);
  const [selectedCPU, setSelectedCPU] = useState();
  const [selectedBlock, setSelectedBlock] = useState();
  const [fileDetails, setFileDetails] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const hasData = cpuData || memoryData || blockData ;

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
    fileDetails,
    setFileDetails,
    isLoading,
    setIsLoading,
    dataLoaded,
    setDataLoaded
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useDataContext = () => {
  return useContext(DataContext);
};
