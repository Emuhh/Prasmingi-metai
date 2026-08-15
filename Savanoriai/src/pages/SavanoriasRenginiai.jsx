import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Calendar, MapPin, User, Check, Clock, X } from 'lucide-react'

export default function SavanoriasRenginiai() {
  const { user } = useAuth()
  const [renginiai, setRenginiai] = useState([])
  const [rezervacijos, setRezervacijos] = useState({})
  const [savanorisId, setSavanorisId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState({})

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('savanoris_id')
        .eq('id', user.id)
        .single()

      if (profile?.savanoris_id) {
        setSavanorisId(profile.savanoris_id)
        const { data: rez } = await supabase
          .from('rezervacijos')
          .select('*')
          .eq('savanoris_id', profile.savanoris_id)
        const rezMap = {}
        rez?.forEach(r => { rezMap[r.renginys_id] = r })
        setRezervacijos(rezMap)
      }

      const { data } = await supabase
        .from('renginiai')
        .select('*, savanorystes(id, savanoris_id)')
        .order('data', { ascending: true })
      setRenginiai(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const registruotis = async (renginysId) => {
    if (!savanorisId) return
    setRegistering(prev => ({ ...prev, [renginysId]: true }))
    const { data, error } = await supabase
      .from('rezervacijos')
      .insert({ savanoris_id: savanorisId, renginys_id: renginysId, statusas: 'laukiama' })
      .select()
      .single()
    if (!error && data) {
      setRezervacijos(prev => ({ ...prev, [renginysId]: data }))
    }
    setRegistering(prev => ({ ...prev, [renginysId]: false }))
  }

  const atšaukti = async (renginysId) => {
    if (!savanorisId) return
    setRegistering(prev => ({ ...prev, [renginysId]: true }))
    await supabase
      .from('rezervacijos')
      .delete()
      .eq('savanoris_id', savanorisId)
      .eq('renginys_id', renginysId)
    setRezervacijos(prev => {
      const updated = { ...prev }
      delete updated[renginysId]
      return updated
    })
    setRegistering(prev => ({ ...prev, [renginysId]: false }))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const busimi = renginiai.filter(r => r.data && r.data >= new Date().toISOString().slice(0, 10))
  const praeję = renginiai.filter(r => !r.data || r.data < new Date().toISOString().slice(0, 10))

  const StatusBadge = ({ renginysId }) => {
    const rez = rezervacijos[renginysId]
    if (!rez) return null
    if (rez.statusas === 'patvirtinta') return (
      <span className="badge bg-green-50 text-green-700 flex items-center gap-1">
        <Check size={12} /> Patvirtinta
      </span>
    )
    if (rez.statusas === 'atmesta') return (
      <span className="badge bg-red-50 text-red-700 flex items-center gap-1">
        <X size={12} /> Atmesta
      </span>
    )
    return (
      <span className="badge bg-amber-50 text-amber-700 flex items-center gap-1">
        <Clock size={12} /> Laukiama
      </span>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Renginiai</h1>
        <p className="text-slate-500 mt-1">Registruokis į savanorystę</p>
      </div>

      {busimi.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-lg text-slate-700 mb-3">📅 Artėjantys</h2>
          <div className="grid gap-3">
            {busimi.map(r => {
              const rez = rezervacijos[r.id]
              const isLoading = registering[r.id]
              const vietosLiko = r.reik_savanoriu
                ? Math.max(0, r.reik_savanoriu - (r.savanorystes?.length || 0))
                : null
              const jauUzregistruotas = r.savanorystes?.some(s => s.savanoris_id === savanorisId)
              return (
                <div key={r.id} className="card border-l-4 border-l-brand-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-2">{r.pavadinimas}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                        {r.data && (
                          <span className="flex items-center gap-1">
                            <Calendar size={13} /> {r.data}{r.laikas && ` · ${r.laikas}`}
                          </span>
                        )}
                        {r.vieta && <span className="flex items-center gap-1"><MapPin size={13} /> {r.vieta}</span>}
                        {r.mentorius && <span className="flex items-center gap-1"><User size={13} /> {r.mentorius}</span>}
                      </div>
                      {r.pastabos && <p className="text-sm text-slate-400 mt-2">{r.pastabos}</p>}
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <StatusBadge renginysId={r.id} />
                      {vietosLiko !== null && (
                        <span className={`text-xs font-medium ${vietosLiko === 0 ? 'text-red-500' : 'text-slate-500'}`}>
                          {vietosLiko === 0 ? 'Vietos užimtos' : vietosLiko === 1 ? '1 vieta liko' : vietosLiko >= 10 ? `${vietosLiko} vietų liko` : `${vietosLiko} vietos liko`}
                        </span>
                      )}
                      {!rez && !jauUzregistruotas && (
                        <button
                          onClick={() => registruotis(r.id)}
                          disabled={isLoading || !savanorisId}
                          className="btn-primary text-sm py-1.5"
                        >
                          {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '+ Registruotis'}
                        </button>
                      )}
                      {rez && rez.statusas === 'laukiama' && (
                        <button
                          onClick={() => atšaukti(r.id)}
                          disabled={isLoading}
                          className="btn-secondary text-sm py-1.5"
                        >
                          Atšaukti
                        </button>
                      )}
                    </div>
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