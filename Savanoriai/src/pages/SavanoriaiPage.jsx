import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Edit2, Trash2, X, Check } from 'lucide-react'

const EMPTY_FORM = { vardas: '', pavarde: '', el_pastas: '', telefonas: '', mentorius: '' }

export default function SavanoriaiPage() {
  const [savanoriai, setSavanoriai] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('savanoriai')
      .select('*, savanorystes(valandos)')
      .order('pavarde')
    setSavanoriai(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = savanoriai.filter(s =>
    `${s.vardas} ${s.pavarde} ${s.mentorius}`.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (s) => {
    setForm({
      vardas: s.vardas,
      pavarde: s.pavarde,
      el_pastas: s.el_pastas || '',
      telefonas: s.telefonas || '',
      mentorius: s.mentorius || ''
    })
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

  const handleDelete = async (id) => {
    if (!confirm('Ar tikrai norite ištrinti šį savanorį?')) return
    await supabase.from('savanoriai').delete().eq('id', id)
    await load()
  }

  const totalValandos = (s) => s.savanorystes?.reduce((sum, r) => sum + (r.valandos || 0), 0) || 0

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
        <input
          className="input pl-10"
          placeholder="Ieškoti pagal vardą, pavardę, mentorių..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg">
                {editId ? 'Redaguoti savanorį' : 'Naujas savanoris'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Vardas *</label>
                  <input
                    className="input"
                    value={form.vardas}
                    onChange={e => setForm({ ...form, vardas: e.target.value })}
                    placeholder="Vardas"
                  />
                </div>
                <div>
                  <label className="label">Pavardė *</label>
                  <input
                    className="input"
                    value={form.pavarde}
                    onChange={e => setForm({ ...form, pavarde: e.target.value })}
                    placeholder="Pavardė"
                  />
                </div>
              </div>
              <div>
                <label className="label">El. paštas</label>
                <input
                  className="input"
                  type="email"
                  value={form.el_pastas}
                  onChange={e => setForm({ ...form, el_pastas: e.target.value })}
                  placeholder="el.pastas@example.com"
                />
              </div>
              <div>
                <label className="label">Telefonas</label>
                <input
                  className="input"
                  value={form.telefonas}
                  onChange={e => setForm({ ...form, telefonas: e.target.value })}
                  placeholder="+370..."
                />
              </div>
              <div>
                <label className="label">Mentorius</label>
                <input
                  className="input"
                  value={form.mentorius}
                  onChange={e => setForm({ ...form, mentorius: e.target.value })}
                  placeholder="Mentoriaus vardas"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">
                Atšaukti
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><Check size={15} /> Išsaugoti</>
                }
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
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left font-medium text-slate-500 px-6 py-3">Savanoris</th>
                <th className="text-left font-medium text-slate-500 px-6 py-3">El. paštas</th>
                <th className="text-left font-medium text-slate-500 px-6 py-3">Telefonas</th>
                <th className="text-left font-medium text-slate-500 px-6 py-3">Mentorius</th>
                <th className="text-right font-medium text-slate-500 px-6 py-3">Valandos</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 py-12">Savanorių nerasta</td>
                </tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
                        {s.vardas?.[0]}{s.pavarde?.[0]}
                      </div>
                      <span className="font-medium text-slate-800">{s.vardas} {s.pavarde}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{s.el_pastas || '—'}</td>
                  <td className="px-6 py-3 text-slate-500">{s.telefonas || '—'}</td>
                  <td className="px-6 py-3 text-slate-500">{s.mentorius || '—'}</td>
                  <td className="px-6 py-3 text-right">
                    <span className="badge bg-brand-50 text-brand-700">{totalValandos(s)}h</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
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