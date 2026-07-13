import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/session'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('dashboard_session')?.value
  const valid = await verifySessionToken(token, process.env.SESSION_SECRET)
  return new NextResponse(null, { status: valid ? 200 : 401 })
}
