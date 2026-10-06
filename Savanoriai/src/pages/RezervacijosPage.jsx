import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Check, X, Calendar } from 'lucide-react'

const STATUSAI = {
  laukiama: { tekstas: 'Laukia', klase: 'bg-amber-50 text-amber-700' },
  patvirtinta: { tekstas: 'Patvirtinta', klase: 'bg-green-50 text-green-700' },
  atmesta: { tekstas: 'Atmesta', klase: 'bg-red-50 text-red-700' },
}

export default function RezervacijosPage() {
  const [irasai, setIrasai] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [rodytiVisus, setRodytiVisus] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('savanorystes')
      .select('id, statusas, sukurta, renginys_id, savanoriai(vardas, pavarde, mokykla, klase), renginiai(pavadinimas, data, laikas, reik_savanoriu)')
      .not('renginys_id', 'is', null)
      .order('sukurta', { ascending: true })
    setIrasai(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const keistiStatusa = async (id, statusas) => {
    setUpdating(p => ({ ...p, [id]: true }))
    await supabase.from('savanorystes').update({ statusas }).eq('id', id)
    setIrasai(prev => prev.map(i => (i.id === id ? { ...i, statusas } : i)))
    setUpdating(p => ({ ...p, [id]: false }))
  }

  const grupes = {}
  irasai.forEach(i => {
    if (!grupes[i.renginys_id]) grupes[i.renginys_id] = { id: i.renginys_id, renginys: i.renginiai, irasai: [] }
    grupes[i.renginys_id].irasai.push(i)
  })

  const siandien = new Date().toISOString().slice(0, 10)
  const sarasas = Object.values(grupes)
    .filter(g => rodytiVisus
      ? (g.renginys?.data || '') >= siandien
      : g.irasai.some(i => i.statusas === 'laukiama'))
    .sort((a, b) => (a.renginys?.data || '').localeCompare(b.renginys?.data || ''))

  const laukiaViso = irasai.filter(i => i.statusas === 'laukiama').length
  const isspresti = irasai.filter(i => i.statusas !== 'laukiama').slice().reverse()

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-800">Rezervacijos</h1>
          <p className="text-slate-500 mt-1">{laukiaViso} laukia patvirtinimo</p>
        </div>
        <button onClick={() => setRodytiVisus(!rodytiVisus)} className="btn-secondary text-sm">
          {rodytiVisus ? 'Rodyti tik laukiančias' : 'Rodyti visus būsimus renginius'}
        </button>
      </div>

      {sarasas.length === 0 ? (
        <div className="card text-center text-slate-400 py-16">Visos rezervacijos peržiūrėtos</div>
      ) : (
        <div className="space-y-4">
          {sarasas.map(g => {
            const patvirtinta = g.irasai.filter(i => i.statusas === 'patvirtinta').length
            const limitas = g.renginys?.reik_savanoriu || 0
            const pilnas = limitas > 0 && patvirtinta >= limitas
            return (
              <div key={g.id} className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display font-semibold text-lg text-slate-800">{g.renginys?.pavadinimas}</h2>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={13} /> {g.renginys?.data}{g.renginys?.laikas ? ` · ${g.renginys.laikas}` : ''}
                    </p>
                  </div>
                  {limitas > 0 && (
                    <span className={`badge ${pilnas ? 'bg-green-50 text-green-700' : 'bg-brand-50 text-brand-700'}`}>
                      Patvirtinta {patvirtinta}/{limitas}
                    </span>
                  )}
                </div>
                <div>
                  {g.irasai.map((i, idx) => {
                    const st = STATUSAI[i.statusas] || STATUSAI.laukiama
                    return (
                      <div key={i.id} className="flex items-center gap-3 px-6 py-3 border-b border-slate-50 last:border-b-0">
                        <span className="text-xs font-bold text-slate-400 w-5 text-right">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800">{i.savanoriai?.vardas} {i.savanoriai?.pavarde}</p>
                          <p className="text-xs text-slate-400">
                            {[i.savanoriai?.mokykla, i.savanoriai?.klase].filter(Boolean).join(', ')}
                            {(i.savanoriai?.mokykla || i.savanoriai?.klase) ? ' · ' : ''}
                            Užsiregistravo {new Date(i.sukurta).toLocaleString('lt-LT', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`badge ${st.klase}`}>{st.tekstas}</span>
                        <div className="flex gap-1">
                          {i.statusas !== 'patvirtinta' && (
                            <button
                              onClick={() => keistiStatusa(i.id, 'patvirtinta')}
                              disabled={updating[i.id]}
                              title="Patvirtinti"
                              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          {i.statusas !== 'atmesta' && (
                            <button
                              onClick={() => keistiStatusa(i.id, 'atmesta')}
                              disabled={updating[i.id]}
                              title="Atmesti"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isspresti.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display font-semibold text-lg text-slate-700 mb-3">Visos rezervacijos</h2>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
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
                  {isspresti.map(i => {
                    const st = STATUSAI[i.statusas] || STATUSAI.laukiama
                    return (
                      <tr key={i.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-800">{i.savanoriai?.vardas} {i.savanoriai?.pavarde}</td>
                        <td className="px-6 py-3 text-slate-600">{i.renginiai?.pavadinimas}</td>
                        <td className="px-6 py-3 text-slate-500">{i.renginiai?.data}</td>
                        <td className="px-6 py-3"><span className={`badge ${st.klase}`}>{st.tekstas}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}