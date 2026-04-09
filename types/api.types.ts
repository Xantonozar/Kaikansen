export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: number
  meta?: {
    page?: number
    total?: number
    hasMore?: boolean
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: {
    _id: string
    username: string
    email: string
  }
}
