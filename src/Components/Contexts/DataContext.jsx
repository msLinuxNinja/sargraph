import { createContext, useState, useContext, useMemo } from "react";
import { getDeviceDisplayName } from "../../Utils/deviceName";

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
  pagingData: undefined,
  setPagingData: () => {},
  selectedCPU: undefined,
  setSelectedCPU: () => {},
  selectedBlock: undefined,
  setSelectedBlock: () => {},
  selectedInterface: undefined,
  setSelectedInterface: () => {},
  deviceMap: {},
  setDeviceMap: () => {},
  displayDevices: [],
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
  const [pagingData, setPagingData] = useState(undefined);
  const [selectedCPU, setSelectedCPU] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState(0);
  const [selectedInterface, setSelectedInterface] = useState(0);
  const [deviceMap, setDeviceMap] = useState({});
  const [fileDetails, setFileDetails] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const hasData = cpuData || memoryData || blockData ;

  // Human-readable device names derived from the raw sar dev identifiers
  // and the (optional) lsblk mapping. Kept in the same order/index as
  // blockData.uniqDev / blockData.diskArray so lookups by index stay valid.
  const displayDevices = useMemo(() => {
    if (!blockData?.uniqDev) return [];
    return blockData.uniqDev.map((d) => getDeviceDisplayName(d, deviceMap));
  }, [blockData?.uniqDev, deviceMap]);

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
    pagingData,
    setPagingData,
    selectedCPU,
    setSelectedCPU,
    selectedBlock,
    setSelectedBlock,
    selectedInterface,
    setSelectedInterface,
    deviceMap,
    setDeviceMap,
    displayDevices,
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
