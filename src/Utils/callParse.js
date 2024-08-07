import { parseMemoryData, parseSwapData, parseCPUData, parseDiskIO, parseNetworkData, parseNetErrorData, parseFileDetails } from "./parseData";

import readData from "./readData";

export function callParse(fileContent) {

    const sarFileData = readData(fileContent); // Note these functions don't need to be async as data has already been read
    const cpuObject = parseCPUData(sarFileData);
    const blockObject = parseDiskIO(sarFileData);
    const memoryObject = parseMemoryData(sarFileData);
    const swapObject = parseSwapData(sarFileData);
    const networkObject = parseNetworkData(sarFileData);
    const networkErrObject = parseNetErrorData(sarFileData);
    const fileDetails = parseFileDetails(sarFileData);

    return { cpuObject, memoryObject, swapObject, blockObject, networkObject, networkErrObject, fileDetails }
}