export default function parseAllParallel(sarFileData) {
  // List of parse tasks and their output keys
  const tasks = [
    "cpuObject",
    "blockObject",
    "memoryObject",
    "swapObject",
    "networkObject",
    "networkErrObject",
    "fileDetails",
  ];

  // Create one worker per task
  const promises = tasks.map((key) => {
    return new Promise((resolve, reject) => {
      // Create a module worker (supports import statements)
      const worker = new Worker(new URL("./parseWorker.js", import.meta.url), {
        type: "module",
      });

      worker.onmessage = ({ data }) => {
        const { funcKey, result, error } = data;
        if (error) {
          reject(new Error(`Worker ${funcKey} error: ${error}`));
        } else {
          resolve({ [funcKey]: result });
        }
        worker.terminate();
      };

      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };

      // Start the worker
      worker.postMessage({ funcKey: key, sarData: sarFileData });
    });
  });

  // Combine all results into a single object
  return Promise.all(promises).then((resultsArray) =>
    Object.assign({}, ...resultsArray)
  );
}
