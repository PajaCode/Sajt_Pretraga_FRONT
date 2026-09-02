// Mora se poklapati sa Saj_Pretraga_API/Models/Common/ApiResponse.cs
export interface ApiError {
  code: string;
  details: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  correlationId: string;
  timestampUtc: string;
  data: T | null;
  error: ApiError | null;
}
