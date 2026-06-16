import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react'

const EMPTY_FORM = { savanoris_id: '', renginys_id: '', valandos: '', data: '', pastabos: '' }

export default function SavanorystesPage() {
  const [savanorystes, setSavanorystes] = useState([])
  const [savanoriai, setSavanoriai] = useState([])
  const [renginiai, setRenginiai] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [{ data: sav }, { data: ren }, { data: savs }] = await Promise.all([
      supabase.from('savanoriai').select('id, vardas, pavarde').order('pavarde'),
      supabase.from('renginiai').select('id, pavadinimas').order('pavadinimas'),
      supabase.from('savanorystes').select('*, savanoriai(vardas, pavarde), renginiai(pavadinimas)').order('data', { ascending: false }),
    ])
    setSavanoriai(sav || [])
    setRenginiai(ren || [])
    setSavanorystes(savs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = savanorystes.filter(s => {
    const text = `${s.savanoriai?.vardas} ${s.savanoriai?.pavarde} ${s.renginiai?.pavadinimas}`.toLowerCase()
    return text.includes(search.toLowerCase())
  })

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (s) => {
    setForm({ savanoris_id: s.savanoris_id, renginys_id: s.renginys_id, valandos: s.valandos, data: s.data, pastabos: s.pastabos || '' })
    setEditId(s.id); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.savanoris_id || !form.valandos || !form.data) return
    setSaving(true)
    const payload = { ...form, valandos: parseFloat(form.valandos) }
    if (editId) {
      await supabase.from('savanorystes').update(payload).eq('id', editId)
    } else {
      await supabase.from('savanorystes').insert(payload)
    }
    await load()
    setShowForm(false)
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Ar tikrai norite ištrinti šį įrašą?')) return
    await supabase.from('savanorystes').delete().eq('id', id)
    await load()
  }

  const totalValandos = filtered.reduce((s, r) => s + (r.valandos || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800">Savanorystės</h1>
          <p className="text-slate-500 mt-1">{filtered.length} įrašai · {totalValandos}h iš viso</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Pridėti įrašą</button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input className="input pl-10" placeholder="Ieškoti..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">{editId ? 'Redaguoti įrašą' : 'Naujas savanorystės įrašas'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Savanoris *</label>
                <select className="input" value={form.savanoris_id} onChange={e => setForm({...form, savanoris_id: e.target.value})}>
                  <option value="">Pasirinkti savanorį...</option>
                  {savanoriai.map(s => <option key={s.id} value={s.id}>{s.vardas} {s.pavarde}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Renginys</label>
                <select className="input" value={form.renginys_id} onChange={e => setForm({...form, renginys_id: e.target.value})}>
                  <option value="">Pasirinkti renginį...</option>
                  {renginiai.map(r => <option key={r.id} value={r.id}>{r.pavadinimas}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Valandos *</label>
                  <input className="input" type="number" step="0.5" min="0" value={form.valandos} onChange={e => setForm({...form, valandos: e.target.value})} placeholder="1.5" />
                </div>
                <div>
                  <label className="label">Data *</label>
                  <input className="input" type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label">Pastabos</label>
                <textarea className="input resize-none" rows={2} value={form.pastabos} onChange={e => setForm({...form, pastabos: e.target.value})} placeholder="Papildoma informacija..." />
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
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left font-medium text-slate-500 px-6 py-3">Savanoris</th>
                <th className="text-left font-medium text-slate-500 px-6 py-3">Renginys</th>
                <th className="text-left font-medium text-slate-500 px-6 py-3">Data</th>
                <th className="text-right font-medium text-slate-500 px-6 py-3">Valandos</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-12">Įrašų nerasta</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
                        {s.savanoriai?.vardas?.[0]}{s.savanoriai?.pavarde?.[0]}
                      </div>
                      <span className="font-medium text-slate-800">{s.savanoriai?.vardas} {s.savanoriai?.pavarde}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{s.renginiai?.pavadinimas || s.pastabos || '—'}</td>
                  <td className="px-6 py-3 text-slate-500">{s.data}</td>
                  <td className="px-6 py-3 text-right"><span className="badge bg-brand-50 text-brand-700">{s.valandos}h</span></td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}