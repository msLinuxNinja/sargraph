// --- Shared helpers ---

function findMode(arr) {
  const frequency = {};
  for (let i = 0; i < arr.length; i++) {
    const num = arr[i];
    frequency[num] = (frequency[num] || 0) + 1;
  }
  let mode;
  let maxFrequency = 0;
  for (const key in frequency) {
    if (frequency[key] > maxFrequency) {
      maxFrequency = frequency[key];
      mode = Number(key);
    }
  }
  return mode;
}

function calculatePollInterval(sarData) {
  const timeCache = new Map();
  let prevTime = null;
  const intervals = [];
  for (let i = 0; i < sarData.length; i++) {
    const row = sarData[i];
    if (row.includes("all") && !row.includes("Average:") && !row.includes("CPU")) {
      const timeStr = row[0];
      let ts = timeCache.get(timeStr);
      if (ts === undefined) {
        ts = Date.parse(`01/01/2022 ${timeStr}`);
        timeCache.set(timeStr, ts);
      }
      if (prevTime !== null) {
        intervals.push((ts - prevTime) / 1000);
      }
      prevTime = ts;
    }
  }
  const modeInterval = findMode(intervals);
  const modeMatches = intervals.filter((v) => v === modeInterval);
  return modeMatches.reduce((sum, num) => sum + num, 0) / modeMatches.length;
}

// Timestamp cache: avoids redundant Date.parse() calls for the same time string
function makeTimeCache(dateData) {
  const cache = new Map();
  return (timeStr) => {
    let ts = cache.get(timeStr);
    if (ts === undefined) {
      ts = Date.parse(`${dateData} ${timeStr} GMT-0600`);
      cache.set(timeStr, ts);
    }
    return ts;
  };
}

// Adaptive downsampling based on polling interval
function downsample(array, avgInterval) {
  if (avgInterval <= 10) return array.filter((_, i) => i % 18 === 0);
  if (avgInterval <= 20) return array.filter((_, i) => i % 15 === 0);
  if (avgInterval <= 30) return array.filter((_, i) => i % 4 === 0);
  if (avgInterval <= 60) return array.filter((_, i) => i % 2 === 0);
  return array;
}

// Find section boundaries using early-exit search
function findSectionBounds(sarFileData, headerKeyword) {
  let firstHeaderIdx = -1;
  for (let i = 0; i < sarFileData.length; i++) {
    if (sarFileData[i].includes(headerKeyword)) {
      firstHeaderIdx = i;
      break;
    }
  }
  if (firstHeaderIdx === -1) return null;
  let avgIdx = -1;
  for (let i = firstHeaderIdx + 1; i < sarFileData.length; i++) {
    if (sarFileData[i].includes("Average:")) {
      avgIdx = i;
      break;
    }
  }
  if (avgIdx === -1) avgIdx = sarFileData.length;
  return { firstIndex: firstHeaderIdx + 1, lastIndex: avgIdx };
}

