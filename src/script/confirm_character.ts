import fs from "fs";
import path from "path";
import sharp from "sharp";
import GIFEncoder from "gifencoder";
import { createCanvas, loadImage } from "canvas";

const PUBLIC_FOLDER = "public";
const SIZE = { width: 64, height: 64 };
const directions = ["front", "back", "right", "left"];

export type FinalImages = {
  static: Record<string, string>;
  motion: Record<string, string>;
  gif: Record<string, string>;
};

async function resizeImage(inputPath: string, outputPath: string, size = SIZE): Promise<void> {
  try {
    await sharp(inputPath)
      .resize(size.width, size.height, { kernel: sharp.kernel.nearest })
      .toFile(outputPath);
    console.log(`Resized ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

/**
 * 背景透過処理
 * フラッドフィルアルゴリズムを用いて、画像境界から連続する白色領域のみを透明にする
 * ※これにより、画像内部で使われる白色は影響を受けません。
 */
async function applyTransparency(
  filePath: string,
  bgColor = { r: 255, g: 255, b: 255 },
  tolerance = 5
): Promise<void> {
  try {
    const image = await loadImage(filePath);
    const canvas = createCanvas(SIZE.width, SIZE.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, SIZE.width, SIZE.height);
    const imageData = ctx.getImageData(0, 0, SIZE.width, SIZE.height);
    const data = imageData.data;
    const width = SIZE.width;
    const height = SIZE.height;
    const visited = new Array(width * height).fill(false);

    function isSimilar(x: number, y: number): boolean {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      return (
        Math.abs(r - bgColor.r) <= tolerance &&
        Math.abs(g - bgColor.g) <= tolerance &&
        Math.abs(b - bgColor.b) <= tolerance
      );
    }

    const stack: { x: number; y: number }[] = [];
    for (let x = 0; x < width; x++) {
      if (!visited[x] && isSimilar(x, 0)) {
        visited[x] = true;
        stack.push({ x, y: 0 });
      }
      const bottomIndex = (height - 1) * width + x;
      if (!visited[bottomIndex] && isSimilar(x, height - 1)) {
        visited[bottomIndex] = true;
        stack.push({ x, y: height - 1 });
      }
    }
    for (let y = 0; y < height; y++) {
      const leftIndex = y * width;
      if (!visited[leftIndex] && isSimilar(0, y)) {
        visited[leftIndex] = true;
        stack.push({ x: 0, y });
      }
      const rightIndex = y * width + (width - 1);
      if (!visited[rightIndex] && isSimilar(width - 1, y)) {
        visited[rightIndex] = true;
        stack.push({ x: width - 1, y });
      }
    }

    const directionsFill = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];

    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      for (const { dx, dy } of directionsFill) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = ny * width + nx;
          if (!visited[idx] && isSimilar(nx, ny)) {
            visited[idx] = true;
            stack.push({ x: nx, y: ny });
          }
        }
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (visited[y * width + x]) {
          const index = (y * width + x) * 4;
          data[index + 3] = 0;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(filePath, buffer);
    console.log(`Applied transparency to ${filePath}`);
  } catch (error) {
    console.error(`Error applying transparency for ${filePath}:`, error);
  }
}

/**
 * GIF作成用のヘルパー関数
 * candidateColorを透過色として設定してGIFを生成する。
 * 完全な書き込み完了を待つため、書き込みストリームの"finish"イベントを利用する。
 */
async function generateGif(staticPath: string, motionPath: string, outputPath: string, duration = 500, candidateColor: number): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const width = SIZE.width;
      const height = SIZE.height;
      const staticImage = await loadImage(staticPath);
      const motionImage = await loadImage(motionPath);

      function computeAverageColor(image: any): { r: number; g: number; b: number } {
        const offCanvas = createCanvas(width, height);
        const offCtx = offCanvas.getContext("2d");
        offCtx.clearRect(0, 0, width, height);
        offCtx.drawImage(image, 0, 0, width, height);
        const imgData = offCtx.getImageData(0, 0, width, height).data;
        let totalR = 0, totalG = 0, totalB = 0, count = 0;
        for (let i = 0; i < imgData.length; i += 4) {
          const alpha = imgData[i + 3];
          if (alpha > 0) {
            totalR += imgData[i];
            totalG += imgData[i + 1];
            totalB += imgData[i + 2];
            count++;
          }
        }
        if (count === 0) count = 1;
        return { r: totalR / count, g: totalG / count, b: totalB / count };
      }

      const avgStatic = computeAverageColor(staticImage);
      const avgMotion = computeAverageColor(motionImage);
      const brightnessStatic = (avgStatic.r + avgStatic.g + avgStatic.b) / 3;
      const brightnessMotion = (avgMotion.r + avgMotion.g + avgMotion.b) / 3;
      const brightnessDiff = brightnessStatic - brightnessMotion;

      const finalMotionCanvas = createCanvas(width, height);
      const finalMotionCtx = finalMotionCanvas.getContext("2d");
      finalMotionCtx.drawImage(motionImage, 0, 0, width, height);
      if (Math.abs(brightnessDiff) > 10) {
        const imgData = finalMotionCtx.getImageData(0, 0, width, height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) {
            data[i] = Math.min(255, Math.max(0, data[i] + brightnessDiff));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightnessDiff));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightnessDiff));
          }
        }
        finalMotionCtx.putImageData(imgData, 0, 0);
      }

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      const candidateHex = "#" + candidateColor.toString(16).padStart(6, "0").toUpperCase();

      const encoder = new GIFEncoder(width, height);
      const gifStream = fs.createWriteStream(outputPath);
      encoder.createReadStream().pipe(gifStream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(duration);
      encoder.setQuality(10);
      encoder.setTransparent(candidateColor);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = candidateHex;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(staticImage, 0, 0, width, height);
      encoder.addFrame(ctx);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = candidateHex;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(finalMotionCanvas, 0, 0, width, height);
      encoder.addFrame(ctx);

      encoder.finish();
      gifStream.on("finish", () => {
        console.log(`Created GIF with candidate color ${candidateHex}: ${outputPath}`);
        resolve();
      });
      gifStream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * GIFの背景透過検証
 * candidateColor が実際に存在していない（＝背景が透明になっている）かを確認する
 */
async function verifyGifTransparency(gifPath: string, candidateColor: number): Promise<boolean> {
  try {
    const width = SIZE.width;
    const height = SIZE.height;
    const img = await loadImage(gifPath);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height).data;
    const rCandidate = (candidateColor >> 16) & 0xff;
    const gCandidate = (candidateColor >> 8) & 0xff;
    const bCandidate = candidateColor & 0xff;
    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];
      if (a !== 0 && r === rCandidate && g === gCandidate && b === bCandidate) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error(`Error verifying GIF transparency for ${gifPath}:`, error);
    return false;
  }
}

/**
 * 動的透過候補色を用いてGIFを生成する関数
 * 最初は FF00FF (0xFF00FF) で試し、背景検証に失敗した場合は他の候補色で再試行する
 */
async function createGifWithDynamicTransparency(staticPath: string, motionPath: string, outputPath: string, duration = 500): Promise<void> {
  const candidateColors = [0xFF00FF, 0x00FF00, 0x0000FF, 0xFFFF00];
  let success = false;
  for (const candidate of candidateColors) {
    await generateGif(staticPath, motionPath, outputPath, duration, candidate);
    const isTransparent = await verifyGifTransparency(outputPath, candidate);
    if (isTransparent) {
      console.log(`GIF created successfully with transparency candidate ${candidate.toString(16)}`);
      success = true;
      break;
    } else {
      console.log(`Candidate ${candidate.toString(16)} did not result in proper transparency. Retrying with next candidate...`);
    }
  }
  if (!success) {
    console.error("Failed to create GIF with proper transparency using all candidate colors.");
  }
}

export async function confirmCharacter(baseName: string): Promise<FinalImages> {
  const results: FinalImages = { static: {}, motion: {}, gif: {} };

  for (const d of directions) {
    const origStatic = path.join(PUBLIC_FOLDER, `${baseName}_${d}.png`);
    const resizedStatic = path.join(PUBLIC_FOLDER, `${baseName}_${d}_64.png`);
    if (fs.existsSync(origStatic)) {
      await resizeImage(origStatic, resizedStatic);
      await applyTransparency(resizedStatic);
      results.static[d] = `/${baseName}_${d}_64.png`;
    } else {
      console.log(`Static image not found for ${d}: ${origStatic}`);
    }

    const origMotion = path.join(PUBLIC_FOLDER, `${baseName}_${d}_walk.png`);
    const resizedMotion = path.join(PUBLIC_FOLDER, `${baseName}_${d}_walk_64.png`);
    if (fs.existsSync(origMotion)) {
      await resizeImage(origMotion, resizedMotion);
      await applyTransparency(resizedMotion);
      results.motion[d] = `/${baseName}_${d}_walk_64.png`;
    } else {
      console.log(`Motion image not found for ${d}: ${origMotion}`);
    }
  }

  for (const d of directions) {
    const staticImg = path.join(PUBLIC_FOLDER, `${baseName}_${d}_64.png`);
    const motionImg = path.join(PUBLIC_FOLDER, `${baseName}_${d}_walk_64.png`);
    const gifOutput = path.join(PUBLIC_FOLDER, `${baseName}_${d}_motion_64.gif`);
    if (fs.existsSync(staticImg) && fs.existsSync(motionImg)) {
      await createGifWithDynamicTransparency(staticImg, motionImg, gifOutput);
      results.gif[d] = `/${baseName}_${d}_motion_64.gif`;
    } else {
      console.log(`Skipping GIF for ${d}: missing processed images.`);
    }
  }

  return results;
}
