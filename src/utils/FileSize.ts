export function convertUint8ArrayToMB(uint8Array: Uint8Array): number {
  const bytes = uint8Array.length;
  const megabytes = bytes / (1024 * 1024);
  return Math.floor(megabytes * 100) / 100;
}
