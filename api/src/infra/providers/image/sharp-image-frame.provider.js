import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ImageFrameProvider } from '../../../shared/contracts/image-frame-provider.js';
import { resolveFrameOption } from '../../../config/event-config.js';

function buildWindowBackground(frame) {
  return sharp({
    create: {
      width: frame.window.width,
      height: frame.window.height,
      channels: 4,
      background: frame.window.background || '#1f1f1f'
    }
  })
    .png()
    .toBuffer();
}

export class SharpImageFrameProvider extends ImageFrameProvider {
  constructor({ activeEventConfig }) {
    super();
    this.activeEventConfig = activeEventConfig;

    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFile);
    this.assetsRoot = path.resolve(currentDir, '../../../assets');
  }

  resolveFrame(frameName) {
    return resolveFrameOption(this.activeEventConfig, frameName);
  }

  async loadAssetBuffer(frame) {
    return fs.readFile(path.resolve(this.assetsRoot, frame.assetFile));
  }

  async process({ buffer, frameName }) {
    const frame = this.resolveFrame(frameName);
    const image = sharp(buffer).rotate();
    const overlayBuffer = await sharp(await this.loadAssetBuffer(frame))
      .resize({
        width: frame.outputWidth,
        height: frame.outputHeight,
        fit: 'fill'
      })
      .png()
      .toBuffer();
    const windowBackground = await buildWindowBackground(frame);

    const resizedPhoto = await image
      .resize({
        width: frame.window.width,
        height: frame.window.height,
        fit: 'contain',
        background: frame.window.background || '#1f1f1f'
      })
      .png()
      .toBuffer();

    const resizedMetadata = await sharp(resizedPhoto).metadata();
    const photoWidth = resizedMetadata.width || frame.window.width;
    const photoHeight = resizedMetadata.height || frame.window.height;
    const left = frame.window.x + Math.round((frame.window.width - photoWidth) / 2);
    const top = frame.window.y + Math.round((frame.window.height - photoHeight) / 2);

    return sharp({
      create: {
        width: frame.outputWidth,
        height: frame.outputHeight,
        channels: 4,
        background: frame.background || '#ffffff'
      }
    })
      .composite([
        {
          input: windowBackground,
          left: frame.window.x,
          top: frame.window.y
        },
        {
          input: resizedPhoto,
          left,
          top
        },
        {
          input: overlayBuffer,
          left: 0,
          top: 0
        }
      ])
      .png()
      .toBuffer();
  }
}
