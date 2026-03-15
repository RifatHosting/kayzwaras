import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch site settings
export async function GET() {
  try {
    let settings = await db.siteSettings.findFirst()

    if (!settings) {
      // Create default settings if not exist
      settings = await db.siteSettings.create({
        data: {
          siteName: 'Kayz Gallery',
          description: 'A beautiful gallery website',
          primaryColor: '#e11d48'
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Fetch settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT - Update site settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { siteName, logoUrl, description, primaryColor } = body

    let settings = await db.siteSettings.findFirst()

    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          siteName,
          logoUrl,
          description,
          primaryColor
        }
      })
    } else {
      settings = await db.siteSettings.update({
        where: { id: settings.id },
        data: {
          siteName,
          logoUrl,
          description,
          primaryColor
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
