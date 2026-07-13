import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()
  const validUser = process.env.DASHBOARD_USER
  const validPass = process.env.DASHBOARD_PASSWORD
  const secret = process.env.SESSION_SECRET

  if (!validUser || !validPass || !secret) {
    return NextResponse.json({ error: 'Auth not configured on server' }, { status: 500 })
  }

  if (username !== validUser || password !== validPass) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await createSessionToken(username, secret)
  const res = NextResponse.json({ ok: true })
  res.cookies.set('dashboard_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
