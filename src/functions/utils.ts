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
