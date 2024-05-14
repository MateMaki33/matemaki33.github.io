import '@astrojs/internal-helpers/path';
import { A as AstroError, j as InvalidImageService, k as ExpectedImageOptions, E as ExpectedImage, F as FailedToFetchRemoteImageDimensions, c as createAstro, d as createComponent, l as ImageMissingAlt, r as renderTemplate, m as maybeRenderHead, e as addAttribute, s as spreadAttributes, h as renderSlot, f as renderComponent } from '../astro_rT9NWpDx.mjs';
import 'kleur/colors';
import 'html-escaper';
import { _ as _export_sfc, a as $$Layout } from './404_yR3XJ1zS.mjs';
import 'clsx';
/* empty css                                 */
/* empty css                                 */
import { useSSRContext, mergeProps } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
/* empty css                             */
/* empty css                                 */
/* empty css                                 */
import { i as isRemoteImage, a as isESMImportedImage, b as isLocalService, D as DEFAULT_HASH_PROPS } from '../astro/assets-service_BiwtjDER.mjs';

const decoder = new TextDecoder();
const toUTF8String = (input, start = 0, end = input.length) => decoder.decode(input.slice(start, end));
const toHexString = (input, start = 0, end = input.length) => input.slice(start, end).reduce((memo, i) => memo + ("0" + i.toString(16)).slice(-2), "");
const readInt16LE = (input, offset = 0) => {
  const val = input[offset] + input[offset + 1] * 2 ** 8;
  return val | (val & 2 ** 15) * 131070;
};
const readUInt16BE = (input, offset = 0) => input[offset] * 2 ** 8 + input[offset + 1];
const readUInt16LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8;
const readUInt24LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16;
const readInt32LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16 + (input[offset + 3] << 24);
const readUInt32BE = (input, offset = 0) => input[offset] * 2 ** 24 + input[offset + 1] * 2 ** 16 + input[offset + 2] * 2 ** 8 + input[offset + 3];
const readUInt32LE = (input, offset = 0) => input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16 + input[offset + 3] * 2 ** 24;
const methods = {
  readUInt16BE,
  readUInt16LE,
  readUInt32BE,
  readUInt32LE
};
function readUInt(input, bits, offset, isBigEndian) {
  offset = offset || 0;
  const endian = isBigEndian ? "BE" : "LE";
  const methodName = "readUInt" + bits + endian;
  return methods[methodName](input, offset);
}
function readBox(buffer, offset) {
  if (buffer.length - offset < 4)
    return;
  const boxSize = readUInt32BE(buffer, offset);
  if (buffer.length - offset < boxSize)
    return;
  return {
    name: toUTF8String(buffer, 4 + offset, 8 + offset),
    offset,
    size: boxSize
  };
}
function findBox(buffer, boxName, offset) {
  while (offset < buffer.length) {
    const box = readBox(buffer, offset);
    if (!box)
      break;
    if (box.name === boxName)
      return box;
    offset += box.size;
  }
}

const BMP = {
  validate: (input) => toUTF8String(input, 0, 2) === "BM",
  calculate: (input) => ({
    height: Math.abs(readInt32LE(input, 22)),
    width: readUInt32LE(input, 18)
  })
};

const TYPE_ICON = 1;
const SIZE_HEADER$1 = 2 + 2 + 2;
const SIZE_IMAGE_ENTRY = 1 + 1 + 1 + 1 + 2 + 2 + 4 + 4;
function getSizeFromOffset(input, offset) {
  const value = input[offset];
  return value === 0 ? 256 : value;
}
function getImageSize$1(input, imageIndex) {
  const offset = SIZE_HEADER$1 + imageIndex * SIZE_IMAGE_ENTRY;
  return {
    height: getSizeFromOffset(input, offset + 1),
    width: getSizeFromOffset(input, offset)
  };
}
const ICO = {
  validate(input) {
    const reserved = readUInt16LE(input, 0);
    const imageCount = readUInt16LE(input, 4);
    if (reserved !== 0 || imageCount === 0)
      return false;
    const imageType = readUInt16LE(input, 2);
    return imageType === TYPE_ICON;
  },
  calculate(input) {
    const nbImages = readUInt16LE(input, 4);
    const imageSize = getImageSize$1(input, 0);
    if (nbImages === 1)
      return imageSize;
    const imgs = [imageSize];
    for (let imageIndex = 1; imageIndex < nbImages; imageIndex += 1) {
      imgs.push(getImageSize$1(input, imageIndex));
    }
    return {
      height: imageSize.height,
      images: imgs,
      width: imageSize.width
    };
  }
};

const TYPE_CURSOR = 2;
const CUR = {
  validate(input) {
    const reserved = readUInt16LE(input, 0);
    const imageCount = readUInt16LE(input, 4);
    if (reserved !== 0 || imageCount === 0)
      return false;
    const imageType = readUInt16LE(input, 2);
    return imageType === TYPE_CURSOR;
  },
  calculate: (input) => ICO.calculate(input)
};

const DDS = {
  validate: (input) => readUInt32LE(input, 0) === 542327876,
  calculate: (input) => ({
    height: readUInt32LE(input, 12),
    width: readUInt32LE(input, 16)
  })
};

const gifRegexp = /^GIF8[79]a/;
const GIF = {
  validate: (input) => gifRegexp.test(toUTF8String(input, 0, 6)),
  calculate: (input) => ({
    height: readUInt16LE(input, 8),
    width: readUInt16LE(input, 6)
  })
};

