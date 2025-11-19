export function getLatestGameVersion(versions: string[]): string {
  return versions
    .map(v => v.split(".").map(n => Number(n)))
    .sort((a, b) => {
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const diff = (b[i] || 0) - (a[i] || 0);
        if (diff !== 0) return diff;
      }
      return 0;
    })[0]
    .join(".");
}