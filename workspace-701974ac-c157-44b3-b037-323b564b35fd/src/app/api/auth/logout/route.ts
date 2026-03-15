import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (token) {
      await db.adminSession.deleteMany({
        where: { token }
      })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete('admin_token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: true })
  }
}
