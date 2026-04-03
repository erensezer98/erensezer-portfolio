import { getProjects } from './lib/supabase'

async function main() {
  try {
    const projects = await getProjects()
    console.log(JSON.stringify(projects, null, 2))
  } catch (err) {
    console.error(err)
  }
}

main()
