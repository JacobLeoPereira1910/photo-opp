import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { StorageProvider } from '../../../shared/contracts/storage-provider.js';
import { buildPublicUrl } from '../../../shared/utils/build-public-url.js';
import { NotFoundError } from '../../../errors/app-error.js';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export class LocalStorageProvider extends StorageProvider {
  constructor({ env }) {
    super();
    this.env = env;

    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFile);
    this.storageRoot = path.resolve(currentDir, '../../../../storage');
  }

  buildRelativePath(folder, fileName) {
    const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
    return path.join(normalizedFolder, sanitizeFileName(fileName));
  }

  getAbsolutePath(relativePath) {
    return path.resolve(this.storageRoot, relativePath);
  }

  async ensureDirectory(relativePath) {
    const absolutePath = this.getAbsolutePath(relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    return absolutePath;
  }

  async save({ buffer, folder, fileName, contentType }) {
    const generatedName = fileName || `${randomUUID()}.bin`;
    const relativePath = this.buildRelativePath(folder, generatedName);
    const absolutePath = await this.ensureDirectory(relativePath);

    await writeFile(absolutePath, buffer);

    const publicPath = `${this.env.STORAGE_PUBLIC_BASE_PATH}/${relativePath}`
      .replace(/\\/g, '/')
      .replace(/\/{2,}/g, '/');

    return {
      relativePath,
      absolutePath,
      url: buildPublicUrl(this.env.APP_BASE_URL, publicPath),
      contentType,
      size: buffer.length
    };
  }

  async read(relativePath) {
    const absolutePath = this.getAbsolutePath(relativePath);

    try {
      return await readFile(absolutePath);
    } catch (error) {
      throw new NotFoundError('Stored file not found', {
        code: 'STORAGE_FILE_NOT_FOUND',
        cause: error
      });
    }
  }

  createReadStream(relativePath) {
    const absolutePath = this.getAbsolutePath(relativePath);

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundError('Stored file not found', {
        code: 'STORAGE_FILE_NOT_FOUND'
      });
    }

    return fs.createReadStream(absolutePath);
  }

  async exists(relativePath) {
    try {
      await access(this.getAbsolutePath(relativePath), fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}
