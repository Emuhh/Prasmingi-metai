import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Calendar, MapPin, Check, Clock, X } from 'lucide-react'

export default function ManoSavanorystes() {
  const { user } = useAuth()
  const [savanorystes, setSavanorystes] = useState([])
  const [rezervacijos, setRezervacijos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('savanoris_id')
        .eq('id', user.id)
        .single()

      if (!profile?.savanoris_id) { setLoading(false); return }

      // Patvirtintos savanorystės
      const { data: savs } = await supabase
        .from('savanorystes')
        .select('*, renginiai(pavadinimas, data, laikas, vieta)')
        .eq('savanoris_id', profile.savanoris_id)
        .order('data', { ascending: false })

      // Visos rezervacijos
      const { data: rez } = await supabase
        .from('rezervacijos')
        .select('*, renginiai(pavadinimas, data, laikas, vieta)')
        .eq('savanoris_id', profile.savanoris_id)
        .order('sukurta', { ascending: false })

      setSavanorystes(savs || [])
      setRezervacijos(rez || [])
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Mano savanorystės</h1>
        <p className="text-slate-500 mt-1">Rezervacijos ir patvirtintos savanorystės</p>
      </div>

      {/* Rezervacijos */}
      {rezervacijos.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-lg text-slate-700 mb-3">📋 Rezervacijos</h2>
          <div className="grid gap-3">
            {rezervacijos.map(r => (
              <div key={r.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">{r.renginiai?.pavadinimas}</h3>
                    <div className="flex flex-wrap gap-x-4 text-sm text-slate-500 mt-1">
                      {r.renginiai?.data && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {r.renginiai.data}
                          {r.renginiai?.laikas && ` · ${r.renginiai.laikas}`}
                        </span>
                      )}
                      {r.renginiai?.vieta && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} /> {r.renginiai.vieta}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {r.statusas === 'patvirtinta' && (
                      <span className="badge bg-green-50 text-green-700 flex items-center gap-1">
                        <Check size={12} /> Patvirtinta
                      </span>
                    )}
                    {r.statusas === 'laukiama' && (
                      <span className="badge bg-amber-50 text-amber-700 flex items-center gap-1">
                        <Clock size={12} /> Laukiama
                      </span>
                    )}
                    {r.statusas === 'atmesta' && (
                      <span className="badge bg-red-50 text-red-700 flex items-center gap-1">
                        <X size={12} /> Atmesta
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patvirtintos savanorystės */}
      {savanorystes.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-lg text-slate-700 mb-3">✅ Įvykdytos savanorystės</h2>
          <div className="grid gap-3">
            {savanorystes.map(s => (
              <div key={s.id} className="card border-l-4 border-l-brand-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">{s.renginiai?.pavadinimas || s.pastabos}</h3>
                    <div className="flex flex-wrap gap-x-4 text-sm text-slate-500 mt-1">
                      {s.data && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {s.data}
                        </span>
                      )}
                      {s.renginiai?.vieta && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} /> {s.renginiai.vieta}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="badge bg-brand-50 text-brand-700 font-semibold">
                    {s.valandos}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rezervacijos.length === 0 && savanorystes.length === 0 && (
        <div className="card text-center text-slate-400 py-16">
          Dar nėra savanorysčių – registruokis į renginius!
        </div>
      )}
    </div>
  )
}