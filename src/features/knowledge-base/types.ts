export interface KbDocumentSummary {
  id: string
  procedure: string | null
  title: string
  source_name: string | null
  source_url: string | null
  section_count: number
}

export interface KbSection {
  section: string | null
  content: string
}

export interface KbDocumentDetail {
  id: string
  procedure: string | null
  title: string
  source_name: string | null
  source_url: string | null
  sections: KbSection[]
}
