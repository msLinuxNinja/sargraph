// function to check if a string contains '%usr' to not include it in the array
const returnDataPortion= (firstIndex, lastIndex, array) => {
    const resultingArray = array.slice(firstIndex, lastIndex);
    return resultingArray;
}

// Figure how to parse RHEL8 + sar by doing something like
// if index number === (difference between sar versions) do x for sar v1 y for sar v2

export function parseCPUData (sarFileData) { // Parse CPU details and return an object with 8 arrays
    const xlables = [];
    const cpuNumber = [];
    const ycpuUsr = [];
    const ycpuNice = [];
    const ycpuSys = [];
    const ycpuIowait = [];
    const ycpuIrq = [];
    const ycpuSoft = [];
    const ycpuIdle = [];
    const uniqCPU = [];
    
    const prasedData = sarFileData;
    const rowIncludesUsr = sarFileData.map((row, index) => row.includes('%usr') ? index: null ).filter(index => typeof index === 'number'); // Verify if row includes usr and returns index of matching pattern. Returns the index of the ocurrences of '%usr'.
    const firstIndex = rowIncludesUsr[0] + 1; // first index not including the first instance 
    const lastIndex = rowIncludesUsr[rowIncludesUsr.length -1]; // Last index from the array
    const cpuData = returnDataPortion(firstIndex, lastIndex, prasedData); // returns the portion of the data from firstIndex to lastIndex
    const filteredArray = cpuData.filter(row => !row.includes('%usr')) // return everything that does not include the word "%usr" which indicates a header

    // const row = cpuObject.split('\n').filter(checkFilterCPU); // split by line break and ignore the first 4 lines, also runs a filter to return rows that do not match '%usr'

    filteredArray.forEach(row => {

        const time = row[0];
        const cpuNum = row[1];
        const cpuUsr = parseFloat(row[2]);
        const cpuNice = parseFloat(row[3]);
        const cpuSys = parseFloat(row[4]);
        const cpuIowait = parseFloat(row[5]);
        const cpuIrq = parseFloat(row[7]);
        const cpuSoft = parseFloat(row[8]);
        const cpuIdle = parseFloat(row[11]);
        xlables.push(time);
        cpuNumber.push(cpuNum);
        ycpuUsr.push(cpuUsr);
        ycpuNice.push(cpuNice);
        ycpuSys.push(cpuSys);
        ycpuIowait.push(cpuIowait);
        ycpuIrq.push(cpuIrq);
        ycpuSoft.push(cpuSoft);
        ycpuIdle.push(cpuIdle);

        if (!uniqCPU.includes(cpuNum)) {
            uniqCPU.push(cpuNum);
        }
    });

    return {xlables, cpuNumber, ycpuUsr, ycpuNice, ycpuSys, ycpuIowait, ycpuIrq, ycpuSoft, ycpuIdle, uniqCPU};
}

