import QRCode from 'qrcode';
import { QrCodeProvider } from '../../../shared/contracts/qrcode-provider.js';

export class NodeQrCodeProvider extends QrCodeProvider {
  constructor({ storageProvider }) {
    super();
    this.storageProvider = storageProvider;
  }

  async generate({ value, fileName }) {
    const buffer = await QRCode.toBuffer(value, {
      type: 'png',
      margin: 1,
      width: 320
    });

    return this.storageProvider.save({
      buffer,
      folder: 'qrcodes',
      fileName,
      contentType: 'image/png'
    });
  }
}
