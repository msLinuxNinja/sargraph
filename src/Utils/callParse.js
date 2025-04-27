import readDataParallel from "./readDataParallel";
import pparseAllParallel from "./parseAllParallel";

export async function callParse(fileContent) {
  const sarFileData = await readDataParallel(fileContent); // Note these functions don't need to be async as data has already been read
  const results = await pparseAllParallel(sarFileData);
  const {
    cpuObject,
    memoryObject,
    swapObject,
    blockObject,
    networkObject,
    networkErrObject,
    fileDetails,
  } = results;

  return {
    cpuObject,
    memoryObject,
    swapObject,
    blockObject,
    networkObject,
    networkErrObject,
    fileDetails,
  };
}
