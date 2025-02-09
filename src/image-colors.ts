import type core from 'file-type/core.js';
import type ndarray from 'ndarray';
import getPixels from 'get-pixels';
import quantize from '@lokesh.dhakar/quantize';
import FileType from 'file-type';

type Input = string | Buffer;

export type RgbPixel = [number, number, number];

const createPixelArray = (pixels: Uint8Array, pixelCount: number, quality: number) => {
  const pixelArray: RgbPixel[] = [];

  for (let i = 0, offset, r, g, b, a; i < pixelCount; i += quality) {
    offset = i * 4;
    r = pixels[offset];
    g = pixels[offset + 1];
    b = pixels[offset + 2];
    a = pixels[offset + 3];

    // If pixel is mostly opaque and not white
    if (r !== undefined && g !== undefined && b !== undefined && (a === undefined || a >= 125) && !(r > 250 && g > 250 && b > 250)) {
      pixelArray.push([r, g, b]);
    }
  }

  return pixelArray;
};

const getUrlPixelsAsync = (url: string) => {
  return new Promise<ndarray.NdArray<Uint8Array>>((resolve, reject) => {
    getPixels(url, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

const getBufferPixelsAsync = (buf: Buffer, type: core.MimeType) => {
  return new Promise<ndarray.NdArray<Uint8Array>>((resolve, reject) => {
    getPixels(buf, type, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

const loadImg = async (img: Input) => {
  if (Buffer.isBuffer(img)) {
    const data = await FileType.fromBuffer(img);
    if (!data) throw new Error('Unable to read buffer data, please make sure to pass a valid image buffer.');
    return getBufferPixelsAsync(img, data.mime);
  } else {
    return getUrlPixelsAsync(img);
  }
};

const getColor = async (img: Input, quality?: number) => {
  const palette = await getPalette(img, 5, quality);
  return palette?.at(0);
};

const getPalette = async (img: Input, colorCount = 10, quality = 10) => {
  const { shape, data } = await loadImg(img);
  const [shape0, shape1] = shape;
  if (shape0 === undefined || shape1 === undefined) {
    throw new Error('Unable to get pixel count for this image!');
  }
  const pixelCount = shape0 * shape1;
  const pixelArray = createPixelArray(data, pixelCount, quality);

  const cmap = quantize(pixelArray, colorCount);
  const palette = cmap ? cmap.palette() : undefined;

  return palette;
};

export { getColor, getPalette };
