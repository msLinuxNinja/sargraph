import {
  parseCPUData,
  parseDiskIO,
  parseMemoryData,
  parseSwapData,
  parseNetworkData,
  parseNetErrorData,
  parseFileDetails,
} from "./parseData";

onmessage = ({ data }) => {
  const { funcKey, sarData } = data;
  const funcMap = {
    cpuObject: parseCPUData,
    blockObject: parseDiskIO,
    memoryObject: parseMemoryData,
    swapObject: parseSwapData,
    networkObject: parseNetworkData,
    networkErrObject: parseNetErrorData,
    fileDetails: parseFileDetails,
  };

  if (!(funcKey in funcMap)) {
    postMessage({ funcKey, error: "Unknown parsing function key." });
    return;
  }

  try {
    const result = funcMap[funcKey](sarData);
    postMessage({ funcKey, result });
  } catch (err) {
    postMessage({ funcKey, error: err.message });
  }
};
