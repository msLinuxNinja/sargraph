import { parseMemoryData, parseCPUData, parseDiskIO } from "./parseData";
// import { chartItCPU, chartItMemory, chartItIO } from "./chartIt";
import readData from "./readData";

export function callParse(fileContent) {


    const sarFileData = readData(fileContent); // Note these functions don't need to be async as data has already been read
    const cpuObject = parseCPUData(sarFileData);
    const blockObject = parseDiskIO(sarFileData);
    const memoryObject = parseMemoryData(sarFileData);

    return { cpuObject, memoryObject, blockObject }
}