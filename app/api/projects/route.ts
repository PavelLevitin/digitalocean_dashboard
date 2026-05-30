import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'projects.json')

function read() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'))
}

function write(data: unknown) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET() {
  return NextResponse.json(read())
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, url } = await req.json()
  if (!name || !url) return NextResponse.json({ error: 'name and url required' }, { status: 400 })

  const projects = read()
  const newProject = {
    id: projects.length ? Math.max(...projects.map((p: { id: number }) => p.id)) + 1 : 1,
    name,
    url,
    enabled: true,
  }
  projects.push(newProject)
  write(projects)
  return NextResponse.json(newProject, { status: 201 })
}
