const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())

const { createClient } = require('@supabase/supabase-js')

// Use service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is missing in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function insertProject() {
  console.log('Inserting "Istanbul A Way Out" project...')
  const { data, error } = await supabase.from('projects').upsert([
    {
      title: 'Istanbul A Way Out',
      slug: 'istanbul-a-way-out',
      category: 'academic',
      short_description: 'An urban design and architectural intervention addressing resilience and connectivity in Istanbul.',
      description: 'Istanbul A Way Out is an extensive research and design project that explores new spatial possibilities for urban connectivity and resilience in the context of Istanbul. Investigating the city\'s complex topography and infrastructure, the project proposes a series of architectural interventions that reconnect fragmented urban areas and provide common spaces for the community.',
      year: 2024,
      location: 'Istanbul, Turkey',
      tags: ['Urban Design', 'Architecture', 'Resilience', 'Connectivity'],
      cover_image: 'https://istanbulawayout.com/wp-content/uploads/2022/10/iawo_cover.jpg', // Placeholder extracted from previous site logic or common patterns
      images: [],
      featured: true,
      order_index: 0
    }
  ], { onConflict: 'slug' }).select()

  if (error) {
    console.error('Error inserting:', error.message)
  } else {
    console.log('Successfully inserted/updated project:', data[0].title)
  }
}

insertProject()