// Single-pass grouping: groups rows by identifier column (col 1) into a Map
function groupByIdentifier(rows) {
  const groups = new Map();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const key = row[1];
    let arr = groups.get(key);
    if (!arr) {
      arr = [];
      groups.set(key, arr);
    }
    arr.push(row);
  }
  return groups;
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
  const dateData = sarFileData[0][3].replace(/[-]/g, "/");
  const getTime = makeTimeCache(dateData);

  const bounds = findSectionBounds(sarFileData, "CPU");
  if (!bounds) return { cpuArray: [], uniqCPU: [] };

  // Extract CPU data rows (exclude headers)
  const cpuData = sarFileData.slice(bounds.firstIndex, bounds.lastIndex);
  const cpuRows = cpuData.filter((row) => !row.includes("%usr") && !row.includes("CPU") && !row.includes("Average:") && row.length === 12);

  // Single-pass: group rows by CPU identifier and collect unique CPUs
  const grouped = groupByIdentifier(cpuRows);

  const avgInterval = calculatePollInterval(sarFileData);

  const uniqCPU = [...grouped.keys()];
  const cpuArray = uniqCPU.map((cpu) => {
    const obj = {
      cpuUsrData: [],
      cpuNiceData: [],
      cpuSysData: [],
      cpuIowaitData: [],
      cpuIrqData: [],
      cpuSoftData: [],
      cpuIdleData: [],
    };
    const rows = downsample(grouped.get(cpu), avgInterval);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const time = getTime(row[0]);
      obj.cpuUsrData.push({ x: time, y: parseFloat(row[2]) });
      obj.cpuNiceData.push({ x: time, y: parseFloat(row[3]) });
      obj.cpuSysData.push({ x: time, y: parseFloat(row[4]) });
      obj.cpuIowaitData.push({ x: time, y: parseFloat(row[5]) });
      obj.cpuIrqData.push({ x: time, y: parseFloat(row[7]) });
      obj.cpuSoftData.push({ x: time, y: parseFloat(row[8]) });
      obj.cpuIdleData.push({ x: time, y: parseFloat(row[11]) });
    }
    return obj;
  });

  return { cpuArray, uniqCPU };
}

