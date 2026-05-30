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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const pwd = req.headers.get('x-admin-password')
  if (pwd !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = parseInt(params.id, 10)
  const projects = read()
  const project = projects.find((p: { id: number }) => p.id === id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  if (typeof body.enabled === 'boolean') project.enabled = body.enabled
  if (body.name) project.name = body.name
  if (body.url) project.url = body.url

  write(projects)
  return NextResponse.json(project)
}
