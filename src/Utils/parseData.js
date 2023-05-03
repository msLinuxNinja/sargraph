const returnDataPortion = (firstIndex, lastIndex, array) => {
  // console.log(`First: ${firstIndex}, Last: ${lastIndex}`)
  const resultingArray = array.slice(firstIndex, lastIndex);
  return resultingArray;
}


const returnMatch = (re, array) => { // returns new array from matched lines based on regex defined when calling the function
  const regex = new RegExp(re);
  return array.filter(element => element[1].match(regex));
}

function calculatePollInterval(sarData) {
  const sarDataPortion = sarData.filter(row => row.includes('all') && !row.includes('Average:') && !row.includes('CPU'));
  const dateRange = sarDataPortion.map(row => {
    return row[0]
  });

  const dates = dateRange.map(entry => Date.parse(`01/01/2022 ${entry}`));
  const intervals = [];
  dates.forEach((date, i) => {

    if (i > 0) {
      intervals.push((date - dates[i - 1]) / 1000);
    }
  });

  const sum = intervals.reduce((total, interval) => total + interval);
  const avgInterval = Math.round(sum / intervals.length);
  return avgInterval;
}

export function parseFileDetails(sarFileData) {

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

  const avgInterval = calculatePollInterval(sarFileData);
  if (avgInterval > 60) {
    const minutes = Math.round(avgInterval / 60);
    const interval = `${minutes}m`;
    console.log(interval)
  } else {
    const interval = `${avgInterval}s`;
    console.log(interval)
  }

  return { kernel, hostname, date, avgInterval };
}

export function parseCPUData(sarFileData) { // Parse CPU details and return an object with 8 arrays
  const [xlables, cpuNumber, ycpuUsr, ycpuNice, ycpuSys, ycpuIowait, ycpuIrq, ycpuSoft, ycpuIdle, uniqCPU, matchedData, parsedData] = [[], [], [], [], [], [], [], [], [], [], [], []];
  let dataArray = [];


  const dateData = sarFileData[0][3].replace(/[-]/g, '/'); // for some reason Date doesn't understand 2023-05-25 🙃
  const rowIncludesUsr = sarFileData.map((row, index) => row.includes('CPU') ? index : null).filter(index => typeof index === 'number'); // Verify if row includes usr and returns index of matching pattern. Returns the index of the ocurrences of 'CPU'.
  const rowIncludesAvg = sarFileData.map((row, index) => row.includes('Average:') ? index : null).filter(index => typeof index === 'number');
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

  const cpuArray = Array.from({ length: uniqCPU.length }, () => [{
    cpuUsrData: [],
    cpuNiceData: [],
    cpuSysData: [],
    cpuIowaitData: [],
    cpuIrqData: [],
    cpuSoftData: [],
    cpuIdleData: [],
  }]);

  uniqCPU.forEach(cpu => { // With list of unique CPUs obtain data based on matched reges
    matchedData.push(returnMatch(`(^${cpu}$)`, sarFileData));

  });

  matchedData.forEach(array => { // remove nested arrays

    array.forEach(entry => {
      parsedData.push(entry);
    });

  });

  const filteredArray = parsedData.filter(row => { // After removing nested array, filter out rows with "CPU", "Average:" and that are less than or equal to 12
    if (!row.includes('CPU') && !row.includes('Average:') && row.length >= 12) {
      return true;
    }
    return false;
  });
  const avgInterval = calculatePollInterval(sarFileData);
  console.log(`Interval ${avgInterval}`)
  if (avgInterval <= 10) { // on large datasets, reduce the datapoints by filtering out by an 18th of the data based on the average polling interval
    dataArray = filteredArray.filter((row, index) => index % 18 === 0);
  } else if (avgInterval <= 20) {
    dataArray = filteredArray.filter((row, index) => index % 15 === 0);
  } else if (avgInterval <= 30) {
    dataArray = filteredArray.filter((row, index) => index % 4 === 0);
  } else if (avgInterval <= 60) {
    dataArray = filteredArray.filter((row, index) => index % 2 === 0);
  } else {
    dataArray = filteredArray;
  }
  cpuArray.forEach((array, index) => { // Logic to add data to the array of objects
    dataArray.filter(row => row[1] === uniqCPU[index]).forEach((row, secIndex) => {
      const time = Date.parse(`${dateData} ${row[0]}`);
      array[0].cpuUsrData.push({ x: time, y: parseFloat(row[2]) });
      array[0].cpuNiceData.push({ x: time, y: parseFloat(row[3]) });
      array[0].cpuSysData.push({ x: time, y: parseFloat(row[4]) });
      array[0].cpuIowaitData.push({ x: time, y: parseFloat(row[5]) });
      array[0].cpuIrqData.push({ x: time, y: parseFloat(row[7]) });
      array[0].cpuSoftData.push({ x: time, y: parseFloat(row[8]) });
      array[0].cpuIdleData.push({ x: time, y: parseFloat(row[11]) });
    });
  });

    console.log(cpuArray)


  return { cpuArray, uniqCPU };
}

