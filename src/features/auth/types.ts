export interface Clinic {
  id: string
  clinic_name: string
  contact_name: string
  email: string
  is_verified: boolean
  created_at: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface RegisterPayload {
  clinic_name: string
  contact_name: string
  email: string
  password: string
}
