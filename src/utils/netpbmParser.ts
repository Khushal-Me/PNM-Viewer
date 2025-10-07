export interface NetpbmImage {
  format: 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';
  width: number;
  height: number;
  maxValue?: number;
  data: number[];
}

export function parseNetpbm(content: string | ArrayBuffer): NetpbmImage {
  let lines: string[];
  let binaryData: Uint8Array | null = null;
  
  // Handle binary or text input
  if (content instanceof ArrayBuffer) {
    binaryData = new Uint8Array(content);
    const decoder = new TextDecoder('ascii');
    content = decoder.decode(binaryData);
  }
  
  // Split into lines and remove comments
  lines = content.split('\n').filter(line => !line.trim().startsWith('#'));
  
  const format = lines[0].trim() as NetpbmImage['format'];
  if (!['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].includes(format)) {
    throw new Error('Invalid Netpbm format');
  }
  
  // Get dimensions
  let dimensionLine = lines[1].trim();
  let currentLine = 2;
  
  // Handle comments between format and dimensions
  while (dimensionLine === '' && currentLine < lines.length) {
    dimensionLine = lines[currentLine].trim();
    currentLine++;
  }
  
  const [width, height] = dimensionLine.split(/\s+/).map(Number);
  
  if (isNaN(width) || isNaN(height)) {
    throw new Error('Invalid dimensions');
  }
  
  let maxValue = 1;
  let dataStartLine = currentLine;
  
  // Get max value for PGM and PPM
  if (['P2', 'P3', 'P5', 'P6'].includes(format)) {
    let maxValueLine = lines[currentLine].trim();
    while (maxValueLine === '' && currentLine < lines.length) {
      currentLine++;
      maxValueLine = lines[currentLine].trim();
    }
    maxValue = parseInt(maxValueLine);
    dataStartLine = currentLine + 1;
  }
  
  let data: number[] = [];
  
  // Parse based on format
  if (format === 'P1') {
    // ASCII PBM
    const pixels = lines.slice(dataStartLine).join(' ').trim().split(/\s+/).map(Number);
    data = pixels;
  } else if (format === 'P2') {
    // ASCII PGM
    const pixels = lines.slice(dataStartLine).join(' ').trim().split(/\s+/).map(Number);
    data = pixels;
  } else if (format === 'P3') {
    // ASCII PPM
    const pixels = lines.slice(dataStartLine).join(' ').trim().split(/\s+/).map(Number);
    data = pixels;
  } else if (format === 'P4' && binaryData) {
    // Binary PBM
    const headerEnd = content.indexOf('\n', content.indexOf(dimensionLine)) + 1;
    const binaryStart = new TextEncoder().encode(content.substring(0, headerEnd)).length;
    const pixels = binaryData.slice(binaryStart);
    
    data = [];
    for (let i = 0; i < pixels.length; i++) {
      for (let bit = 7; bit >= 0; bit--) {
        if (data.length < width * height) {
          data.push((pixels[i] >> bit) & 1);
        }
      }
    }
  } else if (format === 'P5' && binaryData) {
    // Binary PGM
    const headerText = content.substring(0, 200);
    const headerEnd = headerText.split('\n').slice(0, dataStartLine).join('\n').length + 1;
    const binaryStart = new TextEncoder().encode(content.substring(0, headerEnd)).length;
    data = Array.from(binaryData.slice(binaryStart));
  } else if (format === 'P6' && binaryData) {
    // Binary PPM
    const headerText = content.substring(0, 200);
    const headerEnd = headerText.split('\n').slice(0, dataStartLine).join('\n').length + 1;
    const binaryStart = new TextEncoder().encode(content.substring(0, headerEnd)).length;
    data = Array.from(binaryData.slice(binaryStart));
  }
  
  return {
    format,
    width,
    height,
    maxValue,
    data
  };
}

export function renderToCanvas(image: NetpbmImage, canvas: HTMLCanvasElement) {
  canvas.width = image.width;
  canvas.height = image.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const imageData = ctx.createImageData(image.width, image.height);
  const pixels = imageData.data;
  
  if (image.format === 'P1' || image.format === 'P4') {
    // PBM - Binary bitmap (1 bit per pixel)
    for (let i = 0; i < image.data.length; i++) {
      const value = image.data[i] === 0 ? 255 : 0; // 0 = white, 1 = black in PBM
      pixels[i * 4] = value;
      pixels[i * 4 + 1] = value;
      pixels[i * 4 + 2] = value;
      pixels[i * 4 + 3] = 255;
    }
  } else if (image.format === 'P2' || image.format === 'P5') {
    // PGM - Grayscale
    for (let i = 0; i < image.data.length; i++) {
      const value = Math.floor((image.data[i] / (image.maxValue || 255)) * 255);
      pixels[i * 4] = value;
      pixels[i * 4 + 1] = value;
      pixels[i * 4 + 2] = value;
      pixels[i * 4 + 3] = 255;
    }
  } else if (image.format === 'P3' || image.format === 'P6') {
    // PPM - RGB
    for (let i = 0; i < image.data.length; i += 3) {
      const pixelIndex = (i / 3) * 4;
      pixels[pixelIndex] = Math.floor((image.data[i] / (image.maxValue || 255)) * 255);
      pixels[pixelIndex + 1] = Math.floor((image.data[i + 1] / (image.maxValue || 255)) * 255);
      pixels[pixelIndex + 2] = Math.floor((image.data[i + 2] / (image.maxValue || 255)) * 255);
      pixels[pixelIndex + 3] = 255;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}
