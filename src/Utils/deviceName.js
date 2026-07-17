/**
 * Resolves a display name for a raw sar device identifier.
 *
 * @param {string} rawDev - e.g. "dev253-0", "dev8-16"
 * @param {object} deviceMap - e.g. { "dev253-0": "vda", "dev8-16": "sdb" }
 * @returns {string} - The display name
 */
export function getDeviceDisplayName(rawDev, deviceMap) {
  return deviceMap && deviceMap[rawDev] ? deviceMap[rawDev] : rawDev;
}
