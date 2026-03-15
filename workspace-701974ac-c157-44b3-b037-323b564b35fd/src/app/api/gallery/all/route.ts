import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch ALL gallery items (including inactive) for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = category ? { category } : {}

    const items = await db.galleryItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }]
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Fetch all gallery error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    )
  }
}
