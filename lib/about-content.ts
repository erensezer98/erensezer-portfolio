import { supabase } from '@/lib/supabase'

export const DEFAULT_ABOUT_BIO: string[] = [
  'Born in Istanbul in 1998, Eren Sezer is an architect, researcher, and technologist who uses the built environment as a framework to explore the future of design. He operates at the intersection of "intuitive technocracy" and traditional craftsmanship, constantly searching to detect and rationalize the inherent "quality without a name" of spaces, as defined by architectural theorist Christopher Alexander.',
  'Holding a Master\u2019s degree in Building Architecture from Politecnico di Milano, Eren has an obsession for the integration of advanced technologies into the architect\u2019s design process. After his studies, he collaborated with MIT Senseable City Lab Director Carlo Ratti, to witness the limits of architectural tech. This work transitioned into his current role as a Project Manager at the startup Maestro Technologies in Carlo Ratti Group, where he helps lead a team committed to pioneering entirely new ways to design and build.',
  'Eren\u2019s work has been recognized in:',
  'Global Climate Action: In 2025, he was selected as a representative architect for the Italian Ministry of External Affairs at the UN Climate Change Summit (COP30), as a part of Carlo Ratti Group\u2019s project Aquapraca.',
  'International Exhibitions: As the co-founder of the architectural collective Cumba (est. 2023), Eren and the team secured spots at the STRAND International Architecture Exhibition and the 2025 Venice Architectural Biennale with their acclaimed project, Istanbul A Way Out.',
]

const ABOUT_BIO_SLUG = 'about-bio'

interface AboutBioRecord {
  paragraphs: string[]
}

export async function getAboutBio(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('page_content')
      .select('blocks')
      .eq('page_slug', ABOUT_BIO_SLUG)
      .single()

    if (error || !data?.blocks) return DEFAULT_ABOUT_BIO

    const record = data.blocks as AboutBioRecord
    if (Array.isArray(record?.paragraphs) && record.paragraphs.length > 0) {
      return record.paragraphs
    }
    return DEFAULT_ABOUT_BIO
  } catch {
    return DEFAULT_ABOUT_BIO
  }
}

export { ABOUT_BIO_SLUG }