export function parseMemoryData(sarFileData) {
  const [xlables, ykbmemFree, ykbMemUsed, ymemUsedPrcnt, ykbBuffers, ykbCached, ykbCommit, ycommitPrcnt, ytotalMemory] = [[], [], [], [], [], [], [], [], []];
  let fileVersion = "";

  const header = sarFileData.filter(row => row.includes('kbmemfree'))

  const prasedData = sarFileData.filter(row => {
    if (row.length === header[0].length && !isNaN(row[1])) { // Memory section is exactly 17 columns long, checks if the second column is not a number 
      return true;
    }
  }); // Note RHEL8+ sar files, memory section is 17 Columns

  const filteredArray = prasedData.filter(row => !row.includes('Average:')) // return everything that does not include the word "%usr" which indicates a header

  if (header[0].length === 17) {
    fileVersion = "rhel8+";
  } else if (header[0].length === 11) {
    fileVersion = "rhel7";
  }

  if (fileVersion == "rhel8+") {
    filteredArray.forEach(row => { //pushes values to the array

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

  } else if (fileVersion == "rhel7") {
    filteredArray.forEach(row => { //pushes values to the array

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





  return { xlables, ykbmemFree, ykbMemUsed, ymemUsedPrcnt, ykbBuffers, ykbCached, ykbCommit, ycommitPrcnt, ytotalMemory };
}

export function parseDiskIO(sarFileData) {
  const [xlables, ytps, yreadSec, ywriteSec, yavgRQz, yavgQz, yawaitMS, blockDevices, uniqDev, matchedData, parsedData] = [[], [], [], [], [], [], [], [], [], [], []];

  const rowIncludesDev = sarFileData.map((row, index) => row.includes('DEV') ? index : null).filter(index => typeof index === 'number'); // Verify if row includes usr and returns index of matching pattern. Returns the index of the ocurrences of 'CPU'.
  const firstIndex = rowIncludesDev[0] + 1; // first index not including the first instance 

  const rowIncludesAvg = sarFileData.map((row, index) => row.includes('Average:') ? index : null).filter(index => typeof index === 'number');

  const tempLastIndex = rowIncludesAvg.filter(number => number > rowIncludesDev[0]); // Last index from the array

  const lastIndex = tempLastIndex[0] - 1;


  const diskData = returnDataPortion(firstIndex, lastIndex, sarFileData);


  diskData.forEach(row => { // Obtain list of unique block devices to later use as an iterator and perform Regex
    const block = row[1];

    if (!uniqDev.includes(block)) {
      uniqDev.push(block);
    }
  });


  uniqDev.forEach(block => {
    matchedData.push(returnMatch(`(^${block}$)`, sarFileData));
  });

  matchedData.forEach(array => {
    array.forEach(entry => {
      parsedData.push(entry);
    });
  });



  const filteredArray = parsedData.filter(row => !row.includes('DEV') && !row.includes('Average:')) // return everything that does not include the word "%usr" which indicates a header

  filteredArray.forEach(row => { //pushes values to the array
    const blockDev = row[1];
    xlables.push(row[0]);
    ytps.push(row[2])
    yreadSec.push(parseInt((row[3] * 512) / 1048576)); // Calculate MB/s
    ywriteSec.push(parseInt((row[4] * 512) / 1048576)); // Calculate MB/s
    yavgRQz.push(parseInt((row[5] * 512) / 1024)); // Calculate blocksize in KB
    yavgQz.push(parseInt(row[6]));
    yawaitMS.push(parseFloat(row[7]));
    blockDevices.push(blockDev); // Update found block devices

  });



  return { xlables, ytps, yreadSec, ywriteSec, yavgRQz, yavgQz, yawaitMS, uniqDev, blockDevices }; //export object with arrays
}