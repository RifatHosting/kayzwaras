'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Image, Video, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface GalleryItem {
  id: string
  title: string | null
  description: string | null
  mediaUrl: string
  mediaType: string
  thumbnail: string | null
  category: string
  order: number
  isActive: boolean
}

interface SiteSettings {
  siteName: string
  logoUrl: string | null
  description: string | null
  primaryColor: string
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>('esefwe')
  const [items, setItems] = useState<GalleryItem[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const fetchGallery = useCallback(async (category: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/gallery?category=${category}`)
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error('Failed to fetch gallery:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }, [])

  useEffect(() => {
    fetchGallery(activeCategory)
  }, [activeCategory, fetchGallery])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Distribute items into columns for masonry layout
  const distributeItems = (items: GalleryItem[], columns: number) => {
    const cols: GalleryItem[][] = Array.from({ length: columns }, () => [])
    items.forEach((item, index) => {
      cols[index % columns].push(item)
    })
    return cols
  }

  const columns = typeof window !== 'undefined' && window.innerWidth < 640 ? 2 
    : typeof window !== 'undefined' && window.innerWidth < 1024 ? 3 
    : 4

  const distributedItems = distributeItems(items, columns)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt="Logo" 
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div 
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: settings?.primaryColor || '#e11d48' }}
                >
                  K
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {settings?.siteName || 'Kayz Gallery'}
              </h1>
            </div>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-white dark:bg-gray-800 shadow-sm">
            <TabsTrigger 
              value="esefwe" 
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white"
            >
              Esefwe
            </TabsTrigger>
            <TabsTrigger 
              value="enesefwe"
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white"
            >
              Enesefwe
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
                  <Image className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Belum Ada Konten
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Konten untuk kategori {activeCategory} akan muncul di sini setelah ditambahkan oleh admin.
                  </p>
                </div>
              </div>
            ) : (
              /* Pinterest-style Masonry Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {distributedItems.map((col, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-4">
                    {col.map((item) => (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="relative overflow-hidden">
                          {item.mediaType === 'video' ? (
                            <div className="relative">
                              <img
                                src={item.thumbnail || item.mediaUrl}
                                alt={item.title || 'Gallery item'}
                                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                style={{ 
                                  aspectRatio: 'auto',
                                  minHeight: '200px'
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-white/90 rounded-full p-3">
                                  <Play className="h-8 w-8 text-rose-500 fill-rose-500" />
                                </div>
                              </div>
                              <Badge className="absolute top-2 right-2 bg-black/50 text-white border-0">
                                <Video className="h-3 w-3 mr-1" />
                                Video
                              </Badge>
                            </div>
                          ) : (
                            <img
                              src={item.mediaUrl}
                              alt={item.title || 'Gallery item'}
                              className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          )}
                        </div>
                        {(item.title || item.description) && (
                          <CardContent className="p-3">
                            {item.title && (
                              <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                                {item.title}
                              </h3>
                            )}
                            {item.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                {item.description}
                              </p>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-rose-400 transition-colors"
            onClick={() => setSelectedItem(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedItem.mediaType === 'video' ? (
              <video
                src={selectedItem.mediaUrl}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-lg"
              />
            ) : (
              <img
                src={selectedItem.mediaUrl}
                alt={selectedItem.title || 'Gallery item'}
                className="max-w-full max-h-[85vh] rounded-lg object-contain"
              />
            )}
            {(selectedItem.title || selectedItem.description) && (
              <div className="mt-4 text-center text-white">
                {selectedItem.title && (
                  <h3 className="text-lg font-medium">{selectedItem.title}</h3>
                )}
                {selectedItem.description && (
                  <p className="text-gray-300 mt-1">{selectedItem.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>© 2024 {settings?.siteName || 'Kayz Gallery'}. All rights reserved.</p>
      </footer>
    </div>
  )
}