export function parseMemoryData (sarFileData) { 
    const xlables = [];
    const ykbmemFree = [];
    const ykbMemUsed = [];
    const ymemUsedPrcnt = [];
    const ykbBuffers = [];
    const ykbCached = [];
    const ykbCommit = [];
    const ycommitPrcnt = [];
    const ytotalMemory = [];
    

    const prasedData = sarFileData;

    const rowIncludesMemoryIndex = sarFileData.map((row, index) => row.includes('kbmemfree') ? index : null ).filter(index => typeof index === 'number'); // Verify if row includes kbmemfree and returns index of matching pattern. Returns the index of the ocurrences of 'kbmemfree'.

    const firstIndex = rowIncludesMemoryIndex[0] + 1; // first index not including the first instance which is the header
    const averageIndex = sarFileData.map((row, index) => row.includes('Average:') ? index : null ).filter(index => typeof index === 'number'); // Obtains an array with the occurences of the Average: 
    const lastIndexAvg = averageIndex.filter(element => element > rowIncludesMemoryIndex[0]); //Looks for values greater than the first index of kbmemfree and returns the array
    const lastIndex = lastIndexAvg[0]; //Grabs the first element of the array

    const memoryData = returnDataPortion(firstIndex, lastIndex, prasedData); // returns the portion of the data from firstIndex to lastIndex

    const filteredArray = memoryData.filter(row => !row.includes('%usr')) // return everything that does not include the word "%usr" which indicates a header
  

    filteredArray.forEach(row =>{ //pushes values to the array

        xlables.push(row[0]); //time
        ykbmemFree.push(parseInt(row[1] / 1048576)); //Dividing by 1048576 gives number in GB instead of KB
        ykbMemUsed.push(parseInt(row[2] / 1048576));
        ymemUsedPrcnt.push(parseInt(row[3]));
        ykbBuffers.push(parseInt(row[4] / 1048576));
        ykbCached.push(parseInt(row[5] / 1048576));
        ykbCommit.push(parseInt(row[6] / 1048576));
        ycommitPrcnt.push(parseInt(row[7]));
        ytotalMemory.push(ykbmemFree[0] + ykbMemUsed[0] + ykbBuffers[0] + ykbCached[0]);
       
    });

    


    return {xlables, ykbmemFree, ykbMemUsed, ymemUsedPrcnt, ykbBuffers, ykbCached, ykbCommit, ycommitPrcnt, ytotalMemory};
}

export function parseDiskIO (sarFileData) { 
    const xlables = [];
    const ytps = [];
    const yreadSec = [];
    const ywriteSec = [];
    const yavgRQz = [];
    const yavgQz = [];
    const yawaitMS = [];
    const blockDevices = [];
    const uniqDev = [];


    const prasedData = sarFileData;

    const rowIncludesIOIndex = sarFileData.map((row, index) => row.includes('DEV') ? index : null ).filter(index => typeof index === 'number'); // Verify if row includes DEV and returns index of matching pattern. Returns the index of the ocurrences of 'DEV'.

    const firstIndex = rowIncludesIOIndex[0] + 1; // first index not including the first instance which is the header
    const averageIndex = sarFileData.map((row, index) => row.includes('Average:') ? index : null ).filter(index => typeof index === 'number'); // Obtains an array with the occurences of the Average: 
    const lastIndexAvg = averageIndex.filter(element => element > rowIncludesIOIndex[0]); //Looks for values greater than the first index of DEV and returns the array with the data between DEV and Average
    const lastIndex = lastIndexAvg[0]; //Grabs the first element of the array which is the last index

    const ioData = returnDataPortion(firstIndex, lastIndex, prasedData); // returns the portion of the data from firstIndex to lastIndex

    const filteredArray = ioData.filter(row => !row.includes('DEV')) // return everything that does not include the word "%usr" which indicates a header
    filteredArray.forEach(row =>{ //pushes values to the array
        const blockDev = row[1];
        xlables.push(row[0]);
        ytps.push(row[2])
        yreadSec.push(parseInt((row[3] * 512) / 1048576)); // Calculate MB/s
        ywriteSec.push(parseInt((row[4] * 512) / 1048576)); // Calculate MB/s
        yavgRQz.push(parseInt((row[5] *512) / 1024)); // Calculate blocksize in KB
        yavgQz.push(parseInt(row[6]));
        yawaitMS.push(parseFloat(row[7]));
        blockDevices.push(blockDev); // Update found block devices
        
        if (!uniqDev.includes(blockDev)) {
            uniqDev.push(blockDev);
        }
             
    });
    // blockDevices.forEach(device => { //remove duplicates
    //     if (!uniqDev.includes(device)) {
    //         uniqDev.push(device);
    //     }
    // })


    return {xlables, ytps, yreadSec, ywriteSec, yavgRQz, yavgQz, yawaitMS, uniqDev, blockDevices}; //export object with arrays
}