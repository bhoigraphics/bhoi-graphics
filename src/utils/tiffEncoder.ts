/**
 * Pure client-side baseline TIFF (Tagged Image File Format) encoder
 * Outputs valid uncompressed 24-bit/32-bit RGB/RGBA TIFF files.
 */
export function createTiffBlob(imageData: ImageData): Blob {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const hasAlpha = true;
  const samplesPerPixel = hasAlpha ? 4 : 3;
  const bytesPerSample = 1;
  const rawDataSize = width * height * samplesPerPixel;

  // Header is 8 bytes
  // IFD (Image File Directory) entries: 12 entries * 12 bytes + 2 (count) + 4 (next IFD offset) = 150 bytes
  const ifdOffset = 8;
  const numTags = 12;
  const ifdSize = 2 + numTags * 12 + 4;
  const extraDataOffset = ifdOffset + ifdSize;

  // Extra data: BitsPerSample (4 * 2 bytes = 8 bytes), XResolution (8 bytes), YResolution (8 bytes)
  const bitsPerSampleOffset = extraDataOffset;
  const xResOffset = bitsPerSampleOffset + 8;
  const yResOffset = xResOffset + 8;
  const stripOffset = yResOffset + 8;

  const totalSize = stripOffset + rawDataSize;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);

  // Little-endian header
  view.setUint16(0, 0x4949, true); // 'II'
  view.setUint16(2, 42, true); // TIFF magic number
  view.setUint32(4, ifdOffset, true); // Offset to 1st IFD

  // Number of directory entries
  let pos = ifdOffset;
  view.setUint16(pos, numTags, true);
  pos += 2;

  function writeTag(tag: number, type: number, count: number, value: number) {
    view.setUint16(pos, tag, true);
    view.setUint16(pos + 2, type, true);
    view.setUint32(pos + 4, count, true);
    view.setUint32(pos + 8, value, true);
    pos += 12;
  }

  // Tags:
  // 1: ImageWidth (0x0100, SHORT/LONG)
  writeTag(0x0100, 4, 1, width);
  // 2: ImageLength (0x0101, SHORT/LONG)
  writeTag(0x0101, 4, 1, height);
  // 3: BitsPerSample (0x0102, SHORT, 4 values)
  writeTag(0x0102, 3, samplesPerPixel, bitsPerSampleOffset);
  // 4: Compression (0x0103, SHORT, 1 = no compression)
  writeTag(0x0103, 3, 1, 1);
  // 5: PhotometricInterpretation (0x0106, SHORT, 2 = RGB)
  writeTag(0x0106, 3, 1, 2);
  // 6: StripOffsets (0x0111, LONG, 1)
  writeTag(0x0111, 4, 1, stripOffset);
  // 7: SamplesPerPixel (0x0115, SHORT, 1)
  writeTag(0x0115, 3, 1, samplesPerPixel);
  // 8: RowsPerStrip (0x0116, LONG, 1)
  writeTag(0x0116, 4, 1, height);
  // 9: StripByteCounts (0x0117, LONG, 1)
  writeTag(0x0117, 4, 1, rawDataSize);
  // 10: XResolution (0x011A, RATIONAL, 1)
  writeTag(0x011a, 5, 1, xResOffset);
  // 11: YResolution (0x011B, RATIONAL, 1)
  writeTag(0x011b, 5, 1, yResOffset);
  // 12: ResolutionUnit (0x0128, SHORT, 1, 2 = Inch)
  writeTag(0x0128, 3, 1, 2);

  // Next IFD offset (0)
  view.setUint32(pos, 0, true);

  // Extra data: Bits per sample (8, 8, 8, 8)
  view.setUint16(bitsPerSampleOffset, 8, true);
  view.setUint16(bitsPerSampleOffset + 2, 8, true);
  view.setUint16(bitsPerSampleOffset + 4, 8, true);
  view.setUint16(bitsPerSampleOffset + 6, 8, true);

  // Resolution 300 / 1
  view.setUint32(xResOffset, 300, true);
  view.setUint32(xResOffset + 4, 1, true);
  view.setUint32(yResOffset, 300, true);
  view.setUint32(yResOffset + 4, 1, true);

  // Pixel Data
  let pixelPos = stripOffset;
  for (let i = 0; i < data.length; i += 4) {
    u8[pixelPos++] = data[i]; // R
    u8[pixelPos++] = data[i + 1]; // G
    u8[pixelPos++] = data[i + 2]; // B
    if (hasAlpha) {
      u8[pixelPos++] = data[i + 3]; // A
    }
  }

  return new Blob([buffer], { type: 'image/tiff' });
}
