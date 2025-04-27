/**
 * readDataParallel
 * @param {string} data - raw text data (with \n-separated lines)
 * @returns {Promise<Array>} - resolves to parsed and filtered SAR data
 */
export default function readDataParallel(data) {
  const rows = data.split("\n");
  const total = rows.length;
  const numWorkers = navigator.hardwareConcurrency || 4; // Use available CPU cores or default to 4
  const chunkSize = Math.ceil(total / numWorkers);

  const promises = [];
  for (let i = 0; i < numWorkers; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, total);
    const chunk = rows.slice(start, end);

    promises.push(
      new Promise((resolve, reject) => {
        const worker = new Worker(new URL("./readWorker.js", import.meta.url));
        worker.onmessage = (msg) => resolve(msg.data);
        worker.onerror = (err) => reject(err);
        worker.postMessage(chunk);
      })
    );
  }

  // Combine results from all workers
  return Promise.all(promises).then((results) => {
    // URL.revokeObjectURL(woker);
    return results.flat();
  });
}