const brandMap = {
  avif: "avif",
  mif1: "heif",
  msf1: "heif",
  // hief-sequence
  heic: "heic",
  heix: "heic",
  hevc: "heic",
  // heic-sequence
  hevx: "heic"
  // heic-sequence
};
function detectBrands(buffer, start, end) {
  let brandsDetected = {};
  for (let i = start; i <= end; i += 4) {
    const brand = toUTF8String(buffer, i, i + 4);
    if (brand in brandMap) {
      brandsDetected[brand] = 1;
    }
  }
  if ("avif" in brandsDetected) {
    return "avif";
  } else if ("heic" in brandsDetected || "heix" in brandsDetected || "hevc" in brandsDetected || "hevx" in brandsDetected) {
    return "heic";
  } else if ("mif1" in brandsDetected || "msf1" in brandsDetected) {
    return "heif";
  }
}
const HEIF = {
  validate(buffer) {
    const ftype = toUTF8String(buffer, 4, 8);
    const brand = toUTF8String(buffer, 8, 12);
    return "ftyp" === ftype && brand in brandMap;
  },
  calculate(buffer) {
    const metaBox = findBox(buffer, "meta", 0);
    const iprpBox = metaBox && findBox(buffer, "iprp", metaBox.offset + 12);
    const ipcoBox = iprpBox && findBox(buffer, "ipco", iprpBox.offset + 8);
    const ispeBox = ipcoBox && findBox(buffer, "ispe", ipcoBox.offset + 8);
    if (ispeBox) {
      return {
        height: readUInt32BE(buffer, ispeBox.offset + 16),
        width: readUInt32BE(buffer, ispeBox.offset + 12),
        type: detectBrands(buffer, 8, metaBox.offset)
      };
    }
    throw new TypeError("Invalid HEIF, no size found");
  }
};

const SIZE_HEADER = 4 + 4;
const FILE_LENGTH_OFFSET = 4;
const ENTRY_LENGTH_OFFSET = 4;
const ICON_TYPE_SIZE = {
  ICON: 32,
  "ICN#": 32,
  // m => 16 x 16
  "icm#": 16,
  icm4: 16,
  icm8: 16,
  // s => 16 x 16
  "ics#": 16,
  ics4: 16,
  ics8: 16,
  is32: 16,
  s8mk: 16,
  icp4: 16,
  // l => 32 x 32
  icl4: 32,
  icl8: 32,
  il32: 32,
  l8mk: 32,
  icp5: 32,
  ic11: 32,
  // h => 48 x 48
  ich4: 48,
  ich8: 48,
  ih32: 48,
  h8mk: 48,
  // . => 64 x 64
  icp6: 64,
  ic12: 32,
  // t => 128 x 128
  it32: 128,
  t8mk: 128,
  ic07: 128,
  // . => 256 x 256
  ic08: 256,
  ic13: 256,
  // . => 512 x 512
  ic09: 512,
  ic14: 512,
  // . => 1024 x 1024
  ic10: 1024
};
function readImageHeader(input, imageOffset) {
  const imageLengthOffset = imageOffset + ENTRY_LENGTH_OFFSET;
  return [
    toUTF8String(input, imageOffset, imageLengthOffset),
    readUInt32BE(input, imageLengthOffset)
  ];
}
function getImageSize(type) {
  const size = ICON_TYPE_SIZE[type];
  return { width: size, height: size, type };
}
const ICNS = {
  validate: (input) => toUTF8String(input, 0, 4) === "icns",
  calculate(input) {
    const inputLength = input.length;
    const fileLength = readUInt32BE(input, FILE_LENGTH_OFFSET);
    let imageOffset = SIZE_HEADER;
    let imageHeader = readImageHeader(input, imageOffset);
    let imageSize = getImageSize(imageHeader[0]);
    imageOffset += imageHeader[1];
    if (imageOffset === fileLength)
      return imageSize;
    const result = {
      height: imageSize.height,
      images: [imageSize],
      width: imageSize.width
    };
    while (imageOffset < fileLength && imageOffset < inputLength) {
      imageHeader = readImageHeader(input, imageOffset);
      imageSize = getImageSize(imageHeader[0]);
      imageOffset += imageHeader[1];
      result.images.push(imageSize);
    }
    return result;
  }
};

const J2C = {
  // TODO: this doesn't seem right. SIZ marker doesn't have to be right after the SOC
  validate: (input) => toHexString(input, 0, 4) === "ff4fff51",
  calculate: (input) => ({
    height: readUInt32BE(input, 12),
    width: readUInt32BE(input, 8)
  })
};

const JP2 = {
  validate(input) {
    if (readUInt32BE(input, 4) !== 1783636e3 || readUInt32BE(input, 0) < 1)
      return false;
    const ftypBox = findBox(input, "ftyp", 0);
    if (!ftypBox)
      return false;
    return readUInt32BE(input, ftypBox.offset + 4) === 1718909296;
  },
  calculate(input) {
    const jp2hBox = findBox(input, "jp2h", 0);
    const ihdrBox = jp2hBox && findBox(input, "ihdr", jp2hBox.offset + 8);
    if (ihdrBox) {
      return {
        height: readUInt32BE(input, ihdrBox.offset + 8),
        width: readUInt32BE(input, ihdrBox.offset + 12)
      };
    }
    throw new TypeError("Unsupported JPEG 2000 format");
  }
};

