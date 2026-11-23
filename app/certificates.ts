export interface Certificate {
  title: string
  issuer: string
  issued: string
  credentialUrl?: string
}

// Add earned certificates here. The link can point to a public verification page
// or a copy of your certificate in public/assets/certificates.
export const certificates: Certificate[] = []
