import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotifikasiService } from './notifikasi.service';

/**
 * WebSocket Gateway untuk notifikasi real-time
 * Menggunakan Socket.io untuk push notifications ke client
 *
 * Events:
 * - connection: Client connect
 * - disconnect: Client disconnect
 * - join_room: Join user-specific room
 * - notifikasi_baru: Emit notifikasi baru ke user
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifikasi',
})
export class NotifikasiGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly notifikasiService: NotifikasiService) {}

  /**
   * Handle ketika client connect
   */
  handleConnection(client: Socket) {
    console.log(`[WebSocket] Client connected: ${client.id}`);
  }

  /**
   * Handle ketika client disconnect
   */
  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Client disconnected: ${client.id}`);
  }

  /**
   * Client join room berdasarkan idPengguna
   * Setiap user punya room sendiri untuk menerima notifikasi
   */
  @SubscribeMessage('join_room')
  handleJoinRoom(@MessageBody() data: { idPengguna: string }, @ConnectedSocket() client: Socket) {
    const { idPengguna } = data;

    if (!idPengguna) {
      return { sukses: false, pesan: 'ID pengguna wajib diisi' };
    }

    // Join room dengan format: user_<idPengguna>
    const roomName = `user_${idPengguna}`;
    client.join(roomName);

    console.log(`[WebSocket] Client ${client.id} joined room: ${roomName}`);

    return {
      sukses: true,
      pesan: `Berhasil join room notifikasi`,
      data: { room: roomName },
    };
  }

  /**
   * Emit notifikasi ke user tertentu
   * Dipanggil oleh service setelah notifikasi disimpan ke database
   */
  async emitKeUser(idPengguna: string, notifikasi: any) {
    const roomName = `user_${idPengguna}`;

    this.server.to(roomName).emit('notifikasi_baru', {
      sukses: true,
      data: notifikasi,
    });

    console.log(`[WebSocket] Notifikasi dikirim ke room: ${roomName}`);
  }

  /**
   * Emit broadcast notifikasi ke semua client yang connected
   * Untuk announcement atau system notifications
   */
  async emitBroadcast(judul: string, pesan: string, tipe: string = 'info') {
    this.server.emit('notifikasi_broadcast', {
      sukses: true,
      data: {
        judul,
        pesan,
        tipe,
        dibuatPada: new Date(),
      },
    });

    console.log(`[WebSocket] Broadcast notification sent to all clients`);
  }

  /**
   * Emit update count notifikasi belum dibaca
   */
  async emitUpdateCount(idPengguna: string, count: number) {
    const roomName = `user_${idPengguna}`;

    this.server.to(roomName).emit('notifikasi_count', {
      sukses: true,
      data: {
        totalBelumDibaca: count,
      },
    });

    console.log(`[WebSocket] Update count sent to room: ${roomName}`);
  }
}