export function parseMemoryData(sarFileData) {
  const dateData = sarFileData[0][3].replace(/[-]/g, "/");
  const getTime = makeTimeCache(dateData);

  const kbMemFree = [];
  const kbMemUsed = [];
  const memUsedPrcnt = [];
  const kbBuffers = [];
  const kbCached = [];
  const kbCommit = [];
  const commitPrcnt = [];
  const totalMemory = [];

  const header = sarFileData.filter((row) => row.includes("kbmemfree"));
  if (header.length === 0) {
    return { kbMemFree, kbMemUsed, memUsedPrcnt, kbBuffers, kbCached, kbCommit, commitPrcnt, totalMemory };
  }

  const expectedLen = header[0].length;
  const isRhel8 = expectedLen === 17;
  // Column indices differ: RHEL8+ has extra columns shifting used/prcnt/buffers/cached/commit/commitprcnt
  const usedIdx = isRhel8 ? 3 : 2;
  const prcntIdx = isRhel8 ? 4 : 3;
  const bufIdx = isRhel8 ? 5 : 4;
  const cacheIdx = isRhel8 ? 6 : 5;
  const commitIdx = isRhel8 ? 7 : 6;
  const commitPIdx = isRhel8 ? 8 : 7;

  const filteredArray = sarFileData.filter(
    (row) => row.length === expectedLen && !isNaN(row[1]) && !row.includes("Average:")
  );

  const avgInterval = calculatePollInterval(sarFileData);
  const dataArray = downsample(filteredArray, avgInterval);

  for (let i = 0; i < dataArray.length; i++) {
    const row = dataArray[i];
    const time = getTime(row[0]);
    const freeGB = parseInt(row[1] / 1048576);
    const usedGB = parseInt(row[usedIdx] / 1048576);
    kbMemFree.push({ x: time, y: freeGB });
    kbMemUsed.push({ x: time, y: usedGB });
    memUsedPrcnt.push({ x: time, y: parseInt(row[prcntIdx]) });
    kbBuffers.push({ x: time, y: parseInt(row[bufIdx] / 1048576) });
    kbCached.push({ x: time, y: parseInt(row[cacheIdx] / 1048576) });
    kbCommit.push({ x: time, y: parseInt(row[commitIdx] / 1048576) });
    commitPrcnt.push({ x: time, y: parseInt(row[commitPIdx]) });
    totalMemory.push({ x: time, y: freeGB + usedGB });
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

export function parseSwapData(sarFileData) {
  const dateData = sarFileData[0][3].replace(/[-]/g, "/");
  const getTime = makeTimeCache(dateData);
  const kbSwapFree = [];
  const kbSwapUsed = [];
  const swapUsedPrcnt = [];
  const totalSwap = [];

  const bounds = findSectionBounds(sarFileData, "kbswpfree");
  if (!bounds) return { kbSwapFree, kbSwapUsed, swapUsedPrcnt, totalSwap };

  const swapPortion = sarFileData.slice(bounds.firstIndex, bounds.lastIndex);
  const swapData = swapPortion.filter((row) => !row.includes("kbswpfree") && !row.includes("Average:"));

  const avgInterval = calculatePollInterval(sarFileData);
  const dataArray = downsample(swapData, avgInterval);

  for (let i = 0; i < dataArray.length; i++) {
    const row = dataArray[i];
    const time = getTime(row[0]);
    const freeGB = parseFloat(row[1] / 1048576);
    const usedGB = parseFloat(row[2] / 1048576);
    kbSwapFree.push({ x: time, y: freeGB });
    kbSwapUsed.push({ x: time, y: usedGB });
    swapUsedPrcnt.push({ x: time, y: parseFloat(row[3]) });
    totalSwap.push({ x: time, y: freeGB + usedGB });
  }
  
  return { kbSwapFree, kbSwapUsed, swapUsedPrcnt, totalSwap };
}

export function parseDiskIO(sarFileData) {
  const dateData = sarFileData[0][3].replace(/[-]/g, "/");
  const getTime = makeTimeCache(dateData);

  // Check for DEV header to detect disk section and version
  let headerRow = null;
  for (let i = 0; i < sarFileData.length; i++) {
    if (sarFileData[i].includes("DEV")) { headerRow = sarFileData[i]; break; }
  }
  if (!headerRow) return { diskArray: [], uniqDev: [] };

  const isRhel7 = headerRow.includes("svctm");

  const bounds = findSectionBounds(sarFileData, "DEV");
  const diskPortion = sarFileData.slice(bounds.firstIndex, bounds.lastIndex);
  const diskData = diskPortion.filter((row) => !row.includes("DEV") && !row.includes("Average:"));

  // Single-pass grouping by device name
  const grouped = groupByIdentifier(diskData);

  const uniqDev = [...grouped.keys()].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );

  const avgInterval = calculatePollInterval(sarFileData);

  const diskArray = uniqDev.map((dev) => {
    const obj = { tps: [], readSec: [], writeSec: [], avgRQz: [], avgQz: [], awaitMS: [] };
    const rows = downsample(grouped.get(dev), avgInterval);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const time = getTime(row[0]);
      obj.tps.push({ x: time, y: parseFloat(row[2]) });
      if (isRhel7) {
        obj.readSec.push({ x: time, y: parseInt((row[3] * 512) / 1048576) });
        obj.writeSec.push({ x: time, y: parseInt((row[4] * 512) / 1048576) });
        obj.avgRQz.push({ x: time, y: parseInt((row[5] * 512) / 1024) });
        obj.avgQz.push({ x: time, y: parseInt(row[6]) });
        obj.awaitMS.push({ x: time, y: parseFloat(row[7]) });
      } else {
        obj.readSec.push({ x: time, y: parseInt(row[3] / 1024) });
        obj.writeSec.push({ x: time, y: parseInt(row[4] / 1024) });
        obj.avgRQz.push({ x: time, y: parseInt((row[6] * 512) / 1024) });
        obj.avgQz.push({ x: time, y: parseInt(row[7]) });
        obj.awaitMS.push({ x: time, y: parseFloat(row[8]) });
      }
    }
    return obj;
  });

  return { diskArray, uniqDev };
}

export function parseNetworkData(sarFileData) {
  const dateData = sarFileData[0][3].replace(/[-]/g, "/");
  const getTime = makeTimeCache(dateData);

  const bounds = findSectionBounds(sarFileData, "rxpck/s");
  if (!bounds) return { netArray: [], uniqIFACE: [] };

  const netPortion = sarFileData.slice(bounds.firstIndex, bounds.lastIndex);
  const netData = netPortion.filter((row) => !row.includes("rxpck/s") && !row.includes("Average:"));

  // Single-pass grouping by interface name
  const grouped = groupByIdentifier(netData);

  const avgInterval = calculatePollInterval(sarFileData);

  const uniqIFACE = [...grouped.keys()].sort();
  const netArray = uniqIFACE.map((iface) => {
    const obj = { rxpck: [], txpck: [], rxkB: [], txkB: [], ifutil: [] };
    const rows = downsample(grouped.get(iface), avgInterval);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const time = getTime(row[0]);
      obj.rxpck.push({ x: time, y: parseFloat(row[2]) });
      obj.txpck.push({ x: time, y: parseFloat(row[3]) });
      obj.rxkB.push({ x: time, y: parseFloat(row[4]) / 1024 });
      obj.txkB.push({ x: time, y: parseFloat(row[5]) / 1024 });
    }
    return obj;
  });

  return { netArray, uniqIFACE };
}

