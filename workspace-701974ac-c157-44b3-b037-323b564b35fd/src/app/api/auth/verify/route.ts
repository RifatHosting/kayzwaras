import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    const session = await db.adminSession.findUnique({
      where: { token }
    })

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await db.adminSession.delete({ where: { token } })
      }
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ authenticated: true })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ authenticated: false })
  }
}
