import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

/**
 * Service untuk mengirim email notifications
 * Menggunakan nodemailer dengan konfigurasi dari environment variables
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter dengan konfigurasi dari env
   */
  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      secure: this.configService.get<boolean>('email.secure'),
      auth: {
        user: this.configService.get<string>('email.auth.user'),
        pass: this.configService.get<string>('email.auth.pass'),
      },
    };

    // Jika tidak ada konfigurasi email, skip dan log warning
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      this.logger.warn('⚠️ Email configuration tidak lengkap. Email notifications akan di-skip.');
      return;
    }

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`❌ Email transporter verification failed: ${error.message}`);
      } else {
        this.logger.log('✅ Email service siap mengirim email');
      }
    });
  }

  /**
   * Kirim email pesanan dikirim (status: terkirim)
   */
  async kirimEmailPesananDikirim(data: {
    emailPenerima: string;
    namaPenerima: string;
    nomorPesanan: string;
    judulBuku: string;
    nomorResi: string;
    kurir: string;
    estimasiSampai: string;
  }) {
    try {
      if (!this.transporter) {
        this.logger.warn('⚠️ Email transporter tidak tersedia. Skip sending email.');
        return { sukses: false, pesan: 'Email service tidak tersedia' };
      }

      const emailFrom = this.configService.get<string>('email.from');

      const htmlContent = this.getTemplatePesananDikirim(data);

      const info = await this.transporter.sendMail({
        from: emailFrom,
        to: data.emailPenerima,
        subject: `📦 Pesanan #${data.nomorPesanan} Telah Dikirim`,
        html: htmlContent,
      });

      this.logger.log(`✅ Email pesanan dikirim terkirim ke: ${data.emailPenerima}`);

      return {
        sukses: true,
        pesan: 'Email berhasil dikirim',
        data: { messageId: info.messageId },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Gagal mengirim email: ${errorMessage}`);
      return {
        sukses: false,
        pesan: `Gagal mengirim email: ${errorMessage}`,
      };
    }
  }

  /**
   * Kirim email pesanan selesai (status: selesai)
   */
  async kirimEmailPesananSelesai(data: {
    emailPenerima: string;
    namaPenerima: string;
    nomorPesanan: string;
    judulBuku: string;
    tanggalSelesai: string;
  }) {
    try {
      if (!this.transporter) {
        this.logger.warn('⚠️ Email transporter tidak tersedia. Skip sending email.');
        return { sukses: false, pesan: 'Email service tidak tersedia' };
      }

      const emailFrom = this.configService.get<string>('email.from');

      const htmlContent = this.getTemplatePesananSelesai(data);

      const info = await this.transporter.sendMail({
        from: emailFrom,
        to: data.emailPenerima,
        subject: `✅ Pesanan #${data.nomorPesanan} Telah Selesai`,
        html: htmlContent,
      });

      this.logger.log(`✅ Email pesanan selesai terkirim ke: ${data.emailPenerima}`);

      return {
        sukses: true,
        pesan: 'Email berhasil dikirim',
        data: { messageId: info.messageId },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`❌ Gagal mengirim email: ${errorMessage}`);
      return {
        sukses: false,
        pesan: `Gagal mengirim email: ${errorMessage}`,
      };
    }
  }

  /**
   * Template HTML untuk email pesanan dikirim
   */
  private getTemplatePesananDikirim(data: {
    namaPenerima: string;
    nomorPesanan: string;
    judulBuku: string;
    nomorResi: string;
    kurir: string;
    estimasiSampai: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pesanan Dikirim</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          .info-box {
            background-color: #f0fdfa;
            border-left: 4px solid #0d9488;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-row {
            display: flex;
            margin: 10px 0;
          }
          .info-label {
            font-weight: bold;
            width: 140px;
            color: #0d9488;
          }
          .info-value {
            flex: 1;
            color: #333;
          }
          .tracking-button {
            display: inline-block;
            background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .emoji {
            font-size: 48px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">📦</div>
            <h1>Pesanan Anda Telah Dikirim!</h1>
          </div>
          
          <div class="content">
            <p>Halo <strong>${data.namaPenerima}</strong>,</p>
            
            <p>Kabar baik! Pesanan Anda telah dikirim oleh percetakan dan sedang dalam perjalanan menuju alamat Anda.</p>
            
            <div class="info-box">
              <div class="info-row">
                <div class="info-label">Nomor Pesanan:</div>
                <div class="info-value"><strong>${data.nomorPesanan}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Buku:</div>
                <div class="info-value">${data.judulBuku}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Nomor Resi:</div>
                <div class="info-value"><strong>${data.nomorResi}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Kurir:</div>
                <div class="info-value">${data.kurir}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Estimasi Tiba:</div>
                <div class="info-value">${data.estimasiSampai}</div>
              </div>
            </div>
            
            <p><strong>Apa yang perlu Anda lakukan?</strong></p>
            <ol>
              <li>Pantau status pengiriman melalui nomor resi di atas</li>
              <li>Pastikan ada orang di alamat tujuan saat paket tiba</li>
              <li>Setelah menerima paket, silakan konfirmasi penerimaan di dashboard Anda</li>
            </ol>
            
            <center>
              <a href="${this.configService.get<string>('FRONTEND_URL')}/penulis/pesanan-cetak" class="tracking-button">
                Lihat Detail Pesanan
              </a>
            </center>
            
            <p>Jika ada pertanyaan atau kendala, jangan ragu untuk menghubungi kami.</p>
            
            <p>Terima kasih telah menggunakan Publishify!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Publishify. Semua hak dilindungi.</p>
            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML untuk email pesanan selesai
   */
  private getTemplatePesananSelesai(data: {
    namaPenerima: string;
    nomorPesanan: string;
    judulBuku: string;
    tanggalSelesai: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pesanan Selesai</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px 20px;
          }
          .success-box {
            background-color: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .info-row {
            display: flex;
            margin: 10px 0;
          }
          .info-label {
            font-weight: bold;
            width: 140px;
            color: #10b981;
          }
          .info-value {
            flex: 1;
            color: #333;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .emoji {
            font-size: 48px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="emoji">🎉</div>
            <h1>Pesanan Selesai!</h1>
          </div>
          
          <div class="content">
            <p>Halo <strong>${data.namaPenerima}</strong>,</p>
            
            <p>Terima kasih atas konfirmasi penerimaan Anda! Pesanan Anda telah diselesaikan dengan sukses.</p>
            
            <div class="success-box">
              <div class="info-row">
                <div class="info-label">Nomor Pesanan:</div>
                <div class="info-value"><strong>${data.nomorPesanan}</strong></div>
              </div>
              <div class="info-row">
                <div class="info-label">Buku:</div>
                <div class="info-value">${data.judulBuku}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Tanggal Selesai:</div>
                <div class="info-value">${data.tanggalSelesai}</div>
              </div>
            </div>
            
            <p><strong>Langkah Selanjutnya:</strong></p>
            <ul>
              <li>Anda dapat melihat riwayat pesanan lengkap di dashboard</li>
              <li>Beri rating dan review untuk membantu penulis lain</li>
              <li>Jelajahi buku-buku lainnya untuk dicetak</li>
            </ul>
            
            <center>
              <a href="${this.configService.get<string>('FRONTEND_URL')}/penulis/pesanan-cetak" class="cta-button">
                Lihat Riwayat Pesanan
              </a>
            </center>
            
            <p>Kami senang dapat melayani Anda. Terima kasih telah mempercayai Publishify untuk kebutuhan cetak buku Anda!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Publishify. Semua hak dilindungi.</p>
            <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
