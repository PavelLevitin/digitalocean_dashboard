import fs from 'fs'
import path from 'path'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Project {
  id: number
  name: string
  url: string
  enabled: boolean
}

function getProjects(): Project[] {
  const file = path.join(process.cwd(), 'projects.json')
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export default function DashboardPage() {
  const projects = getProjects().filter(p => p.enabled)

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-20">
      <div className="w-full max-w-4xl">

        <div className="mb-16 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            pavellevitin.co.il
          </h1>
          <p className="text-white/40 text-sm">Projects</p>
        </div>

        {projects.length === 0 ? (
          <p className="text-center text-white/30 text-sm">No projects configured.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
              >
                <div className="flex items-start justify-between">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <svg
                    className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-lg leading-tight mb-1">
                    {project.name}
                  </p>
                  <p className="text-white/30 text-xs break-all leading-relaxed">
                    {project.url}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="mt-20 flex justify-center">
          <Link href="/admin" className="text-white/15 text-xs hover:text-white/40 transition-colors">
            admin
          </Link>
        </div>
      </div>
    </main>
  )
}
