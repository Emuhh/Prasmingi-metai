import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Edit2, Trash2, X, Check, Phone, Mail, User, Clock, ChevronRight } from 'lucide-react'

const EMPTY_FORM = { vardas: '', pavarde: '', el_pastas: '', telefonas: '', mentorius: '' }

export default function SavanoriaiPage() {
  const [savanoriai, setSavanoriai] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showProfile, setShowProfile] = useState(null)
  const [profileSavanorystes, setProfileSavanorystes] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('savanoriai')
      .select('*, savanorystes(valandos, data, renginiai(pavadinimas))')
      .order('pavarde')
    setSavanoriai(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = savanoriai.filter(s =>
    `${s.vardas} ${s.pavarde} ${s.mentorius}`.toLowerCase().includes(search.toLowerCase())
  )

  const openProfile = (s) => {
    setShowProfile(s)
    const savs = (s.savanorystes || []).sort((a, b) => (b.data || '').localeCompare(a.data || ''))
    setProfileSavanorystes(savs)
  }

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (s, e) => {
    e.stopPropagation()
    setForm({ vardas: s.vardas, pavarde: s.pavarde, el_pastas: s.el_pastas || '', telefonas: s.telefonas || '', mentorius: s.mentorius || '' })
    setEditId(s.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.vardas || !form.pavarde) return
    setSaving(true)
    if (editId) {
      await supabase.from('savanoriai').update(form).eq('id', editId)
    } else {
      await supabase.from('savanoriai').insert(form)
    }
    await load()
    setShowForm(false)
    setSaving(false)
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Ar tikrai norite ištrinti šį savanorį?')) return
    await supabase.from('savanoriai').delete().eq('id', id)
    await load()
  }

  const totalValandos = (s) => s.savanorystes?.reduce((sum, r) => sum + (r.valandos || 0), 0) || 0
  const totalSavanorystes = (s) => s.savanorystes?.length || 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800">Savanoriai</h1>
          <p className="text-slate-500 mt-1">{savanoriai.length} savanoriai iš viso</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Pridėti savanorį
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input className="input pl-10" placeholder="Ieškoti pagal vardą, pavardę, mentorių..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Pridėjimo forma */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">{editId ? 'Redaguoti savanorį' : 'Naujas savanoris'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Vardas *</label>
                  <input className="input" value={form.vardas} onChange={e => setForm({ ...form, vardas: e.target.value })} placeholder="Vardas" />
                </div>
                <div>
                  <label className="label">Pavardė *</label>
                  <input className="input" value={form.pavarde} onChange={e => setForm({ ...form, pavarde: e.target.value })} placeholder="Pavardė" />
                </div>
              </div>
              <div>
                <label className="label">El. paštas</label>
                <input className="input" type="email" value={form.el_pastas} onChange={e => setForm({ ...form, el_pastas: e.target.value })} placeholder="el.pastas@example.com" />
              </div>
              <div>
                <label className="label">Telefonas</label>
                <input className="input" value={form.telefonas} onChange={e => setForm({ ...form, telefonas: e.target.value })} placeholder="+370..." />
              </div>
              <div>
                <label className="label">Mentorius</label>
                <input className="input" value={form.mentorius} onChange={e => setForm({ ...form, mentorius: e.target.value })} placeholder="Mentoriaus vardas" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">Atšaukti</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={15} /> Išsaugoti</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Savanorio profilis */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-700 font-bold text-2xl flex-shrink-0">
                    {showProfile.vardas?.[0]}{showProfile.pavarde?.[0]}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-2xl text-slate-800">{showProfile.vardas} {showProfile.pavarde}</h2>
                    {showProfile.mentorius && (
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                        <User size={13} /> Mentorius: {showProfile.mentorius}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowProfile(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              {/* Statistika */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-brand-50 rounded-xl px-4 py-3 text-center">
                  <p className="font-display font-bold text-2xl text-brand-700">{totalSavanorystes(showProfile)}</p>
                  <p className="text-xs text-brand-600">Savanorystės</p>
                </div>
                <div className="bg-slate-50 rounded-xl px-4 py-3 text-center">
                  <p className="font-display font-bold text-2xl text-slate-700">{totalValandos(showProfile)}h</p>
                  <p className="text-xs text-slate-500">Valandos</p>
                </div>
              </div>
            </div>

            {/* Kontaktai */}
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-3">Kontaktai</h3>
              <div className="space-y-2">
                {showProfile.el_pastas ? (
                  <a href={`mailto:${showProfile.el_pastas}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-brand-600 transition-colors">
                    <Mail size={16} className="text-slate-400" /> {showProfile.el_pastas}
                  </a>
                ) : (
                  <p className="text-sm text-slate-400 flex items-center gap-3"><Mail size={16} /> El. paštas nenurodytas</p>
                )}
                {showProfile.telefonas ? (
                  <a href={`tel:${showProfile.telefonas}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-brand-600 transition-colors">
                    <Phone size={16} className="text-slate-400" /> {showProfile.telefonas}
                  </a>
                ) : (
                  <p className="text-sm text-slate-400 flex items-center gap-3"><Phone size={16} /> Telefonas nenurodytas</p>
                )}
              </div>
            </div>

            {/* Savanorystės */}
            <div className="p-6">
              <h3 className="font-semibold text-slate-700 mb-3">Savanorysčių istorija</h3>
              {profileSavanorystes.length === 0 ? (
                <p className="text-slate-400 text-sm">Savanorysčių dar nėra</p>
              ) : (
                <div className="space-y-2">
                  {profileSavanorystes.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.renginiai?.pavadinimas || s.pastabos || '—'}</p>
                        {s.data && <p className="text-xs text-slate-400 flex items-center gap-1"><Clock size={11} /> {s.data}</p>}
                      </div>
                      <span className="badge bg-brand-50 text-brand-700">{s.valandos}h</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Redaguoti mygtukas */}
            <div className="px-6 pb-6">
              <button
                onClick={(e) => { setShowProfile(null); openEdit(showProfile, e) }}
                className="btn-secondary w-full justify-center"
              >
                <Edit2 size={15} /> Redaguoti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Savanorių sąrašas */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center text-slate-400 py-12">Savanorių nerasta</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {filtered.map((s, i) => (
            <div
              key={s.id}
              onClick={() => openProfile(s)}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors ${i !== filtered.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                {s.vardas?.[0]}{s.pavarde?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800">{s.vardas} {s.pavarde}</p>
                <p className="text-xs text-slate-400">{s.mentorius ? `Mentorius: ${s.mentorius}` : 'Mentorius nenurodytas'}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-600">{totalSavanorystes(s)} sav.</p>
                  <p className="text-xs text-slate-400">{totalValandos(s)}h</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => openEdit(s, e)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"><Edit2 size={14} /></button>
                  <button onClick={(e) => handleDelete(s.id, e)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}