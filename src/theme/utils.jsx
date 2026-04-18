import { blue, gold, green, indigo, purple } from './colors';

export const getPrimary = (preset) => {
  switch (preset) {
    case 'blue':
      return blue;
    case 'green':
      return green;
    case 'indigo':
      return indigo;
    case 'purple':
      return purple;
    case 'gold':
    case 'brand':
      return gold;
    default:
      return gold;
  }
};