const EXIF_MARKER = "45786966";
const APP1_DATA_SIZE_BYTES = 2;
const EXIF_HEADER_BYTES = 6;
const TIFF_BYTE_ALIGN_BYTES = 2;
const BIG_ENDIAN_BYTE_ALIGN = "4d4d";
const LITTLE_ENDIAN_BYTE_ALIGN = "4949";
const IDF_ENTRY_BYTES = 12;
const NUM_DIRECTORY_ENTRIES_BYTES = 2;
function isEXIF(input) {
  return toHexString(input, 2, 6) === EXIF_MARKER;
}
function extractSize(input, index) {
  return {
    height: readUInt16BE(input, index),
    width: readUInt16BE(input, index + 2)
  };
}
function extractOrientation(exifBlock, isBigEndian) {
  const idfOffset = 8;
  const offset = EXIF_HEADER_BYTES + idfOffset;
  const idfDirectoryEntries = readUInt(exifBlock, 16, offset, isBigEndian);
  for (let directoryEntryNumber = 0; directoryEntryNumber < idfDirectoryEntries; directoryEntryNumber++) {
    const start = offset + NUM_DIRECTORY_ENTRIES_BYTES + directoryEntryNumber * IDF_ENTRY_BYTES;
    const end = start + IDF_ENTRY_BYTES;
    if (start > exifBlock.length) {
      return;
    }
    const block = exifBlock.slice(start, end);
    const tagNumber = readUInt(block, 16, 0, isBigEndian);
    if (tagNumber === 274) {
      const dataFormat = readUInt(block, 16, 2, isBigEndian);
      if (dataFormat !== 3) {
        return;
      }
      const numberOfComponents = readUInt(block, 32, 4, isBigEndian);
      if (numberOfComponents !== 1) {
        return;
      }
      return readUInt(block, 16, 8, isBigEndian);
    }
  }
}
function validateExifBlock(input, index) {
  const exifBlock = input.slice(APP1_DATA_SIZE_BYTES, index);
  const byteAlign = toHexString(
    exifBlock,
    EXIF_HEADER_BYTES,
    EXIF_HEADER_BYTES + TIFF_BYTE_ALIGN_BYTES
  );
  const isBigEndian = byteAlign === BIG_ENDIAN_BYTE_ALIGN;
  const isLittleEndian = byteAlign === LITTLE_ENDIAN_BYTE_ALIGN;
  if (isBigEndian || isLittleEndian) {
    return extractOrientation(exifBlock, isBigEndian);
  }
}
function validateInput(input, index) {
  if (index > input.length) {
    throw new TypeError("Corrupt JPG, exceeded buffer limits");
  }
}
const JPG = {
  validate: (input) => toHexString(input, 0, 2) === "ffd8",
  calculate(input) {
    input = input.slice(4);
    let orientation;
    let next;
    while (input.length) {
      const i = readUInt16BE(input, 0);
      if (input[i] !== 255) {
        input = input.slice(1);
        continue;
      }
      if (isEXIF(input)) {
        orientation = validateExifBlock(input, i);
      }
      validateInput(input, i);
      next = input[i + 1];
      if (next === 192 || next === 193 || next === 194) {
        const size = extractSize(input, i + 5);
        if (!orientation) {
          return size;
        }
        return {
          height: size.height,
          orientation,
          width: size.width
        };
      }
      input = input.slice(i + 2);
    }
    throw new TypeError("Invalid JPG, no size found");
  }
};

const KTX = {
  validate: (input) => {
    const signature = toUTF8String(input, 1, 7);
    return ["KTX 11", "KTX 20"].includes(signature);
  },
  calculate: (input) => {
    const type = input[5] === 49 ? "ktx" : "ktx2";
    const offset = type === "ktx" ? 36 : 20;
    return {
      height: readUInt32LE(input, offset + 4),
      width: readUInt32LE(input, offset),
      type
    };
  }
};

const pngSignature = "PNG\r\n\n";
const pngImageHeaderChunkName = "IHDR";
const pngFriedChunkName = "CgBI";
const PNG = {
  validate(input) {
    if (pngSignature === toUTF8String(input, 1, 8)) {
      let chunkName = toUTF8String(input, 12, 16);
      if (chunkName === pngFriedChunkName) {
        chunkName = toUTF8String(input, 28, 32);
      }
      if (chunkName !== pngImageHeaderChunkName) {
        throw new TypeError("Invalid PNG");
      }
      return true;
    }
    return false;
  },
  calculate(input) {
    if (toUTF8String(input, 12, 16) === pngFriedChunkName) {
      return {
        height: readUInt32BE(input, 36),
        width: readUInt32BE(input, 32)
      };
    }
    return {
      height: readUInt32BE(input, 20),
      width: readUInt32BE(input, 16)
    };
  }
};

const PNMTypes = {
  P1: "pbm/ascii",
  P2: "pgm/ascii",
  P3: "ppm/ascii",
  P4: "pbm",
  P5: "pgm",
  P6: "ppm",
  P7: "pam",
  PF: "pfm"
};
const handlers = {
  default: (lines) => {
    let dimensions = [];
    while (lines.length > 0) {
      const line = lines.shift();
      if (line[0] === "#") {
        continue;
      }
      dimensions = line.split(" ");
      break;
    }
    if (dimensions.length === 2) {
      return {
        height: parseInt(dimensions[1], 10),
        width: parseInt(dimensions[0], 10)
      };
    } else {
      throw new TypeError("Invalid PNM");
    }
  },
  pam: (lines) => {
    const size = {};
    while (lines.length > 0) {
      const line = lines.shift();
      if (line.length > 16 || line.charCodeAt(0) > 128) {
        continue;
      }
      const [key, value] = line.split(" ");
      if (key && value) {
        size[key.toLowerCase()] = parseInt(value, 10);
      }
      if (size.height && size.width) {
        break;
      }
    }
    if (size.height && size.width) {
      return {
        height: size.height,
        width: size.width
      };
    } else {
      throw new TypeError("Invalid PAM");
    }
  }
};
const PNM = {
  validate: (input) => toUTF8String(input, 0, 2) in PNMTypes,
  calculate(input) {
    const signature = toUTF8String(input, 0, 2);
    const type = PNMTypes[signature];
    const lines = toUTF8String(input, 3).split(/[\r\n]+/);
    const handler = handlers[type] || handlers.default;
    return handler(lines);
  }
};

const PSD = {
  validate: (input) => toUTF8String(input, 0, 4) === "8BPS",
  calculate: (input) => ({
    height: readUInt32BE(input, 14),
    width: readUInt32BE(input, 18)
  })
};

