import { v4 } from 'uuid';

export const newBsPpId = () => v4();

export interface Dimensions {
  width: number;
  height: number;
}

export const calculateAspectRatioFit = (
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number): Dimensions => {

  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio
  };
};
