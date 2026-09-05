import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Calendar, MapPin, User, CheckCircle2 } from 'lucide-react'

export default function ManoSavanorystes() {
  const { user } = useAuth()
  const [renginiai, setRenginiai] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('savanoris_id')
        .eq('id', user.id)
        .single()

      if (!profile?.savanoris_id) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('rezervacijos')
        .select('*, renginiai(*)')
        .eq('savanoris_id', profile.savanoris_id)
        .eq('statusas', 'patvirtinta')

      if (!error) {
        const sutvarkyti = (data || [])
          .filter(r => r.renginiai)
          .sort((a, b) => (b.renginiai.data || '').localeCompare(a.renginiai.data || ''))
        setRenginiai(sutvarkyti)
      }
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
        <p className="text-slate-500 mt-1">{renginiai.length} renginiai</p>
      </div>

      {renginiai.length === 0 ? (
        <div className="card text-center text-slate-400 py-16">
          Kol kas nesate užsiregistravę į jokius renginius
        </div>
      ) : (
        <div className="grid gap-3">
          {renginiai.map(r => {
            const rg = r.renginiai
            return (
              <div key={r.id} className="card border-l-4 border-l-green-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-2">{rg.pavadinimas}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                      {rg.data && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {rg.data}{rg.laikas && ` · ${rg.laikas}`}
                        </span>
                      )}
                      {rg.vieta && <span className="flex items-center gap-1"><MapPin size={13} /> {rg.vieta}</span>}
                      {rg.mentorius && <span className="flex items-center gap-1"><User size={13} /> {rg.mentorius}</span>}
                    </div>
                  </div>
                  <span className="badge bg-green-50 text-green-700 flex items-center gap-1 ml-4 shrink-0">
                    <CheckCircle2 size={12} /> Užsiregistravęs
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}