export function parseNetErrorData(sarFileData) {
  const dateData = sarFileData[0][3].replace(/[-]/g, "/");
  const getTime = makeTimeCache(dateData);

  const bounds = findSectionBounds(sarFileData, "rxerr/s");
  if (!bounds) return { netErrArray: [], uniqIFACE: [] };

  const netErrPortion = sarFileData.slice(bounds.firstIndex, bounds.lastIndex);
  const netErrData = netErrPortion.filter((row) => !row.includes("rxerr/s") && !row.includes("Average:"));

  // Single-pass grouping by interface name
  const grouped = groupByIdentifier(netErrData);

  const avgInterval = calculatePollInterval(sarFileData);

  const uniqIFACE = [...grouped.keys()].sort();
  const netErrArray = uniqIFACE.map((iface) => {
    const obj = { rxerr: [], txerr: [], coll: [], rxdrop: [], txdrop: [] };
    const rows = downsample(grouped.get(iface), avgInterval);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const time = getTime(row[0]);
      obj.rxerr.push({ x: time, y: parseFloat(row[2]) });
      obj.txerr.push({ x: time, y: parseFloat(row[3]) });
      obj.coll.push({ x: time, y: parseFloat(row[4]) });
      obj.rxdrop.push({ x: time, y: parseFloat(row[5]) });
      obj.txdrop.push({ x: time, y: parseFloat(row[6]) });
    }
    return obj;
  });

  return { netErrArray, uniqIFACE };
}

export function parsePagingData(sarFileData) {
  const dateData = sarFileData[0][3].replace(/[-]/g, "/");
  const getTime = makeTimeCache(dateData);

  const pgpgin = [];
  const pgpgout = [];
  const fault = [];
  const majflt = [];
  const pgfree = [];
  const pgscank = [];
  const pgscand = [];
  const pgsteal = [];
  const vmeff = [];

  const bounds = findSectionBounds(sarFileData, "pgpgin/s");
  if (!bounds) {
    return { pgpgin, pgpgout, fault, majflt, pgfree, pgscank, pgscand, pgsteal, vmeff };
  }

  const pagingPortion = sarFileData.slice(bounds.firstIndex, bounds.lastIndex);
  const pagingData = pagingPortion.filter(
    (row) => !row.includes("pgpgin/s") && !row.includes("Average:")
  );

  const avgInterval = calculatePollInterval(sarFileData);
  const dataArray = downsample(pagingData, avgInterval);

  for (let i = 0; i < dataArray.length; i++) {
    const row = dataArray[i];
    const time = getTime(row[0]);
    pgpgin.push({ x: time, y: parseFloat(row[1]) });
    pgpgout.push({ x: time, y: parseFloat(row[2]) });
    fault.push({ x: time, y: parseFloat(row[3]) });
    majflt.push({ x: time, y: parseFloat(row[4]) });
    pgfree.push({ x: time, y: parseFloat(row[5]) });
    pgscank.push({ x: time, y: parseFloat(row[6]) });
    pgscand.push({ x: time, y: parseFloat(row[7]) });
    pgsteal.push({ x: time, y: parseFloat(row[8]) });
    vmeff.push({ x: time, y: parseFloat(row[9]) });
  }

  return { pgpgin, pgpgout, fault, majflt, pgfree, pgscank, pgscand, pgsteal, vmeff };
}
