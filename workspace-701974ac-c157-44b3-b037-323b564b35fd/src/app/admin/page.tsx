'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Lock, User, Loader2, LogOut, Upload, Settings, Image, Video, Trash2, Edit, Plus, Save, X, Palette } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'

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
  id: string
  siteName: string
  logoUrl: string | null
  description: string | null
  primaryColor: string
}

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Admin state
  const [items, setItems] = useState<GalleryItem[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loadingItems, setLoadingItems] = useState(false)
  const [activeTab, setActiveTab] = useState('gallery')
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [newItemCategory, setNewItemCategory] = useState('esefwe')
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    siteName: '',
    logoUrl: '',
    description: '',
    primaryColor: '#e11d48'
  })

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify')
        const data = await res.json()
        setIsAuthenticated(data.authenticated)
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  // Fetch items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchItems()
      fetchSettings()
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (res.ok) {
        setIsAuthenticated(true)
        setUsername('')
        setPassword('')
      } else {
        setLoginError(data.error || 'Login failed')
      }
    } catch (error) {
      setLoginError('An error occurred')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const fetchItems = async () => {
    setLoadingItems(true)
    try {
      const res = await fetch('/api/gallery/all')
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
      setSettingsForm({
        siteName: data.siteName || '',
        logoUrl: data.logoUrl || '',
        description: data.description || '',
        primaryColor: data.primaryColor || '#e11d48'
      })
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleFileUpload = async (files: FileList, type: 'image' | 'video') => {
    setUploadingFiles(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      formData.append('type', type)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      return data.urls
    } catch (error) {
      console.error('Upload error:', error)
      return []
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleAddItems = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Pilih file untuk diupload',
        variant: 'destructive'
      })
      return
    }

    setUploadingFiles(true)
    try {
      const type = selectedFiles[0].type.startsWith('video') ? 'video' : 'image'
      const urls = await handleFileUpload(selectedFiles, type)

      for (const url of urls) {
        await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newItemTitle || null,
            description: newItemDescription || null,
            mediaUrl: url,
            mediaType: type,
            category: newItemCategory
          })
        })
      }

      toast({
        title: 'Berhasil',
        description: `${urls.length} item berhasil ditambahkan`
      })

      setSelectedFiles(null)
      setNewItemTitle('')
      setNewItemDescription('')
      fetchItems()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menambahkan item',
        variant: 'destructive'
      })
    } finally {
      setUploadingFiles(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Yakin ingin menghapus item ini?')) return

    try {
      await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
      toast({
        title: 'Berhasil',
        description: 'Item berhasil dihapus'
      })
      fetchItems()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus item',
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      await fetch(`/api/gallery/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, isActive: !item.isActive })
      })
      fetchItems()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengupdate status',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem) return

    try {
      await fetch(`/api/gallery/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingItem.title,
          description: editingItem.description,
          category: editingItem.category
        })
      })
      toast({
        title: 'Berhasil',
        description: 'Item berhasil diupdate'
      })
      setEditingItem(null)
      fetchItems()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengupdate item',
        variant: 'destructive'
      })
    }
  }

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      })
      toast({
        title: 'Berhasil',
        description: 'Pengaturan berhasil disimpan'
      })
      fetchSettings()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan',
        variant: 'destructive'
      })
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const urls = await handleFileUpload(files, 'image')
    if (urls.length > 0) {
      setSettingsForm(prev => ({ ...prev, logoUrl: urls[0] }))
    }
  }

  // Loading state while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  // Login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Masukkan kredensial admin untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              {loginError && (
                <p className="text-sm text-red-500 text-center">{loginError}</p>
              )}
              <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Kayz Gallery Admin
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                Lihat Website
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white dark:bg-gray-800">
            <TabsTrigger value="gallery" className="gap-2">
              <Image className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="add" className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Konten
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Pengaturan
            </TabsTrigger>
          </TabsList>

          {/* Gallery Management */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Kelola Gallery</CardTitle>
                <CardDescription>
                  Kelola semua konten gallery. Aktifkan/nonaktifkan atau hapus item.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingItems ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Belum ada konten. Tambahkan konten baru.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Group by category */}
                    {['esefwe', 'enesefwe'].map(category => {
                      const categoryItems = items.filter(item => item.category === category)
                      if (categoryItems.length === 0) return null
                      return (
                        <div key={category} className="space-y-3">
                          <h3 className="font-semibold text-lg capitalize">{category}</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {categoryItems.map(item => (
                              <div
                                key={item.id}
                                className={`relative group rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 ${
                                  !item.isActive ? 'opacity-50' : ''
                                }`}
                              >
                                <div className="aspect-square relative">
                                  {item.mediaType === 'video' ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                                      <Video className="h-8 w-8 text-gray-400" />
                                    </div>
                                  ) : (
                                    <img
                                      src={item.mediaUrl}
                                      alt={item.title || ''}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-8 w-8"
                                      onClick={() => setEditingItem(item)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-8 w-8"
                                      onClick={() => handleToggleActive(item)}
                                    >
                                      {item.isActive ? (
                                        <X className="h-4 w-4" />
                                      ) : (
                                        <Save className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="destructive"
                                      className="h-8 w-8"
                                      onClick={() => handleDeleteItem(item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="p-2">
                                  <p className="text-xs truncate">{item.title || 'Tanpa judul'}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {item.mediaType === 'video' ? 'Video' : 'Image'}
                                    </Badge>
                                    <Badge variant={item.isActive ? 'default' : 'secondary'} className="text-xs">
                                      {item.isActive ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Content */}
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Tambah Konten Baru</CardTitle>
                <CardDescription>
                  Upload foto atau video ke gallery. Bisa pilih lebih dari satu file.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Pilih Kategori</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value="esefwe"
                        checked={newItemCategory === 'esefwe'}
                        onChange={() => setNewItemCategory('esefwe')}
                        className="h-4 w-4 text-rose-500"
                      />
                      <span>Esefwe</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value="enesefwe"
                        checked={newItemCategory === 'enesefwe'}
                        onChange={() => setNewItemCategory('enesefwe')}
                        className="h-4 w-4 text-rose-500"
                      />
                      <span>Enesefwe</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Judul (Opsional)</Label>
                  <Input
                    placeholder="Judul konten"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deskripsi (Opsional)</Label>
                  <Textarea
                    placeholder="Deskripsi konten"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pilih File (Bisa lebih dari satu)</Label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    Format yang didukung: JPG, PNG, GIF, MP4, WebM
                  </p>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-medium mb-2">{selectedFiles.length} file dipilih:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedFiles).map((file, index) => (
                        <Badge key={index} variant="secondary">
                          {file.name.slice(0, 20)}{file.name.length > 20 ? '...' : ''}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddItems}
                  className="w-full bg-rose-500 hover:bg-rose-600"
                  disabled={uploadingFiles || !selectedFiles}
                >
                  {uploadingFiles ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Save
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Pengaturan Website
                </CardTitle>
                <CardDescription>
                  Kustomisasi tampilan dan informasi website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Nama Website</Label>
                  <Input
                    placeholder="Kayz Gallery"
                    value={settingsForm.siteName}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Deskripsi Website</Label>
                  <Textarea
                    placeholder="Deskripsi singkat tentang website"
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo Website</Label>
                  <div className="flex items-center gap-4">
                    {settingsForm.logoUrl && (
                      <img
                        src={settingsForm.logoUrl}
                        alt="Logo preview"
                        className="h-12 w-auto object-contain rounded"
                      />
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Warna Utama</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={settingsForm.primaryColor}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="h-10 w-10 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={settingsForm.primaryColor}
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="max-w-32"
                    />
                    <div
                      className="h-10 w-20 rounded"
                      style={{ backgroundColor: settingsForm.primaryColor }}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="w-full bg-rose-500 hover:bg-rose-600"
                  disabled={uploadingFiles}
                >
                  {uploadingFiles ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Pengaturan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editCategory"
                      value="esefwe"
                      checked={editingItem.category === 'esefwe'}
                      onChange={() => setEditingItem(prev => prev ? { ...prev, category: 'esefwe' } : null)}
                      className="h-4 w-4 text-rose-500"
                    />
                    <span>Esefwe</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="editCategory"
                      value="enesefwe"
                      checked={editingItem.category === 'enesefwe'}
                      onChange={() => setEditingItem(prev => prev ? { ...prev, category: 'enesefwe' } : null)}
                      className="h-4 w-4 text-rose-500"
                    />
                    <span>Enesefwe</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingItem(null)} className="flex-1">
                  Batal
                </Button>
                <Button onClick={handleUpdateItem} className="flex-1 bg-rose-500 hover:bg-rose-600">
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
