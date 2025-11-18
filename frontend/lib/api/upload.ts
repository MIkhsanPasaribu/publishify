import api from "./client";

// ============================================
// TYPES
// ============================================

export interface UploadFileResponse {
  id: string;
  namaFileAsli: string;
  namaFileSimpan: string;
  ukuran: number;
  mimeType: string;
  ekstensi: string;
  tujuan: string;
  path: string;
  url: string;
  urlPublik?: string;
  diuploadPada: string;
}

export type TujuanUpload = "naskah" | "sampul" | "gambar" | "dokumen";

// ============================================
// API CLIENT
// ============================================

export const uploadApi = {
  /**
   * POST /upload/single - Upload single file
   * @param file - File object
   * @param tujuan - Tujuan upload (naskah, sampul, gambar, dokumen)
   * @param deskripsi - Deskripsi file (optional)
   * @param idReferensi - ID referensi ke entitas lain (optional)
   */
  async uploadFile(
    file: File,
    tujuan: TujuanUpload,
    deskripsi?: string,
    idReferensi?: string,
    onProgress?: (percent: number) => void
  ): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("tujuan", tujuan);
    if (deskripsi) formData.append("deskripsi", deskripsi);
    if (idReferensi) formData.append("idReferensi", idReferensi);

    const response = await api.post<{
      sukses: boolean;
      pesan: string;
      data: UploadFileResponse;
    }>(
      "/upload/single",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            onProgress(percent);
          }
        },
      }
    );
    
    // Extract data dari wrapper response
    return response.data.data;
  },

  /**
   * POST /upload/multiple - Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    tujuan: TujuanUpload,
    deskripsi?: string,
    onProgress?: (percent: number) => void
  ): Promise<UploadFileResponse[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("tujuan", tujuan);
    if (deskripsi) formData.append("deskripsi", deskripsi);

    const response = await api.post<{
      sukses: boolean;
      pesan: string;
      data: UploadFileResponse[];
    }>(
      "/upload/multiple",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            onProgress(percent);
          }
        },
      }
    );
    
    // Extract data dari wrapper response
    return response.data.data;
  },

  /**
   * DELETE /upload/:id - Hapus file
   */
  async hapusFile(id: string): Promise<void> {
    await api.delete(`/upload/${id}`);
  },
};
