const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  console.log('Attempting to insert dummy project...')
  const { data, error } = await supabase.from('projects').insert([
    {
      title: 'Istanbul A Way Out',
      slug: 'istanbul-a-way-out',
      category: 'academic',
      short_description: 'Istanbul A Way Out - personal project.',
      description: 'Istanbul A Way Out explores new spatial possibilities for urban connectivity and resilience in the context of Istanbul.',
      year: 2024,
      location: 'Istanbul, Turkey',
      tags: ['Urban Design', 'Architecture', 'Urban Planning'],
      cover_image: null,
      images: [],
      featured: true,
      order_index: 0
    }
  ]).select()

  if (error) {
    console.error('Error inserting:', error.message)
  } else {
    console.log('Successfully inserted:', data)
  }
}

testInsert()
