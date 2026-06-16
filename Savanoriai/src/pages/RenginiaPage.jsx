import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Edit2, Trash2, X, Check, Users } from 'lucide-react'

const EMPTY_FORM = { pavadinimas: '', data: '', laikas: '', vieta: '', reik_savanoriu: '', mentorius: '', pastabos: '' }

export default function RenginiaPage() {
  const [renginiai, setRenginiai] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('renginiai')
      .select('*, savanorystes(id)')
      .order('data', { ascending: false })
    setRenginiai(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = renginiai.filter(r =>
    `${r.pavadinimas} ${r.vieta} ${r.mentorius}`.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (r) => {
    setForm({
      pavadinimas: r.pavadinimas,
      data: r.data || '',
      laikas: r.laikas || '',
      vieta: r.vieta || '',
      reik_savanoriu: r.reik_savanoriu || '',
      mentorius: r.mentorius || '',
      pastabos: r.pastabos || ''
    })
    setEditId(r.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.pavadinimas) return
    setSaving(true)
    const payload = { ...form, reik_savanoriu: form.reik_savanoriu ? parseInt(form.reik_savanoriu) : null }
    if (editId) {
      await supabase.from('renginiai').update(payload).eq('id', editId)
    } else {
      await supabase.from('renginiai').insert(payload)
    }
    await load()
    setShowForm(false)
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Ar tikrai norite ištrinti šį renginį?')) return
    await supabase.from('renginiai').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800">Renginiai</h1>
          <p className="text-slate-500 mt-1">{renginiai.length} renginiai iš viso</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Pridėti renginį
        </button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input className="input pl-10" placeholder="Ieškoti renginio..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">{editId ? 'Redaguoti renginį' : 'Naujas renginys'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Pavadinimas *</label>
                <input className="input" value={form.pavadinimas} onChange={e => setForm({ ...form, pavadinimas: e.target.value })} placeholder="Renginio pavadinimas" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Data</label>
                  <input className="input" type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
                </div>
                <div>
                  <label className="label">Laikas</label>
                  <input className="input" value={form.laikas} onChange={e => setForm({ ...form, laikas: e.target.value })} placeholder="14:00-16:00" />
                </div>
              </div>
              <div>
                <label className="label">Vieta / įstaiga</label>
                <input className="input" value={form.vieta} onChange={e => setForm({ ...form, vieta: e.target.value })} placeholder="Jurbarko kultūros centras" />
              </div>
              <div>
                <label className="label">Reikia savanorių (sk.)</label>
                <input className="input" type="number" min="0" value={form.reik_savanoriu} onChange={e => setForm({ ...form, reik_savanoriu: e.target.value })} placeholder="4" />
              </div>
              <div>
                <label className="label">Mentorius</label>
                <input className="input" value={form.mentorius} onChange={e => setForm({ ...form, mentorius: e.target.value })} placeholder="Mentoriaus vardas" />
              </div>
              <div>
                <label className="label">Pastabos</label>
                <textarea className="input resize-none" rows={2} value={form.pastabos} onChange={e => setForm({ ...form, pastabos: e.target.value })} placeholder="Papildoma informacija..." />
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
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <div className="card text-center text-slate-400 py-12">Renginių nerasta</div>
          ) : filtered.map(r => {
            const registered = r.savanorystes?.length || 0
            const needed = r.reik_savanoriu || 0
            const full = needed > 0 && registered >= needed
            return (
              <div key={r.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-800">{r.pavadinimas}</h3>
                      {full && <span className="badge bg-green-50 text-green-700">Pilnas</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-500">
                      {r.data && <span>📅 {r.data}{r.laikas ? ` · ${r.laikas}` : ''}</span>}
                      {r.vieta && <span>📍 {r.vieta}</span>}
                      {r.mentorius && <span>👤 {r.mentorius}</span>}
                    </div>
                    {r.pastabos && <p className="text-sm text-slate-400 mt-1">{r.pastabos}</p>}
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {needed > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                          <Users size={14} /> {registered}/{needed}
                        </div>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1">
                          <div className={`h-full rounded-full transition-all ${full ? 'bg-green-500' : 'bg-brand-500'}`} style={{ width: `${Math.min(100, (registered / needed) * 100)}%` }} />
                        </div>
                      </div>
                    )}
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}