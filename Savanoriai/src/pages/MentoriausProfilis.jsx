import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Camera, Phone, Mail, Check, Trash2 } from 'lucide-react'
import TemosPasirinkimas from '../components/TemosPasirinkimas'

export default function MentoriausProfilis() {
  const { user } = useAuth()
  const [profilis, setProfilis] = useState(null)
  const [form, setForm] = useState({ vardas: '', telefonas: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('vardas, telefonas, avatar_url')
        .eq('id', user.id)
        .single()
      setProfilis(data || {})
      setForm({ vardas: data?.vardas || '', telefonas: data?.telefonas || '' })
      setLoading(false)
    }
    load()
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('profiles').update(form).eq('id', user.id)
    setProfilis(prev => ({ ...prev, ...form }))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  const resizeImage = (file, maxSize = 300) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize }
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)

    const resizedBlob = await resizeImage(file)
    const path = `mentorius-${user.id}.jpg`

    await supabase.storage.from('Avatars').remove([path])
    const { error } = await supabase.storage
      .from('Avatars')
      .upload(path, resizedBlob, { contentType: 'image/jpeg' })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('Avatars').getPublicUrl(path)
      const url = `${publicUrl}?t=${Date.now()}`
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      setProfilis(prev => ({ ...prev, avatar_url: url }))
    }
    setUploadingPhoto(false)
  }

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true)
    await supabase.storage.from('Avatars').remove([`mentorius-${user.id}.jpg`])
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
    setProfilis(prev => ({ ...prev, avatar_url: null }))
    setUploadingPhoto(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const inicialai = (profilis.vardas || user.email || '?')
    .split(' ')
    .map(z => z[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Mano profilis</h1>
        <p className="text-slate-500 mt-1">Mentoriaus informacija</p>
      </div>

      {/* Nuotrauka */}
      <div className="card mb-4">
        <div className="flex items-center gap-6">
          <div className="relative">
            {profilis.avatar_url ? (
              <img src={profilis.avatar_url} alt="Nuotrauka" className="w-24 h-24 rounded-2xl object-cover" />
            ) : (
              <div className="w-24 h-24 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-700 font-bold text-3xl">
                {inicialai}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-brand-700 transition-colors"
            >
              {uploadingPhoto
                ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera size={14} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            {profilis.avatar_url && (
              <button
                onClick={handleRemovePhoto}
                disabled={uploadingPhoto}
                className="absolute -bottom-2 -left-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 shadow-md transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-800">{profilis.vardas || 'Vardas nenurodytas'}</h2>
            <p className="text-sm text-brand-600 font-medium mt-1">Mentorius</p>
          </div>
        </div>
      </div>

      {/* Informacija */}
      <div className="card mb-4">
        <h3 className="font-semibold text-slate-700 mb-4">Informacija</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Vardas ir pavardė</label>
            <input
              className="input"
              value={form.vardas}
              onChange={e => setForm({ ...form, vardas: e.target.value })}
              placeholder="Vardas Pavardė"
            />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Mail size={14} /> El. paštas</label>
            <input className="input bg-slate-50 text-slate-500" value={user.email} disabled />
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Phone size={14} /> Telefonas</label>
            <input
              className="input"
              value={form.telefonas}
              onChange={e => setForm({ ...form, telefonas: e.target.value })}
              placeholder="+370..."
            />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary mt-4 w-full justify-center">
          {saving
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : saved ? <><Check size={15} /> Išsaugota!</> : 'Išsaugoti'}
        </button>
      </div>

      {/* Spalva */}
      <div className="card">
        <h3 className="font-semibold text-slate-700 mb-3">Svetainės spalva</h3>
        <div className="-mx-4">
          <TemosPasirinkimas />
        </div>
      </div>
    </div>
  )
}