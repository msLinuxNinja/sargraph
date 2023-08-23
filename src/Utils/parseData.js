const returnDataPortion = (firstIndex, lastIndex, array) => {
  const resultingArray = array.slice(firstIndex, lastIndex);
  return resultingArray;
};

const returnMatch = (re, array) => {
  // returns new array from matched lines based on regex defined when calling the function
  const regex = new RegExp(re);
  return array.filter((element) => element[1].match(regex));
};

function findMode(arr) {
  const frequency = arr.reduce((count, num) => {
    count[num] = (count[num] || 0) + 1;
    return count;
  }, {});

  let mode;
  let maxFrequency = 0;
  for (const key in frequency) {
    if (frequency.hasOwnProperty(key)) {
      if (frequency[key] > maxFrequency) {
        maxFrequency = frequency[key];
        mode = Number(key);
      }
    }
  }

  return mode;
}

function calculatePollInterval(sarData) {
  const sarDataPortion = sarData.filter(
    (row) =>
      row.includes("all") && !row.includes("Average:") && !row.includes("CPU")
  );
  const dateRange = sarDataPortion.map((row) => {
    return row[0];
  });

  const dates = dateRange.map((entry) => Date.parse(`01/01/2022 ${entry}`));
  const intervals = [];
  dates.forEach((date, i) => {
    if (i > 0) {
      intervals.push((date - dates[i - 1]) / 1000);
    }
  });

  const modeInterval = findMode(intervals);
  const filterInterval = intervals.filter(
    (interval) => interval === modeInterval
  );
  const avgInterval =
    filterInterval.reduce((sum, num) => sum + num, 0) / filterInterval.length;
  return avgInterval;
}

export function parseFileDetails(sarFileData) {
  let kernel = "";
  let hostname = "";
  let date = "";
  let arch = "";

  const header = sarFileData[0];

  if (header.includes("Linux")) {
    kernel = header[1];
    hostname = header[2].replace(/[()]/g, "");
    date = header[3];
    arch = header[4].replace(/^_+|_+[^_]*$/g, "");
  } else {
    kernel = "N/A";
    hostname = "N/A";
    date = "N/A";
  }

  const avgInterval = calculatePollInterval(sarFileData);
  let interval = "";
  if (avgInterval > 60) {
    const minutes = Math.round(avgInterval / 60);
    interval = `${minutes}m`;
  } else {
    interval = `${avgInterval}s`;
  }
  return { kernel, hostname, date, interval, arch };
}

