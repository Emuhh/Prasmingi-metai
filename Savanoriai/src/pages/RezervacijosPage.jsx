import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Check, X, Clock } from 'lucide-react'

export default function RezervacijosPage() {
  const [rezervacijos, setRezervacijos] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('rezervacijos')
      .select('*, savanoriai(vardas, pavarde, el_pastas), renginiai(pavadinimas, data, laikas)')
      .order('sukurta', { ascending: false })
    setRezervacijos(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, statusas) => {
    setUpdating(prev => ({ ...prev, [id]: true }))
    await supabase
      .from('rezervacijos')
      .update({ statusas, atnaujinta: new Date().toISOString() })
      .eq('id', id)
    await load()
    setUpdating(prev => ({ ...prev, [id]: false }))
  }

  const laukiančios = rezervacijos.filter(r => r.statusas === 'laukiama')
  const kitos = rezervacijos.filter(r => r.statusas !== 'laukiama')

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Rezervacijos</h1>
        <p className="text-slate-500 mt-1">{laukiančios.length} laukia patvirtinimo</p>
      </div>

      {laukiančios.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-lg text-slate-700 mb-3 flex items-center gap-2">
            <Clock size={18} className="text-amber-500" /> Laukia patvirtinimo
          </h2>
          <div className="grid gap-3">
            {laukiančios.map(r => (
              <div key={r.id} className="card border-l-4 border-l-amber-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {r.savanoriai?.vardas} {r.savanoriai?.pavarde}
                    </p>
                    <p className="text-sm text-slate-500">{r.renginiai?.pavadinimas}</p>
                    <p className="text-xs text-slate-400">
                      {r.renginiai?.data}{r.renginiai?.laikas ? ` · ${r.renginiai.laikas}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(r.id, 'patvirtinta')}
                      disabled={updating[r.id]}
                      className="btn-primary text-sm py-1.5"
                    >
                      <Check size={14} /> Patvirtinti
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, 'atmesta')}
                      disabled={updating[r.id]}
                      className="btn-danger text-sm py-1.5"
                    >
                      <X size={14} /> Atmesti
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {kitos.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-lg text-slate-700 mb-3">Visos rezervacijos</h2>
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left font-medium text-slate-500 px-6 py-3">Savanoris</th>
                  <th className="text-left font-medium text-slate-500 px-6 py-3">Renginys</th>
                  <th className="text-left font-medium text-slate-500 px-6 py-3">Data</th>
                  <th className="text-left font-medium text-slate-500 px-6 py-3">Statusas</th>
                </tr>
              </thead>
              <tbody>
                {kitos.map(r => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {r.savanoriai?.vardas} {r.savanoriai?.pavarde}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{r.renginiai?.pavadinimas}</td>
                    <td className="px-6 py-3 text-slate-500">{r.renginiai?.data}</td>
                    <td className="px-6 py-3">
                      {r.statusas === 'patvirtinta' ? (
                        <span className="badge bg-green-50 text-green-700 flex items-center gap-1 w-fit">
                          <Check size={12} /> Patvirtinta
                        </span>
                      ) : (
                        <span className="badge bg-red-50 text-red-700 flex items-center gap-1 w-fit">
                          <X size={12} /> Atmesta
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rezervacijos.length === 0 && !loading && (
        <div className="card text-center text-slate-400 py-16">Rezervacijų dar nėra</div>
      )}
    </div>
  )
}