import { parseMemoryData, parseCPUData, parseDiskIO, parseNetworkData, parseFileDetails } from "./parseData";

import readData from "./readData";

export function callParse(fileContent) {

    const sarFileData = readData(fileContent); // Note these functions don't need to be async as data has already been read
    const cpuObject = parseCPUData(sarFileData);
    const blockObject = parseDiskIO(sarFileData);
    const memoryObject = parseMemoryData(sarFileData);
    const networkObject = parseNetworkData(sarFileData);
    const fileDetails = parseFileDetails(sarFileData);

    return { cpuObject, memoryObject, blockObject, networkObject, fileDetails }
}