const svgReg = /<svg\s([^>"']|"[^"]*"|'[^']*')*>/;
const extractorRegExps = {
  height: /\sheight=(['"])([^%]+?)\1/,
  root: svgReg,
  viewbox: /\sviewBox=(['"])(.+?)\1/i,
  width: /\swidth=(['"])([^%]+?)\1/
};
const INCH_CM = 2.54;
const units = {
  in: 96,
  cm: 96 / INCH_CM,
  em: 16,
  ex: 8,
  m: 96 / INCH_CM * 100,
  mm: 96 / INCH_CM / 10,
  pc: 96 / 72 / 12,
  pt: 96 / 72,
  px: 1
};
const unitsReg = new RegExp(
  // eslint-disable-next-line regexp/prefer-d
  `^([0-9.]+(?:e\\d+)?)(${Object.keys(units).join("|")})?$`
);
function parseLength(len) {
  const m = unitsReg.exec(len);
  if (!m) {
    return void 0;
  }
  return Math.round(Number(m[1]) * (units[m[2]] || 1));
}
function parseViewbox(viewbox) {
  const bounds = viewbox.split(" ");
  return {
    height: parseLength(bounds[3]),
    width: parseLength(bounds[2])
  };
}
function parseAttributes(root) {
  const width = root.match(extractorRegExps.width);
  const height = root.match(extractorRegExps.height);
  const viewbox = root.match(extractorRegExps.viewbox);
  return {
    height: height && parseLength(height[2]),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    viewbox: viewbox && parseViewbox(viewbox[2]),
    width: width && parseLength(width[2])
  };
}
function calculateByDimensions(attrs) {
  return {
    height: attrs.height,
    width: attrs.width
  };
}
function calculateByViewbox(attrs, viewbox) {
  const ratio = viewbox.width / viewbox.height;
  if (attrs.width) {
    return {
      height: Math.floor(attrs.width / ratio),
      width: attrs.width
    };
  }
  if (attrs.height) {
    return {
      height: attrs.height,
      width: Math.floor(attrs.height * ratio)
    };
  }
  return {
    height: viewbox.height,
    width: viewbox.width
  };
}
const SVG = {
  // Scan only the first kilo-byte to speed up the check on larger files
  validate: (input) => svgReg.test(toUTF8String(input, 0, 1e3)),
  calculate(input) {
    const root = toUTF8String(input).match(extractorRegExps.root);
    if (root) {
      const attrs = parseAttributes(root[0]);
      if (attrs.width && attrs.height) {
        return calculateByDimensions(attrs);
      }
      if (attrs.viewbox) {
        return calculateByViewbox(attrs, attrs.viewbox);
      }
    }
    throw new TypeError("Invalid SVG");
  }
};

const TGA = {
  validate(input) {
    return readUInt16LE(input, 0) === 0 && readUInt16LE(input, 4) === 0;
  },
  calculate(input) {
    return {
      height: readUInt16LE(input, 14),
      width: readUInt16LE(input, 12)
    };
  }
};

function readIFD(input, isBigEndian) {
  const ifdOffset = readUInt(input, 32, 4, isBigEndian);
  return input.slice(ifdOffset + 2);
}
function readValue(input, isBigEndian) {
  const low = readUInt(input, 16, 8, isBigEndian);
  const high = readUInt(input, 16, 10, isBigEndian);
  return (high << 16) + low;
}
function nextTag(input) {
  if (input.length > 24) {
    return input.slice(12);
  }
}
function extractTags(input, isBigEndian) {
  const tags = {};
  let temp = input;
  while (temp && temp.length) {
    const code = readUInt(temp, 16, 0, isBigEndian);
    const type = readUInt(temp, 16, 2, isBigEndian);
    const length = readUInt(temp, 32, 4, isBigEndian);
    if (code === 0) {
      break;
    } else {
      if (length === 1 && (type === 3 || type === 4)) {
        tags[code] = readValue(temp, isBigEndian);
      }
      temp = nextTag(temp);
    }
  }
  return tags;
}
function determineEndianness(input) {
  const signature = toUTF8String(input, 0, 2);
  if ("II" === signature) {
    return "LE";
  } else if ("MM" === signature) {
    return "BE";
  }
}
const signatures = [
  // '492049', // currently not supported
  "49492a00",
  // Little endian
  "4d4d002a"
  // Big Endian
  // '4d4d002a', // BigTIFF > 4GB. currently not supported
];
const TIFF = {
  validate: (input) => signatures.includes(toHexString(input, 0, 4)),
  calculate(input) {
    const isBigEndian = determineEndianness(input) === "BE";
    const ifdBuffer = readIFD(input, isBigEndian);
    const tags = extractTags(ifdBuffer, isBigEndian);
    const width = tags[256];
    const height = tags[257];
    if (!width || !height) {
      throw new TypeError("Invalid Tiff. Missing tags");
    }
    return { height, width };
  }
};

function calculateExtended(input) {
  return {
    height: 1 + readUInt24LE(input, 7),
    width: 1 + readUInt24LE(input, 4)
  };
}
function calculateLossless(input) {
  return {
    height: 1 + ((input[4] & 15) << 10 | input[3] << 2 | (input[2] & 192) >> 6),
    width: 1 + ((input[2] & 63) << 8 | input[1])
  };
}
function calculateLossy(input) {
  return {
    height: readInt16LE(input, 8) & 16383,
    width: readInt16LE(input, 6) & 16383
  };
}
const WEBP = {
  validate(input) {
    const riffHeader = "RIFF" === toUTF8String(input, 0, 4);
    const webpHeader = "WEBP" === toUTF8String(input, 8, 12);
    const vp8Header = "VP8" === toUTF8String(input, 12, 15);
    return riffHeader && webpHeader && vp8Header;
  },
  calculate(input) {
    const chunkHeader = toUTF8String(input, 12, 16);
    input = input.slice(20, 30);
    if (chunkHeader === "VP8X") {
      const extendedHeader = input[0];
      const validStart = (extendedHeader & 192) === 0;
      const validEnd = (extendedHeader & 1) === 0;
      if (validStart && validEnd) {
        return calculateExtended(input);
      } else {
        throw new TypeError("Invalid WebP");
      }
    }
    if (chunkHeader === "VP8 " && input[0] !== 47) {
      return calculateLossy(input);
    }
    const signature = toHexString(input, 3, 6);
    if (chunkHeader === "VP8L" && signature !== "9d012a") {
      return calculateLossless(input);
    }
    throw new TypeError("Invalid WebP");
  }
};

const typeHandlers = /* @__PURE__ */ new Map([
  ["bmp", BMP],
  ["cur", CUR],
  ["dds", DDS],
  ["gif", GIF],
  ["heif", HEIF],
  ["icns", ICNS],
  ["ico", ICO],
  ["j2c", J2C],
  ["jp2", JP2],
  ["jpg", JPG],
  ["ktx", KTX],
  ["png", PNG],
  ["pnm", PNM],
  ["psd", PSD],
  ["svg", SVG],
  ["tga", TGA],
  ["tiff", TIFF],
  ["webp", WEBP]
]);
const types = Array.from(typeHandlers.keys());

const firstBytes = /* @__PURE__ */ new Map([
  [56, "psd"],
  [66, "bmp"],
  [68, "dds"],
  [71, "gif"],
  [73, "tiff"],
  [77, "tiff"],
  [82, "webp"],
  [105, "icns"],
  [137, "png"],
  [255, "jpg"]
]);
function detector(input) {
  const byte = input[0];
  const type = firstBytes.get(byte);
  if (type && typeHandlers.get(type).validate(input)) {
    return type;
  }
  return types.find((fileType) => typeHandlers.get(fileType).validate(input));
}

const globalOptions = {
  disabledTypes: []
};
function lookup(input) {
  const type = detector(input);
  if (typeof type !== "undefined") {
    if (globalOptions.disabledTypes.indexOf(type) > -1) {
      throw new TypeError("disabled file type: " + type);
    }
    const size = typeHandlers.get(type).calculate(input);
    if (size !== void 0) {
      size.type = size.type ?? type;
      return size;
    }
  }
  throw new TypeError("unsupported file type: " + type);
}

async function probe(url) {
  const response = await fetch(url);
  if (!response.body || !response.ok) {
    throw new Error("Failed to fetch image");
  }
  const reader = response.body.getReader();
  let done, value;
  let accumulatedChunks = new Uint8Array();
  while (!done) {
    const readResult = await reader.read();
    done = readResult.done;
    if (done)
      break;
    if (readResult.value) {
      value = readResult.value;
      let tmp = new Uint8Array(accumulatedChunks.length + value.length);
      tmp.set(accumulatedChunks, 0);
      tmp.set(value, accumulatedChunks.length);
      accumulatedChunks = tmp;
      try {
        const dimensions = lookup(accumulatedChunks);
        if (dimensions) {
          await reader.cancel();
          return dimensions;
        }
      } catch (error) {
      }
    }
  }
  throw new Error("Failed to parse the size");
}

async function getConfiguredImageService() {
  if (!globalThis?.astroAsset?.imageService) {
    const { default: service } = await import(
      // @ts-expect-error
      '../astro/assets-service_BiwtjDER.mjs'
    ).then(n => n.s).catch((e) => {
      const error = new AstroError(InvalidImageService);
      error.cause = e;
      throw error;
    });
    if (!globalThis.astroAsset)
      globalThis.astroAsset = {};
    globalThis.astroAsset.imageService = service;
    return service;
  }
  return globalThis.astroAsset.imageService;
}
async function getImage$1(options, imageConfig) {
  if (!options || typeof options !== "object") {
    throw new AstroError({
      ...ExpectedImageOptions,
      message: ExpectedImageOptions.message(JSON.stringify(options))
    });
  }
  if (typeof options.src === "undefined") {
    throw new AstroError({
      ...ExpectedImage,
      message: ExpectedImage.message(
        options.src,
        "undefined",
        JSON.stringify(options)
      )
    });
  }
  const service = await getConfiguredImageService();
  const resolvedOptions = {
    ...options,
    src: typeof options.src === "object" && "then" in options.src ? (await options.src).default ?? await options.src : options.src
  };
  if (options.inferSize && isRemoteImage(resolvedOptions.src)) {
    try {
      const result = await probe(resolvedOptions.src);
      resolvedOptions.width ??= result.width;
      resolvedOptions.height ??= result.height;
      delete resolvedOptions.inferSize;
    } catch {
      throw new AstroError({
        ...FailedToFetchRemoteImageDimensions,
        message: FailedToFetchRemoteImageDimensions.message(resolvedOptions.src)
      });
    }
  }
  const originalPath = isESMImportedImage(resolvedOptions.src) ? resolvedOptions.src.fsPath : resolvedOptions.src;
  const clonedSrc = isESMImportedImage(resolvedOptions.src) ? (
    // @ts-expect-error - clone is a private, hidden prop
    resolvedOptions.src.clone ?? resolvedOptions.src
  ) : resolvedOptions.src;
  resolvedOptions.src = clonedSrc;
  const validatedOptions = service.validateOptions ? await service.validateOptions(resolvedOptions, imageConfig) : resolvedOptions;
  const srcSetTransforms = service.getSrcSet ? await service.getSrcSet(validatedOptions, imageConfig) : [];
  let imageURL = await service.getURL(validatedOptions, imageConfig);
  let srcSets = await Promise.all(
    srcSetTransforms.map(async (srcSet) => ({
      transform: srcSet.transform,
      url: await service.getURL(srcSet.transform, imageConfig),
      descriptor: srcSet.descriptor,
      attributes: srcSet.attributes
    }))
  );
  if (isLocalService(service) && globalThis.astroAsset.addStaticImage && !(isRemoteImage(validatedOptions.src) && imageURL === validatedOptions.src)) {
    const propsToHash = service.propertiesToHash ?? DEFAULT_HASH_PROPS;
    imageURL = globalThis.astroAsset.addStaticImage(validatedOptions, propsToHash, originalPath);
    srcSets = srcSetTransforms.map((srcSet) => ({
      transform: srcSet.transform,
      url: globalThis.astroAsset.addStaticImage(srcSet.transform, propsToHash, originalPath),
      descriptor: srcSet.descriptor,
      attributes: srcSet.attributes
    }));
  }
  return {
    rawOptions: resolvedOptions,
    options: validatedOptions,
    src: imageURL,
    srcSet: {
      values: srcSets,
      attribute: srcSets.map((srcSet) => `${srcSet.url} ${srcSet.descriptor}`).join(", ")
    },
    attributes: service.getHTMLAttributes !== void 0 ? await service.getHTMLAttributes(validatedOptions, imageConfig) : {}
  };
}

const $$Astro$6 = createAstro("https://MateMaki33.github.io");
const $$Image = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Image;
  const props = Astro2.props;
  if (props.alt === void 0 || props.alt === null) {
    throw new AstroError(ImageMissingAlt);
  }
  if (typeof props.width === "string") {
    props.width = parseInt(props.width);
  }
  if (typeof props.height === "string") {
    props.height = parseInt(props.height);
  }
  const image = await getImage(props);
  const additionalAttributes = {};
  if (image.srcSet.values.length > 0) {
    additionalAttributes.srcset = image.srcSet.attribute;
  }
  return renderTemplate`${maybeRenderHead()}<img${addAttribute(image.src, "src")}${spreadAttributes(additionalAttributes)}${spreadAttributes(image.attributes)}>`;
}, "C:/Users/matem/Desktop/Huesa/node_modules/astro/components/Image.astro", void 0);

const $$Astro$5 = createAstro("https://MateMaki33.github.io");
const $$Picture = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$Picture;
  const defaultFormats = ["webp"];
  const defaultFallbackFormat = "png";
  const specialFormatsFallback = ["gif", "svg", "jpg", "jpeg"];
  const { formats = defaultFormats, pictureAttributes = {}, fallbackFormat, ...props } = Astro2.props;
  if (props.alt === void 0 || props.alt === null) {
    throw new AstroError(ImageMissingAlt);
  }
  const optimizedImages = await Promise.all(
    formats.map(
      async (format) => await getImage({ ...props, format, widths: props.widths, densities: props.densities })
    )
  );
  let resultFallbackFormat = fallbackFormat ?? defaultFallbackFormat;
  if (!fallbackFormat && isESMImportedImage(props.src) && specialFormatsFallback.includes(props.src.format)) {
    resultFallbackFormat = props.src.format;
  }
  const fallbackImage = await getImage({
    ...props,
    format: resultFallbackFormat,
    widths: props.widths,
    densities: props.densities
  });
  const imgAdditionalAttributes = {};
  const sourceAdditionalAttributes = {};
  if (props.sizes) {
    sourceAdditionalAttributes.sizes = props.sizes;
  }
  if (fallbackImage.srcSet.values.length > 0) {
    imgAdditionalAttributes.srcset = fallbackImage.srcSet.attribute;
  }
  return renderTemplate`${maybeRenderHead()}<picture${spreadAttributes(pictureAttributes)}> ${Object.entries(optimizedImages).map(([_, image]) => {
    const srcsetAttribute = props.densities || !props.densities && !props.widths ? `${image.src}${image.srcSet.values.length > 0 ? ", " + image.srcSet.attribute : ""}` : image.srcSet.attribute;
    return renderTemplate`<source${addAttribute(srcsetAttribute, "srcset")}${addAttribute("image/" + image.options.format, "type")}${spreadAttributes(sourceAdditionalAttributes)}>`;
  })} <img${addAttribute(fallbackImage.src, "src")}${spreadAttributes(imgAdditionalAttributes)}${spreadAttributes(fallbackImage.attributes)}> </picture>`;
}, "C:/Users/matem/Desktop/Huesa/node_modules/astro/components/Picture.astro", void 0);

const imageConfig = {"service":{"entrypoint":"astro/assets/services/sharp","config":{}},"domains":[],"remotePatterns":[],"endpoint":"astro/assets/endpoint/node"};
					const outDir = new URL("file:///C:/Users/matem/Desktop/Huesa/dist/client/");
					const assetsDir = new URL("_astro", outDir);
					const getImage = async (options) => await getImage$1(options, imageConfig);

const $$Astro$4 = createAstro("https://MateMaki33.github.io");
const $$Styledsection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Styledsection;
  const { skew, idName, displayPosition } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="section-styled noVisible"${addAttribute(skew, "data-skew")}${addAttribute(displayPosition, "data-displayPosition")}${addAttribute(idName, "id")}> ${renderSlot($$result, $$slots["default"])} </section> `;
}, "C:/Users/matem/Desktop/Huesa/src/components/styledsection.astro", void 0);

const $$Astro$3 = createAstro("https://MateMaki33.github.io");
const $$Flgridsection = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Flgridsection;
  const { className, idName, title } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section${addAttribute(className, "class")}${addAttribute(idName, "id")}> <h1>${title}</h1> ${renderSlot($$result, $$slots["default"])} </section> `;
}, "C:/Users/matem/Desktop/Huesa/src/components/flgridsection.astro", void 0);

const _sfc_main = {
  __name: 'cardvue',
  props: {
    image: {
      type: String,
      required: true
    },
    cardTitle: {
      type: String,
      required: true
    },
    captionImg: {
      type: String,
      default: ''
    },
    altText: {
      type: String,
      required: true
    },
    className: {
      type: String,
      required: true
    },
    bgColor:{
      type: String,
      required: false
    }
  },
  setup(__props, { expose: __expose }) {
  __expose();

  
  const props = __props;
  
const __returned__ = { props };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<article${
    ssrRenderAttrs(mergeProps({
      class: $props.className,
      "data-bg-color": $props.bgColor
    }, _attrs))
  } data-v-99002516><div class="card-image" data-v-99002516><figure data-v-99002516><img${
    ssrRenderAttr("src", $props.image)
  } class="image"${
    ssrRenderAttr("alt", $props.altText)
  } data-v-99002516>`);
  if ($props.captionImg) {
    _push(`<figcaption data-v-99002516>${ssrInterpolate($props.captionImg)}</figcaption>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</figure></div><div class="card-body" data-v-99002516><h2 data-v-99002516>${ssrInterpolate($props.cardTitle)}</h2>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div></article>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext()
  ;(ssrContext.modules || (ssrContext.modules = new Set())).add("src/components/cardvue.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined
};
const Cardvue = /*#__PURE__*/_export_sfc(_sfc_main, [['ssrRender',_sfc_ssrRender],['__scopeId',"data-v-99002516"]]);

const $$Astro$2 = createAstro("https://MateMaki33.github.io");
const $$Movecard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Movecard;
  const { title, content } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="tilting-card-wrapper noVisible" data-astro-cid-snr22kn6> <div class="mouse-position-tracker" data-astro-cid-snr22kn6></div> <div class="mouse-position-tracker" data-astro-cid-snr22kn6></div> <div class="mouse-position-tracker" data-astro-cid-snr22kn6></div> <div class="mouse-position-tracker" data-astro-cid-snr22kn6></div> <div class="mouse-position-tracker" data-astro-cid-snr22kn6></div> <div class="mouse-position-tracker" data-astro-cid-snr22kn6></div> <div class="mouse-position-tracker" data-astro-cid-snr22kn6></div> <div class="mouse-position-tracker" data-astro-cid-snr22kn6></div> <div class="mouse-position-tracker" data-astro-cid-snr22kn6></div> <div class="tilting-card-content" data-astro-cid-snr22kn6> <h3 data-astro-cid-snr22kn6>${title}</h3> <p data-astro-cid-snr22kn6>${content}</p> ${renderSlot($$result, $$slots["default"])} </div> </div> `;
}, "C:/Users/matem/Desktop/Huesa/src/components/movecard.astro", void 0);

const $$Astro$1 = createAstro("https://MateMaki33.github.io");
const $$Simpledescription = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Simpledescription;
  const { title } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<article class="simple-description" data-astro-cid-34glgqnp> <h1 data-astro-cid-34glgqnp>${title}</h1> <div class="simple-description-inner" data-astro-cid-34glgqnp> ${renderSlot($$result, $$slots["default"])} </div> </article> `;
}, "C:/Users/matem/Desktop/Huesa/src/components/simpledescription.astro", void 0);

const ayuntamientoImage = new Proxy({"src":"/_astro/ayuntamiento.Di245mpc.jpg","width":214,"height":350,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/matem/Desktop/Huesa/public/images/ayuntamiento.jpg";
							}
							
							return target[name];
						}
					});

