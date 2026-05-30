'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Project {
  id: number
  name: string
  url: string
  enabled: boolean
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  function showMsg(text: string, ok: boolean) {
    setMsg({ text, ok })
    setTimeout(() => setMsg(null), 4000)
  }

  async function loadProjects() {
    const res = await fetch('/api/projects')
    setProjects(await res.json())
  }

  function unlock() {
    if (!password) return
    setAuthed(true)
    loadProjects()
  }

  async function toggle(id: number, enabled: boolean) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
      body: JSON.stringify({ enabled }),
    })
    if (res.status === 401) { showMsg('Wrong password.', false); return }
    loadProjects()
  }

  async function addProject() {
    if (!newName || !newUrl) { showMsg('Name and URL are required.', false); return }
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Password': password },
      body: JSON.stringify({ name: newName, url: newUrl }),
    })
    if (res.status === 401) { showMsg('Wrong password.', false); return }
    if (!res.ok) { showMsg('Server error.', false); return }
    const data = await res.json()
    showMsg(`"${data.name}" added.`, true)
    setNewName('')
    setNewUrl('')
    loadProjects()
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-8 text-center">Admin</h1>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm flex flex-col gap-4">
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && unlock()}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-white/30 transition-colors"
            />
            <button
              onClick={unlock}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm font-medium transition-all"
            >
              Unlock
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-20">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-2xl font-bold text-white">Admin</h1>
          <Link href="/" className="text-white/30 text-sm hover:text-white/60 transition-colors">
            ← dashboard
          </Link>
        </div>

        {/* Projects list */}
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Projects</h2>
          {projects.length === 0 ? (
            <p className="text-white/20 text-sm">No projects yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map(p => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${p.enabled ? 'bg-emerald-400' : 'bg-white/20'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{p.name}</p>
                    <p className="text-white/30 text-xs truncate">{p.url}</p>
                  </div>
                  <button
                    onClick={() => toggle(p.id, !p.enabled)}
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      p.enabled
                        ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                        : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    {p.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add project */}
        <section>
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Add project</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm flex flex-col gap-3">
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-white/30 transition-colors"
            />
            <input
              type="url"
              placeholder="https://pavellevitin.co.il:4009"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addProject()}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-white/30 transition-colors"
            />
            <button
              onClick={addProject}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-white text-sm font-medium transition-all"
            >
              Add project
            </button>
          </div>
          {msg && (
            <p className={`mt-3 text-sm ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {msg.text}
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