export function parseCPUData(sarFileData) {
  // Parse CPU details and return an object with 8 arrays
  const [uniqCPU, matchedData, parsedData] = [[], [], []];
  let dataArray = [];

  const dateData = sarFileData[0][3].replace(/[-]/g, "/"); // for some reason Date doesn't understand 2023-05-25 🙃
  const rowIncludesUsr = sarFileData
    .map((row, index) => (row.includes("CPU") ? index : null))
    .filter((index) => typeof index === "number"); // Verify if row includes usr and returns index of matching pattern. Returns the index of the ocurrences of 'CPU'.
  const rowIncludesAvg = sarFileData
    .map((row, index) => (row.includes("Average:") ? index : null))
    .filter((index) => typeof index === "number");
  const firstIndex = rowIncludesUsr[0] + 1; // first index not including the first instance

  const lastIndex = rowIncludesAvg[0]; // Last index from the array

  const cpuData = returnDataPortion(firstIndex, lastIndex, sarFileData); // returns the portion of the data from firstIndex to lastIndex
  const cpuFilter = cpuData.filter((row) => !row.includes("%usr"));

  cpuFilter.forEach((row) => {
    // Obtain list of unique CPUs to later use as an iterator and perform Regex
    const cpuNum = row[1];

    if (!uniqCPU.includes(cpuNum)) {
      uniqCPU.push(cpuNum);
    }
  });

  const cpuArray = uniqCPU.map(() => ({
    // Maps through the array of unique CPUs and returns an object with 8 arrays for each CPU metric
    cpuUsrData: [],
    cpuNiceData: [],
    cpuSysData: [],
    cpuIowaitData: [],
    cpuIrqData: [],
    cpuSoftData: [],
    cpuIdleData: [],
  }));

  uniqCPU.forEach((cpu) => {
    // With list of unique CPUs obtain data based on matched reges
    matchedData.push(returnMatch(`(^${cpu}$)`, sarFileData));
  });

  matchedData.forEach((array) => {
    // remove nested arrays

    array.forEach((entry) => {
      parsedData.push(entry);
    });
  });

  const filteredArray = parsedData.filter((row) => {
    // After removing nested array, filter out rows with "CPU", "Average:" and that are less than or equal to 12
    if (!row.includes("CPU") && !row.includes("Average:") && row.length >= 12) {
      return true;
    }
    return false;
  });
  const avgInterval = calculatePollInterval(sarFileData);

  if (avgInterval <= 10) {
    // on large datasets, reduce the datapoints by filtering out by an 18th of the data based on the average polling interval
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

  cpuArray.forEach((array, index) => {
    // Logic to add data to the array of objects

    dataArray
      .filter((row) => row[1] === uniqCPU[index])
      .forEach((row) => {
        const time = Date.parse(`${dateData} ${row[0]} GMT-0600`);
        array.cpuUsrData.push({ x: time, y: parseFloat(row[2]) });
        array.cpuNiceData.push({ x: time, y: parseFloat(row[3]) });
        array.cpuSysData.push({ x: time, y: parseFloat(row[4]) });
        array.cpuIowaitData.push({ x: time, y: parseFloat(row[5]) });
        array.cpuIrqData.push({ x: time, y: parseFloat(row[7]) });
        array.cpuSoftData.push({ x: time, y: parseFloat(row[8]) });
        array.cpuIdleData.push({ x: time, y: parseFloat(row[11]) });
      });
  });

  return { cpuArray, uniqCPU };
}

export function parseMemoryData(sarFileData) {
  const dateData = sarFileData[0][3].replace(/[-]/g, "/");

  const kbMemFree = [];
  const kbMemUsed = [];
  const memUsedPrcnt = [];
  const kbBuffers = [];
  const kbCached = [];
  const kbCommit = [];
  const commitPrcnt = [];
  const totalMemory = [];

  let fileVersion = "";

  const header = sarFileData.filter((row) => row.includes("kbmemfree"));

  const prasedData = sarFileData.filter((row) => {
    if (row.length === header[0].length && !isNaN(row[1])) {
      // Memory section is exactly 17 columns long, checks if the second column is not a number
      return true;
    }
  }); // Note RHEL8+ sar files, memory section is 17 Columns

  const filteredArray = prasedData.filter((row) => !row.includes("Average:")); // return everything that does not include the word "%usr" which indicates a header

  if (header[0].length === 17) {
    fileVersion = "rhel8+";
  } else if (header[0].length === 11) {
    fileVersion = "rhel7";
  }

  if (fileVersion == "rhel8+") {
    filteredArray.forEach((row) => {
      //pushes values to the array

      const time = Date.parse(`${dateData} ${row[0]} GMT-0600`);
      kbMemFree.push({ x: time, y: parseInt(row[1] / 1048576) }); //Dividing by 1048576 gives number in GB instead of KB
      kbMemUsed.push({ x: time, y: parseInt(row[3] / 1048576) });
      memUsedPrcnt.push({ x: time, y: parseInt(row[4]) });
      kbBuffers.push({ x: time, y: parseInt(row[5] / 1048576) });
      kbCached.push({ x: time, y: parseInt(row[6] / 1048576) });
      kbCommit.push({ x: time, y: parseInt(row[7] / 1048576) });
      commitPrcnt.push({ x: time, y: parseInt(row[8]) });
      totalMemory.push({
        x: time,
        y: parseInt(row[1] / 1048576) + parseInt(row[3] / 1048576),
      });
    });
  } else if (fileVersion == "rhel7") {
    filteredArray.forEach((row) => {
      //pushes values to the array
      const time = Date.parse(`${dateData} ${row[0]} GMT-0600`);
      kbMemFree.push({ x: time, y: parseInt(row[1] / 1048576) }); //Dividing by 1048576 gives number in GB instead of KB
      kbMemUsed.push({ x: time, y: parseInt(row[2] / 1048576) });
      memUsedPrcnt.push({ x: time, y: parseInt(row[3]) });
      kbBuffers.push({ x: time, y: parseInt(row[4] / 1048576) });
      kbCached.push({ x: time, y: parseInt(row[5] / 1048576) });
      kbCommit.push({ x: time, y: parseInt(row[6] / 1048576) });
      commitPrcnt.push({ x: time, y: parseInt(row[7]) });
      totalMemory.push({
        x: time,
        y: parseInt(row[1] / 1048576) + parseInt(row[2] / 1048576),
      });
    });
  }

  return {
    kbMemFree,
    kbMemUsed,
    memUsedPrcnt,
    kbBuffers,
    kbCached,
    kbCommit,
    commitPrcnt,
    totalMemory,
  };
}

export function parseDiskIO(sarFileData) {
  const [uniqDev, matchedData, parsedData] = [[], [], []];
  let dataArray = [];
  const dateData = sarFileData[0][3].replace(/[-]/g, "/");
  const header = sarFileData.filter((row) => row.includes("DEV"));

  if (header.length === 0) {
    // verify if the file contains disk data, if not return empty arrays
    console.log(header);
    return { diskArray: [], uniqDev: [] };
  }
  const rowIncludesDev = sarFileData
    .map((row, index) => (row.includes("DEV") ? index : null))
    .filter((index) => typeof index === "number"); // Verify if row includes usr and returns index of matching pattern. Returns the index of the ocurrences of 'DEV'.
  const firstIndex = rowIncludesDev[0] + 1; // first index not including the first instance
  const rowIncludesAvg = sarFileData
    .map((row, index) => (row.includes("Average:") ? index : null))
    .filter((index) => typeof index === "number");
  const tempLastIndex = rowIncludesAvg.filter(
    (number) => number > rowIncludesDev[0]
  ); // Last index from the array

  const lastIndex = tempLastIndex[0];

  const diskPortion = returnDataPortion(firstIndex, lastIndex, sarFileData);
  const diskData = diskPortion.filter((row) => !row.includes("DEV"));

  let fileVersion = "";
  if (header[0].includes("svctm")) {
    fileVersion = "rhel7";
  } else {
    fileVersion = "rhel8+";
  }

  diskData.forEach((row) => {
    // Obtain list of unique block devices to later use as an iterator and perform Regex
    const block = row[1];

    if (!uniqDev.includes(block)) {
      uniqDev.push(block);
    }
  });

  uniqDev.forEach((block) => {
    matchedData.push(returnMatch(`(^${block}$)`, sarFileData));
  });

  uniqDev.sort();

  const diskArray = uniqDev.map(() => ({
    tps: [],
    readSec: [],
    writeSec: [],
    avgRQz: [],
    avgQz: [],
    awaitMS: [],
  }));

  matchedData.forEach((array) => {
    array.forEach((entry) => {
      parsedData.push(entry);
    });
  });

  const avgInterval = calculatePollInterval(sarFileData);
  const filteredArray = parsedData.filter(
    (row) => !row.includes("DEV") && !row.includes("Average:")
  ); // return everything that does not include the word "%usr" which indicates a header

  if (avgInterval <= 10) {
    // on large datasets, reduce the datapoints by filtering out by an 18th of the data based on the average polling interval
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

  if (fileVersion === "rhel8+") {
    diskArray.forEach((array, index) => {
      dataArray
        .filter((row) => row[1] === uniqDev[index])
        .forEach((row) => {
          const time = Date.parse(`${dateData} ${row[0]} GMT-0600`);
          array.tps.push({ x: time, y: parseFloat(row[2]) });
          array.readSec.push({ x: time, y: parseInt(row[3] / 1024) }); // Calculate MB/s
          array.writeSec.push({ x: time, y: parseInt(row[4] / 1024) }); // Calculate MB/s
          array.avgRQz.push({ x: time, y: parseInt((row[6] * 512) / 1024) }); // Calculate blocksize in KB
          array.avgQz.push({ x: time, y: parseInt(row[7]) });
          array.awaitMS.push({ x: time, y: parseFloat(row[8]) });
        });
    });
  } else if (fileVersion === "rhel7") {
    diskArray.forEach((array, index) => {
      dataArray
        .filter((row) => row[1] === uniqDev[index])
        .forEach((row) => {
          const time = Date.parse(`${dateData} ${row[0]} GMT-0600`);
          array.tps.push({ x: time, y: parseFloat(row[2]) });
          array.readSec.push({
            x: time,
            y: parseInt((row[3] * 512) / 1048576),
          }); // Calculate MB/s
          array.writeSec.push({
            x: time,
            y: parseInt((row[4] * 512) / 1048576),
          }); // Calculate MB/s
          array.avgRQz.push({ x: time, y: parseInt((row[5] * 512) / 1024) }); // Calculate blocksize in KB
          array.avgQz.push({ x: time, y: parseInt(row[6]) });
          array.awaitMS.push({ x: time, y: parseFloat(row[7]) });
        });
    });
  }

  return { diskArray, uniqDev }; //export object with arrays
}
