import test from 'node:test';
import assert from 'node:assert/strict';
import { asValue } from 'awilix';
import { buildTestApp } from '../helpers/build-test-app.js';

const VALID_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlH0i8AAAAASUVORK5CYII=',
  'base64'
);

function createAccessToken(app, payload) {
  return app.jwt.sign(payload);
}

function buildMultipartPayload({ fields = {}, file }) {
  const boundary = '----photo-opp-test-boundary';
  const chunks = [];

  for (const [key, value] of Object.entries(fields)) {
    chunks.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
      )
    );
  }

  chunks.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.filename}"\r\nContent-Type: ${file.contentType}\r\n\r\n`
    )
  );
  chunks.push(file.buffer);
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  return {
    boundary,
    payload: Buffer.concat(chunks)
  };
}

test('POST /api/v1/activation/photos accepts multipart upload and forwards parsed payload', async () => {
  let receivedInput = null;

  const app = await buildTestApp({
    photosService: asValue({
      async createPhoto(input) {
        receivedInput = input;

        return {
          photo: {
            id: 'photo-1',
            frameName: input.frameName,
            metadata: input.metadata
          }
        };
      },
      async getActivationConfig() {
        return { event: { key: 'nexlab-default' } };
      },
      async getPhotoById() {
        return { photo: { id: 'photo-1' } };
      },
      async getPhotoQrCode() {
        return {
          photoId: 'photo-1',
          qrCodeUrl: '/storage/qrcodes/photo-1.png',
          qrCodeValue: 'value',
          downloadUrl: '/api/v1/activation/photos/photo-1/download'
        };
      },
      async resolveDownload() {
        throw new Error('resolveDownload not stubbed');
      },
      async reactToPhoto() {
        return { photo: { id: 'photo-1', reaction: 'liked' } };
      },
      async getStats() {
        return { todayPhotos: 1 };
      },
      async getHistory() {
        return { photos: [] };
      }
    })
  });

  try {
    const token = createAccessToken(app, {
      sub: 'promoter-1',
      name: 'Promoter User',
      email: 'promoter@nexlab.com',
      role: 'promoter'
    });

    const fileBuffer = VALID_PNG_BUFFER;
    const { boundary, payload } = buildMultipartPayload({
      fields: {
        frameName: 'NEXLAB FIGMA',
        metadata: JSON.stringify({
          source: 'e2e-test'
        })
      },
      file: {
        filename: 'capture.png',
        contentType: 'image/png',
        buffer: fileBuffer
      }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/activation/photos',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': `multipart/form-data; boundary=${boundary}`
      },
      payload
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.json().photo.frameName, 'NEXLAB FIGMA');
    assert.ok(receivedInput);
    assert.equal(receivedInput.promoterId, 'promoter-1');
    assert.equal(receivedInput.frameName, 'NEXLAB FIGMA');
    assert.deepEqual(receivedInput.metadata, { source: 'e2e-test' });
    assert.equal(receivedInput.file.filename, 'capture.png');
    assert.equal(receivedInput.file.mimetype, 'image/png');
    assert.equal(receivedInput.file.size, fileBuffer.length);
    assert.equal(receivedInput.file.buffer.toString(), fileBuffer.toString());
  } finally {
    await app.close();
  }
});
