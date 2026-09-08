import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Camera, Phone, Mail, Check, X } from 'lucide-react'

export default function SavanoriasProfile() {
  const { user } = useAuth()
  const [savanoris, setSavanoris] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [form, setForm] = useState({ el_pastas: '', telefonas: '' })
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('savanoris_id')
        .eq('id', user.id)
        .single()

      if (!profile?.savanoris_id) { setLoading(false); return }

      const { data } = await supabase
        .from('savanoriai')
        .select('*')
        .eq('id', profile.savanoris_id)
        .single()

      const { data: rezervacijos } = await supabase
        .from('rezervacijos')
        .select('renginiai(valandos)')
        .eq('savanoris_id', profile.savanoris_id)
        .eq('statusas', 'patvirtinta')

      const savanorystesCount = rezervacijos?.length || 0
      const valandosSum = rezervacijos?.reduce((sum, r) => sum + (r.renginiai?.valandos || 0), 0) || 0

      setSavanoris({ ...data, savanorystes_count: savanorystesCount, valandos_sum: valandosSum })
      setForm({
        el_pastas: data?.el_pastas || '',
        telefonas: data?.telefonas || '',
        mokykla: data?.mokykla || '',
        klase: data?.klase || ''
      })
      setLoading(false)
    }
    load()
  }, [user])

  const handleSave = async () => {
    if (!savanoris) return
    setSaving(true)
    await supabase
      .from('savanoriai')
      .update(form)
      .eq('id', savanoris.id)
    setSavanoris(prev => ({ ...prev, ...form }))
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
    if (!file || !savanoris) return
    setUploadingPhoto(true)

    const resizedBlob = await resizeImage(file)
    const path = `${savanoris.id}.jpg`

    await supabase.storage.from('Avatars').remove([path])

    const { error } = await supabase.storage
      .from('Avatars')
      .upload(path, resizedBlob, { contentType: 'image/jpeg' })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('Avatars')
        .getPublicUrl(path)

      await supabase
        .from('savanoriai')
        .update({ avatar_url: publicUrl })
        .eq('id', savanoris.id)

      setSavanoris(prev => ({ ...prev, avatar_url: publicUrl }))
    }
    setUploadingPhoto(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!savanoris) return (
    <div className="card text-center text-slate-400 py-16">
      Profilis nerastas. Kreipkitės į mentorių.
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Mano profilis</h1>
        <p className="text-slate-500 mt-1">Tavo asmeninė informacija</p>
      </div>

      {/* Nuotrauka */}
      <div className="card mb-4">
        <div className="flex items-center gap-6">
          <div className="relative">
            {savanoris.avatar_url ? (
              <img
                src={savanoris.avatar_url}
                alt="Nuotrauka"
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-700 font-bold text-3xl">
                {savanoris.vardas?.[0]}{savanoris.pavarde?.[0]}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-brand-700 transition-colors"
            >
              {uploadingPhoto
                ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Camera size={14} />
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-800">{savanoris.vardas} {savanoris.pavarde}</h2>
            {savanoris.mentorius && <p className="text-sm text-slate-500 mt-1">Mentorius: {savanoris.mentorius}</p>}
          </div>
        </div>
      </div>

      {/* Kontaktai */}
      <div className="card mb-4">
        <h3 className="font-semibold text-slate-700 mb-4">Kontaktai</h3>
        <div className="space-y-3">
          <div>
            <label className="label flex items-center gap-1.5"><Mail size={14} /> El. paštas</label>
            <input
              className="input"
              type="email"
              value={form.el_pastas}
              onChange={e => setForm({ ...form, el_pastas: e.target.value })}
              placeholder="el.pastas@example.com"
            />
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
          <div>
            <label className="label">Mokykla</label>
            <input
              className="input"
              value={form.mokykla}
              onChange={e => setForm({ ...form, mokykla: e.target.value })}
              placeholder="Pvz. Jurbarko ..."
            />
          </div>
          <div>
            <label className="label">Klasė</label>
            <input
              className="input"
              value={form.klase}
              onChange={e => setForm({ ...form, klase: e.target.value })}
              placeholder="Pvz. 11a"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary mt-4 w-full justify-center"
        >
          {saving
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : saved
              ? <><Check size={15} /> Išsaugota!</>
              : 'Išsaugoti'
          }
        </button>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="font-display font-bold text-3xl text-brand-600">
            {savanoris.savanorystes_count || 0}
          </p>
          <p className="text-sm text-slate-500 mt-1">Savanorystės</p>
        </div>
        <div className="card text-center">
          <p className="font-display font-bold text-3xl text-slate-700">
            {savanoris.valandos_sum || 0}h
          </p>
          <p className="text-sm text-slate-500 mt-1">Valandos</p>
        </div>
      </div>
    </div>
  )
}