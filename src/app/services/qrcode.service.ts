// src/app/services/qrcode.service.ts
import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';  // Cambiar aquí para usar 'import * as'

@Injectable({
  providedIn: 'root',
})
export class QRCodeService {
  async generateQRCode(data: string): Promise<string> {
    try {
      const qrCodeUrl = await QRCode.toDataURL(data);
      return qrCodeUrl;
    } catch (error) {
      console.error('Error al generar el código QR:', error);
      throw error;
    }
  }
}
