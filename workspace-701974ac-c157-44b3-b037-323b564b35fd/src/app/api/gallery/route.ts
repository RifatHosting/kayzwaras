import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all gallery items or by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = {
      isActive: true,
      ...(category && { category })
    }

    const items = await db.galleryItem.findMany({
      where,
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Fetch gallery error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    )
  }
}

// POST - Create new gallery item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, mediaUrl, mediaType, thumbnail, category, order } = body

    // Get max order for the category
    const maxOrderItem = await db.galleryItem.findFirst({
      where: { category },
      orderBy: { order: 'desc' }
    })

    const itemOrder = order ?? (maxOrderItem ? maxOrderItem.order + 1 : 0)

    const item = await db.galleryItem.create({
      data: {
        title,
        description,
        mediaUrl,
        mediaType,
        thumbnail,
        category,
        order: itemOrder
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Create gallery item error:', error)
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    )
  }
}
