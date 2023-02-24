export const nameToInitials = (name: string): string => {
  return name
    .toUpperCase()
    .split(' ')
    .map((part) => part.substr(0, 1))
    .join('');
};

export const indexArray = (length: number): number[] => new Array(length).fill(0).map((_, index) => index);

export const setify = <T>(array: T[]): T[] => [...new Set(array)];

export const calcPercent = (numerator: number, denominator: number, toFixed = 2): string => {
  if (isNaN(numerator) || isNaN(denominator) || denominator === 0) return (0).toFixed(2);
  return ((numerator / denominator) * 100.0).toFixed(toFixed);
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function getPlatformOS() {
  const userAgent = window.navigator.userAgent;
  let os = 'Unknown';

  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (/Mac|Mac OS|MacIntel/gi.test(userAgent) && (navigator.maxTouchPoints > 1 || 'ontouchend' in document));

  if (/Macintosh|Mac|Mac OS|MacIntel|MacPPC|Mac68K/gi.test(userAgent)) {
    os = 'Mac OS';
  } else if (isIOS) {
    os = 'iOS';
  } else if (/'Win32|Win64|Windows|Windows NT|WinCE/gi.test(userAgent)) {
    os = 'Windows';
  } else if (/Android/gi.test(userAgent)) {
    os = 'Android';
  } else if (/Linux/gi.test(userAgent)) {
    os = 'Linux';
  }

  return os;
}

export function idMapToList(input: Record<string, Record<string, unknown>>) {
  return Object.entries(input).map(([id, value]) => ({ id, ...value }));
}
