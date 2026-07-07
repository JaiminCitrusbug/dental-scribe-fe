export interface Patient {
  id: string
  first_name: string
  last_name: string
  full_name: string
  date_of_birth: string | null
  email: string | null
  phone: string | null
  medical_notes: string | null
  created_at: string
}

export interface PatientInput {
  first_name: string
  last_name: string
  date_of_birth?: string | null
  email?: string | null
  phone?: string | null
  medical_notes?: string | null
}
