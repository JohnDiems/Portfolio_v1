export interface Certificate {
  title: string
  issuer: string
  issued: string
  description?: string
  credentialUrl?: string
  image?: { src: string; width: number; height: number; alt: string }
}

export const certificates: Certificate[] = [
  {
    title: 'Artificial Intelligence (AI) for LGUs Workshop',
    issuer: 'City Government of Davao · Committee on Information Technology',
    issued: 'October 21, 2026',
    description: 'Certificate of Appearance for attending the AI for LGUs workshop conducted by PLDT and SMART in Davao City.',
    credentialUrl: '/assets/certificates/ai-for-lgus-workshop.png',
    image: {
      src: '/assets/certificates/ai-for-lgus-workshop.png',
      width: 1280,
      height: 989,
      alt: 'Certificate of Appearance awarded to John Frel P. Diems for the AI for LGUs Workshop on October 21, 2026.',
    },
  },
  {
    title: 'PHP Playground: Peer-Guided Introduction to Web Development with PHP',
    issuer: 'Assumption College of Davao · BSIT Program',
    issued: 'October 23, 2023',
    description: 'Certificate of Appreciation for contributing as a mentor during peer mentoring sessions with BSIT students.',
    credentialUrl: '/assets/certificates/php-peer-mentoring.png',
    image: {
      src: '/assets/certificates/php-peer-mentoring.png',
      width: 1280,
      height: 772,
      alt: 'Certificate of Appreciation awarded to John Frel P. Diems for mentoring at PHP Playground on October 23, 2023.',
    },
  },
]
