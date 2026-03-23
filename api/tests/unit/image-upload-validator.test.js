import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getExtensionForMime,
  validateImageUpload
} from '../../src/shared/utils/image-upload-validator.js';

const VALID_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlH0i8AAAAASUVORK5CYII=',
  'base64'
);

test('validateImageUpload accepts a real PNG buffer and returns detected metadata', async () => {
  const result = await validateImageUpload({
    buffer: VALID_PNG_BUFFER,
    declaredMime: 'image/png',
    maxUploadSizeMb: 5
  });

  assert.equal(result.detectedMime, 'image/png');
  assert.equal(result.width, 1);
  assert.equal(result.height, 1);
  assert.equal(getExtensionForMime(result.detectedMime), '.png');
});

test('validateImageUpload rejects buffers that are not real images', async () => {
  await assert.rejects(
    () =>
      validateImageUpload({
        buffer: Buffer.from('not-an-image'),
        declaredMime: 'image/png',
        maxUploadSizeMb: 5
      }),
    (error) => error?.code === 'INVALID_IMAGE_UPLOAD'
  );
});

test('validateImageUpload rejects MIME mismatch between declared type and actual file', async () => {
  await assert.rejects(
    () =>
      validateImageUpload({
        buffer: VALID_PNG_BUFFER,
        declaredMime: 'image/jpeg',
        maxUploadSizeMb: 5
      }),
    (error) => error?.code === 'IMAGE_MIME_MISMATCH'
  );
});
