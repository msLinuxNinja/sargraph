// function to check if a string contains '%usr' to not include it in the array
const returnDataPortion = (firstIndex, lastIndex, array) => {
    // console.log(`First: ${firstIndex}, Last: ${lastIndex}`)
    const resultingArray = array.slice(firstIndex, lastIndex);
    return resultingArray;
}


const returnMatch = (re, array) => { // returns new array from matched lines based on regex defined when calling the function
    const match = [];
    const regex = new RegExp(re);

    array.forEach(element => {
        if(element[1].match(regex)) {
            match.push(element);
        }
    });

    return match;
}

export function parseFileDetails (sarFileData) {

    let kernel = "";
    let hostname = "";
    let date = "";

    const header = sarFileData[0];
    if (header.includes('Linux')) {
        kernel = header[1];
        hostname = header[2].replace(/[()]/g, '');
        date = header[3];

    } else {
        kernel = "N/A";
        hostname = "N/A";
        date = "N/A";
    }
    

    return {kernel, hostname, date};
}

export function parseCPUData (sarFileData) { // Parse CPU details and return an object with 8 arrays
    const [xlables, cpuNumber, ycpuUsr, ycpuNice, ycpuSys, ycpuIowait, ycpuIrq, ycpuSoft, ycpuIdle, uniqCPU, matchedData, parsedData] = [ [], [], [], [], [], [], [], [], [], [], [], [] ];


    const rowIncludesUsr = sarFileData.map((row, index) => row.includes('CPU') ? index: null ).filter(index => typeof index === 'number'); // Verify if row includes usr and returns index of matching pattern. Returns the index of the ocurrences of 'CPU'.
    const rowIncludesAvg = sarFileData.map((row, index) => row.includes('Average:') ? index: null ).filter(index => typeof index === 'number');
    const firstIndex = rowIncludesUsr[0] + 1; // first index not including the first instance 

    const lastIndex = rowIncludesAvg[0]; // Last index from the array

    const cpuData = returnDataPortion(firstIndex, lastIndex, sarFileData); // returns the portion of the data from firstIndex to lastIndex
    const cpuFilter = cpuData.filter(row => !row.includes('%usr'))
   
    cpuFilter.forEach(row => { // Obtain list of unique CPUs to later use as an iterator and perform Regex
        const cpuNum = row[1];

        if (!uniqCPU.includes(cpuNum)) {
            uniqCPU.push(cpuNum);
            
        }
    });
    

    uniqCPU.forEach(cpu => { // With list of unique CPUs obtain data based on matched reges
        matchedData.push(returnMatch(`(^${cpu}$)`, sarFileData));

    });
    
    matchedData.forEach(array => { // remove nested arrays

        array.forEach(entry => {
            parsedData.push(entry);
        });

    });

    const filteredArray = parsedData.filter(row => { // After removing nested array, filter out rows with "CPU", "Average:" and that are less than or equal to 12
        if(!row.includes('CPU') && !row.includes('Average:') && row.length >= 12){
            return true;
        }
        return false;
    });


    filteredArray.forEach(row => { // Logic to add each coulmn to the correct metric

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
    });

    // const occurences = cpuNumber.reduce((acc, curr) => { // counts occurrence of CPUs
    //     return acc[curr] ? ++acc[curr] : acc[curr] =1, acc
    // }, {});
  
    // console.log(occurences)


    return {xlables, cpuNumber, ycpuUsr, ycpuNice, ycpuSys, ycpuIowait, ycpuIrq, ycpuSoft, ycpuIdle, uniqCPU};
}

export function parseMemoryData (sarFileData) { 
    const [xlables, ykbmemFree, ykbMemUsed, ymemUsedPrcnt, ykbBuffers, ykbCached, ykbCommit, ycommitPrcnt, ytotalMemory] = [[], [], [], [], [], [], [], [], []] ;
    let fileVersion = "";


    const prasedData = sarFileData.filter(row => { 
        if(row.length === 17 && !isNaN(row[1])) { // Memory section is exactly 17 columns long, checks if the second column is not a number 
            
            return true;
        } else if (row.length === 11 && !isNaN(row[1]) ) { // Memory section is exactly 11 columns long for RHEL7, checks if the second column is not a number as the network section is also 11 columns long
            
            return true
        }
    }); // Note RHEL8+ sar files, memory section is 17 Columns

    const filteredArray = prasedData.filter(row => !row.includes('Average:')) // return everything that does not include the word "%usr" which indicates a header

    if ( filteredArray[0].length === 17 ) {
        fileVersion = "rhel8+";
    } else if ( filteredArray[0].length === 11 ) {
        fileVersion = "rhel7";
    }

    if (fileVersion == "rhel8+") {
        filteredArray.forEach(row =>{ //pushes values to the array

            xlables.push(row[0]); //time
            ykbmemFree.push(parseInt(row[1] / 1048576)); //Dividing by 1048576 gives number in GB instead of KB
            ykbMemUsed.push(parseInt(row[3] / 1048576));
            ymemUsedPrcnt.push(parseInt(row[4]));
            ykbBuffers.push(parseInt(row[5] / 1048576));
            ykbCached.push(parseInt(row[6] / 1048576));
            ykbCommit.push(parseInt(row[7] / 1048576));
            ycommitPrcnt.push(parseInt(row[8]));
            ytotalMemory.push(ykbmemFree[0] + ykbMemUsed[0] + ykbBuffers[0] + ykbCached[0]);
           
        });

    } else if (fileVersion == "rhel7" ) {
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

    }
    

    


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
    const matchedData = [];
    const parsedData = [];

    const rowIncludesDev = sarFileData.map((row, index) => row.includes('DEV') ? index: null ).filter(index => typeof index === 'number'); // Verify if row includes usr and returns index of matching pattern. Returns the index of the ocurrences of 'CPU'.
    const firstIndex = rowIncludesDev[0] + 1; // first index not including the first instance 

    const rowIncludesAvg = sarFileData.map((row, index) => row.includes('Average:') ? index: null ).filter(index => typeof index === 'number');
    // console.log(rowIncludesAvg)
    const tempLastIndex = rowIncludesAvg.filter(number => number > rowIncludesDev[0]); // Last index from the array
    // console.log(tempLastIndex)
    const lastIndex = tempLastIndex[0] -1;
 
    
    const diskData = returnDataPortion(firstIndex, lastIndex, sarFileData);

    
    diskData.forEach(row => { // Obtain list of unique block devices to later use as an iterator and perform Regex
        const block = row[1];

        if (!uniqDev.includes(block)) {
            console.log(block)
            uniqDev.push(block);            
        }
    });


    // const prasedData = sarFileData.filter(row => {
    //     if(row.length === 10 && isNaN(row[1]) && !row.includes('pgpgin/s')) {
    //         return true;
    //     }
    // });

    uniqDev.forEach(block => {
        matchedData.push(returnMatch(`(^${block}$)`, sarFileData));
    });

    matchedData.forEach(array => {
        array.forEach(entry => {
            parsedData.push(entry);
        });
    });



    const filteredArray = parsedData.filter(row => !row.includes('DEV') && !row.includes('Average:')) // return everything that does not include the word "%usr" which indicates a header

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
        
        // if (!uniqDev.includes(blockDev)) {
        //     uniqDev.push(blockDev);
        // }
    
    });



    return {xlables, ytps, yreadSec, ywriteSec, yavgRQz, yavgQz, yawaitMS, uniqDev, blockDevices}; //export object with arrays
}