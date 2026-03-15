import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch single gallery item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const item = await db.galleryItem.findUnique({
      where: { id }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Fetch gallery item error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery item' },
      { status: 500 }
    )
  }
}

// PUT - Update gallery item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, category, order, isActive } = body

    const item = await db.galleryItem.update({
      where: { id },
      data: {
        title,
        description,
        category,
        order,
        isActive
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Update gallery item error:', error)
    return NextResponse.json(
      { error: 'Failed to update gallery item' },
      { status: 500 }
    )
  }
}

// DELETE - Delete gallery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.galleryItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete gallery item error:', error)
    return NextResponse.json(
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    )
  }
}
