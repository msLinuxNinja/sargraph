import { createContext, useState, useContext } from "react";

const DataContext = createContext({
  cpuData: undefined,
  setCPUData: () => {},
  memoryData: undefined,
  setMemoryData: () => {},
  swapData: undefined,
  setSwapData: () => {},
  blockData: undefined,
  setBlockData: () => {},
  netData: undefined,
  setNetData: () => {},
  netErrData: undefined,
  setNetErrData: () => {},
  selectedCPU: undefined,
  setSelectedCPU: () => {},
  selectedBlock: undefined,
  setSelectedBlock: () => {},
  selectedInterface: undefined,
  setSelectedInterface: () => {},
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
  const [swapData, setSwapData] = useState(undefined);
  const [blockData, setBlockData] = useState(undefined);
  const [netData, setNetData] = useState(undefined);
  const [netErrData, setNetErrData] = useState(undefined);
  const [selectedCPU, setSelectedCPU] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState(0);
  const [selectedInterface, setSelectedInterface] = useState(0);
  const [fileDetails, setFileDetails] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const hasData = cpuData || memoryData || blockData ;

  const contextValue = {
    cpuData,
    setCpuData,
    memoryData,
    setMemoryData,
    swapData,
    setSwapData,
    blockData,
    setBlockData,
    netData,
    setNetData,
    netErrData,
    setNetErrData,
    selectedCPU,
    setSelectedCPU,
    selectedBlock,
    setSelectedBlock,
    selectedInterface,
    setSelectedInterface,
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