const $$Astro = createAstro("https://MateMaki33.github.io");
const $$Ayuntamiento = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Ayuntamiento;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Ayuntamiento", "data-astro-cid-fitobr56": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="alcalde-container flex" data-astro-cid-fitobr56> <div class="alcalde-card-wrapper" data-astro-cid-fitobr56> ${renderComponent($$result2, "Cardvue", Cardvue, { "altText": "Alcalde", "cardTitle": "Angel Padilla Romero", "className": "card-flex-column-100", "image": "/images/alcalde.jpg", "captionImg": "", "data-astro-cid-fitobr56": true }, { "default": ($$result3) => renderTemplate` <ul class="alcalde-links flex" data-astro-cid-fitobr56> <li data-astro-cid-fitobr56><a href="" title="Enlace externo: " data-astro-cid-fitobr56><img src="/images/icons/facebook2.svg" data-astro-cid-fitobr56></a></li> <li data-astro-cid-fitobr56><a href="" title="Enlace externo: " data-astro-cid-fitobr56><img src="/images/icons/instagram.svg" data-astro-cid-fitobr56></a></li> <li data-astro-cid-fitobr56><a href="" title="Enlace externo: " data-astro-cid-fitobr56><img src="/images/icons/twitter.svg" data-astro-cid-fitobr56></a></li> </ul> ` })} </div> ${renderComponent($$result2, "Simpledescription", $$Simpledescription, { "title": "\xA1 Te saluda el Alcalde !", "data-astro-cid-fitobr56": true }, { "default": ($$result3) => renderTemplate` <p data-astro-cid-fitobr56>Es para mi un honor, como alcalde de <strong data-astro-cid-fitobr56>Huesa</strong> , darte la bienvenida a nuestro municipio a través de esta ventana al mundo que es Internet.</p><br data-astro-cid-fitobr56> <p data-astro-cid-fitobr56>Déjame mostrarte cómo se organiza el Ayuntamiento</p> ` })} </section> ${renderComponent($$result2, "StyledSection", $$Styledsection, { "idName": "presentacion", "displayPosition": "center", "data-astro-cid-fitobr56": true }, { "default": ($$result3) => renderTemplate` <h1 data-astro-cid-fitobr56>Concejalías y organigrama</h1> ` })} <section class="concejalias-wrapper" data-astro-cid-fitobr56> <div class="concejalias-inner" id="concejalias-wrapper" data-astro-cid-fitobr56> ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "D.Pablo Carmona Jord\xE1n", "content": "C1\xBA Teniente de Alcalde", "data-astro-cid-fitobr56": true })} ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "D\xAA Francisca Romero Alcal\xE1", "content": "Concejala de las \xE1reas de Igualdad, Bienestar Social y Salud, Tercera Edad y Educaci\xF3n", "data-astro-cid-fitobr56": true })} ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "D. Manuel Moreno Padilla", "content": "Concejal de las \xE1reas de Cultura y Deporte, Economia y Hacienda", "data-astro-cid-fitobr56": true })} ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "D\xAA Isabel Mart\xEDnez Moreno", "content": "Concejala de las \xE1reas de Turismo, Juventud y Tiempo Libre", "data-astro-cid-fitobr56": true })} ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "D\xAA Mar\xEDa Francisca Moreno Esquinas", "content": "Delegada para la aldea de Cerrillo", "data-astro-cid-fitobr56": true })} ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "D.Pablo Carmona Jord\xE1n", "content": "Delegado para la aldea de Ceal", "data-astro-cid-fitobr56": true })} ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "Manuel Vilar Sierra", "content": "Partido Popular", "data-astro-cid-fitobr56": true })} ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "Jos\xE9 Luis Padilla Romero", "content": "Partido Popular", "data-astro-cid-fitobr56": true })} ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "Yolanda S\xE1ez Cuevas", "content": "Partido Popular", "data-astro-cid-fitobr56": true })} ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "Laura Alcal\xE1 Molina", "content": "IULV-CA", "data-astro-cid-fitobr56": true })} ${renderComponent($$result2, "Movecard", $$Movecard, { "title": "Jaime Mar\xEDn Aguilar", "content": "IULV-CA", "data-astro-cid-fitobr56": true })} </div> </section> ${renderComponent($$result2, "StyledSection", $$Styledsection, { "skew": "left", "idName": "presentacion", "displayPosition": "center", "data-astro-cid-fitobr56": true }, { "default": ($$result3) => renderTemplate` <h1 data-astro-cid-fitobr56>Nuestras Sedes</h1> ` })} <div style="height:max(10vh, 10vw)" data-astro-cid-fitobr56></div> ${renderComponent($$result2, "NormalSection", $$Flgridsection, { "className": "section-grid-2", "title": "Centro Municipal de Informacion a la Mujer", "data-astro-cid-fitobr56": true }, { "default": ($$result3) => renderTemplate` <div class="womens-bow noVisible" id="womens-information" data-astro-cid-fitobr56></div> ${renderComponent($$result3, "Image", $$Image, { "src": ayuntamientoImage, "alt": "Ayuntamiento de Huesa", "loading": "lazy", "data-astro-cid-fitobr56": true })} <article class="noVisible" data-astro-cid-fitobr56> <p data-astro-cid-fitobr56>El <strong style="color:pink" data-astro-cid-fitobr56>Centro Municipal de Información a la Mujer (CMIM)</strong> de Guadiana Menor nace gracias a la voluntad de colaboración y trabajo de las administraciones locales de los Excelentísimos Ayuntamientos de Huesa, Quesada, Hinojares, Larva y Pozo Alcón, a través de un convenio con el Instituto Andaluz De La Mujer (IAM). A través de dicho convenio se pone en marcha el 14 de Febrero de 2009, un dispositivo específico y gratuito dirigido a TODAS LAS MUJERES DE LA COMARCA.</p> </article> <article class="noVisible" data-astro-cid-fitobr56> <p data-astro-cid-fitobr56><strong style="color:pink" data-astro-cid-fitobr56>POR Y PARA LAS MUJERES</strong></p> </article> <article class="noVisible" data-astro-cid-fitobr56> <p data-astro-cid-fitobr56><strong style="color:pink" data-astro-cid-fitobr56>IGUALDAD DE OPORTUNIDADES, LA PREVENCIÓN y LA ELIMINACIÓN DE LA VIOLENCIA DE GÉNERO.</strong></p> </article> ${renderComponent($$result3, "Movecard", $$Movecard, { "title": "Horario", "content": "JUEVES DE 9:30 A 14:30. VIERNES DE 8:00 A 14:30 TEL\xC9FONO: 686 513 876", "data-astro-cid-fitobr56": true })} ${renderComponent($$result3, "Movecard", $$Movecard, { "title": "Participaci\xF3n", "data-astro-cid-fitobr56": true }, { "default": ($$result4) => renderTemplate` <ul style=" color: white; text-align:start;" data-astro-cid-fitobr56> <li data-astro-cid-fitobr56>Fomento de la participación de las mujeres en todos los aspectos de la vida</li> <li data-astro-cid-fitobr56>Funcionamiento y dinamización de asociaciones de mujeres.</li> <li data-astro-cid-fitobr56>Coordinación y desarrollo de programas de coeducación con los centros educativos.</li> <li data-astro-cid-fitobr56>Campañas de sensibilización.</li> </ul> ` })} ${renderComponent($$result3, "Movecard", $$Movecard, { "title": "Informaci\xF3n", "data-astro-cid-fitobr56": true }, { "default": ($$result4) => renderTemplate` <ul style=" color: white;text-align:start;" data-astro-cid-fitobr56> <li data-astro-cid-fitobr56>Temas relacionados con la igualdad o discriminación de género.</li> <li data-astro-cid-fitobr56>Recursos sociales y Servicios especializados, y en su caso derivación.</li> <li data-astro-cid-fitobr56>Asociaciones de mujeres.</li> <li data-astro-cid-fitobr56>Actividades culturales</li> <li data-astro-cid-fitobr56>Subvenciones para asociaciones, emprendedoras, etc.</li> </ul> ` })} ${renderComponent($$result3, "Movecard", $$Movecard, { "title": "Asesor\xEDa Jur\xEDdica", "data-astro-cid-fitobr56": true }, { "default": ($$result4) => renderTemplate` <ul style=" color: white;text-align:start;" data-astro-cid-fitobr56> <li data-astro-cid-fitobr56>Ruptura Matrimonial</li> <li data-astro-cid-fitobr56>Guarda y custodia de l@s hij@s</li> <li data-astro-cid-fitobr56>Pensiones alimenticias</li> <li data-astro-cid-fitobr56>Bienes</li> <li data-astro-cid-fitobr56>Malos tratos</li> <li data-astro-cid-fitobr56>Abusos sexuales</li> <li data-astro-cid-fitobr56>Trámites de justicia gratuita</li> <li data-astro-cid-fitobr56>Solicitud de medidas de protección</li> </ul> ` })} ` })} ${renderComponent($$result2, "NormalSection", $$Flgridsection, { "className": "section-flex-column", "data-astro-cid-fitobr56": true }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "Simpledescription", $$Simpledescription, { "title": "Ayuntamiento de Huesa", "data-astro-cid-fitobr56": true }, { "default": ($$result4) => renderTemplate` <ul id="social-services" data-astro-cid-fitobr56> <li data-astro-cid-fitobr56>Dirección: Plaza de la Constitución,11</li> <li data-astro-cid-fitobr56>Teléfono: 953 715 009 - Fax: 953715 672</li> <li data-astro-cid-fitobr56>Email: ayuntamiento@huesa.es</li> <li data-astro-cid-fitobr56>Abierto de 8:00h a 15:00h</li> </ul> ` })} ${renderComponent($$result3, "Simpledescription", $$Simpledescription, { "title": "Centro de Servicios Sociales", "data-astro-cid-fitobr56": true }, { "default": ($$result4) => renderTemplate` <ul data-astro-cid-fitobr56> <li data-astro-cid-fitobr56>Dirección: Plaza de la Constitución,11</li> <li data-astro-cid-fitobr56>Teléfono: 953 715 009 - Fax: 953715 672</li> <li data-astro-cid-fitobr56>Email: ayuntamiento@huesa.es</li> <li data-astro-cid-fitobr56>Horario de atención: Martes, de 10,30 a 11,30</li> </ul> ` })} ` })} ` })} `;
}, "C:/Users/matem/Desktop/Huesa/src/pages/ayuntamiento.astro", void 0);

const $$file = "C:/Users/matem/Desktop/Huesa/src/pages/ayuntamiento.astro";
const $$url = "/ayuntamiento";

const ayuntamiento = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Ayuntamiento,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { $$Flgridsection as $, Cardvue as C, $$Simpledescription as a, $$Styledsection as b, assetsDir as c, ayuntamiento as d, getConfiguredImageService as g, imageConfig as i, outDir as o };