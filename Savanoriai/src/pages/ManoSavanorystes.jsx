import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Calendar, MapPin, Check } from 'lucide-react'

export default function ManoSavanorystes() {
  const { user } = useAuth()
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

      const { data: rez } = await supabase
        .from('rezervacijos')
        .select('*, renginiai(pavadinimas, data, laikas, vieta)')
        .eq('savanoris_id', profile.savanoris_id)
        .eq('statusas', 'patvirtinta')
        .order('sukurta', { ascending: false })

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
        <h1 className="font-display font-bold text-3xl text-slate-800">Mano registracijos</h1>
        <p className="text-slate-500 mt-1">{rezervacijos.length} renginiai</p>
      </div>

      {rezervacijos.length === 0 ? (
        <div className="card text-center text-slate-400 py-16">
          Dar nėra registracijų – registruokis į renginius!
        </div>
      ) : (
        <div className="grid gap-3">
          {rezervacijos.map(r => (
            <div key={r.id} className="card border-l-4 border-l-brand-500">
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
                <span className="badge bg-green-50 text-green-700 flex items-center gap-1">
                  <Check size={12} /> Užsiregistravęs
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}