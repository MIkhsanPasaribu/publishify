/**
 * Interface untuk response sukses standar
 */
export interface ResponseSukses<T = any> {
  sukses: true;
  pesan: string;
  data: T;
  metadata?: MetadataResponse;
}

/**
 * Interface untuk response error standar
 */
export interface ResponseError {
  sukses: false;
  pesan: string;
  error: {
    kode: string;
    detail?: string;
    field?: string;
    timestamp: string;
  };
}

/**
 * Interface untuk metadata pagination
 */
export interface MetadataResponse {
  total?: number;
  halaman?: number;
  limit?: number;
  totalHalaman?: number;
}

/**
 * Interface untuk response pagination
 */
export interface ResponsePaginated<T> extends ResponseSukses<T> {
  metadata: Required<MetadataResponse>;
}
