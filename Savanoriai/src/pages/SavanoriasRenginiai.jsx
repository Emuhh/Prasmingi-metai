import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Calendar, Clock, MapPin, User } from 'lucide-react'

export default function SavanoriasRenginiai() {
  const [renginiai, setRenginiai] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('renginiai')
        .select('*, savanorystes(id)')
        .order('data', { ascending: true })
      setRenginiai(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const busimi = renginiai.filter(r => r.data && r.data >= new Date().toISOString().slice(0, 10))
  const praeję = renginiai.filter(r => !r.data || r.data < new Date().toISOString().slice(0, 10))

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Renginiai</h1>
        <p className="text-slate-500 mt-1">Artėjantys ir praėję renginiai</p>
      </div>

      {busimi.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-lg text-slate-700 mb-3">📅 Artėjantys</h2>
          <div className="grid gap-3">
            {busimi.map(r => {
              const registered = r.savanorystes?.length || 0
              const needed = r.reik_savanoriu || 0
              const full = needed > 0 && registered >= needed
              return (
                <div key={r.id} className="card border-l-4 border-l-brand-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-2">{r.pavadinimas}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        {r.data && (
                          <span className="flex items-center gap-1">
                            <Calendar size={13} /> {r.data}
                            {r.laikas && ` · ${r.laikas}`}
                          </span>
                        )}
                        {r.vieta && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} /> {r.vieta}
                          </span>
                        )}
                        {r.mentorius && (
                          <span className="flex items-center gap-1">
                            <User size={13} /> {r.mentorius}
                          </span>
                        )}
                      </div>
                      {r.pastabos && <p className="text-sm text-slate-400 mt-2">{r.pastabos}</p>}
                    </div>
                    {needed > 0 && (
                      <div className="ml-4 text-right flex-shrink-0">
                        <span className={`badge ${full ? 'bg-green-50 text-green-700' : 'bg-brand-50 text-brand-700'}`}>
                          {full ? 'Pilnas' : `${registered}/${needed} sav.`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {praeję.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-lg text-slate-700 mb-3">✅ Praėję</h2>
          <div className="grid gap-3">
            {praeję.map(r => (
              <div key={r.id} className="card opacity-60">
                <h3 className="font-medium text-slate-700 mb-1">{r.pavadinimas}</h3>
                <div className="flex flex-wrap gap-x-4 text-sm text-slate-400">
                  {r.data && <span className="flex items-center gap-1"><Calendar size={13} /> {r.data}</span>}
                  {r.vieta && <span className="flex items-center gap-1"><MapPin size={13} /> {r.vieta}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {renginiai.length === 0 && (
        <div className="card text-center text-slate-400 py-16">Renginių dar nėra</div>
      )}
    </div>
  )
}