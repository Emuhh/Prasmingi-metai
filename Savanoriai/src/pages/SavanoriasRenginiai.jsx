import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Calendar, MapPin, User, Check, Clock } from 'lucide-react'

export default function SavanoriasRenginiai() {
  const { user } = useAuth()
  const [renginiai, setRenginiai] = useState([])
  const [savanorystes, setSavanorystes] = useState({})
  const [savanorisId, setSavanorisId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState({})
  const [dabar, setDabar] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setDabar(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('savanoris_id')
        .eq('id', user.id)
        .single()

      let mySavId = null
      if (profile?.savanoris_id) {
        mySavId = profile.savanoris_id
        setSavanorisId(mySavId)
      }

      const { data } = await supabase
        .from('renginiai')
        .select('*, savanorystes(id, savanoris_id)')
        .order('data', { ascending: true })

      setRenginiai(data || [])

      if (mySavId) {
        const map = {}
        ;(data || []).forEach(r => {
          const mano = r.savanorystes?.find(s => s.savanoris_id === mySavId)
          if (mano) map[r.id] = mano
        })
        setSavanorystes(map)
      }

      setLoading(false)
    }
    load()
  }, [user])

  const registruotis = async (renginysId) => {
    if (!savanorisId) return
    setRegistering(prev => ({ ...prev, [renginysId]: true }))
    const { data, error } = await supabase
      .from('savanorystes')
      .insert({ savanoris_id: savanorisId, renginys_id: renginysId })
      .select()
      .single()
    if (!error && data) {
      setSavanorystes(prev => ({ ...prev, [renginysId]: data }))
      setRenginiai(prev => prev.map(r =>
        r.id === renginysId
          ? { ...r, savanorystes: [...(r.savanorystes || []), data] }
          : r
      ))
    }
    setRegistering(prev => ({ ...prev, [renginysId]: false }))
  }

  const atšaukti = async (renginysId) => {
    if (!savanorisId) return
    setRegistering(prev => ({ ...prev, [renginysId]: true }))
    await supabase
      .from('savanorystes')
      .delete()
      .eq('savanoris_id', savanorisId)
      .eq('renginys_id', renginysId)
    setSavanorystes(prev => {
      const updated = { ...prev }
      delete updated[renginysId]
      return updated
    })
    setRenginiai(prev => prev.map(r =>
      r.id === renginysId
        ? { ...r, savanorystes: (r.savanorystes || []).filter(s => s.savanoris_id !== savanorisId) }
        : r
    ))
    setRegistering(prev => ({ ...prev, [renginysId]: false }))
  }

  const registracijaAktyvt = (r) => {
    if (!r.registracija_nuo) return true
    return dabar >= new Date(r.registracija_nuo)
  }

  const formatRegistracijaNuo = (r) => {
    if (!r.registracija_nuo) return null
    return new Date(r.registracija_nuo).toLocaleString('lt-LT', {
      month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const busimi = renginiai.filter(r => r.data && r.data >= new Date().toISOString().slice(0, 10))
  const praeję = renginiai.filter(r => !r.data || r.data < new Date().toISOString().slice(0, 10))

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
              const mano = savanorystes[r.id]
              const isLoading = registering[r.id]
              const vietosLiko = r.reik_savanoriu
                ? Math.max(0, r.reik_savanoriu - (r.savanorystes?.length || 0))
                : null
              const regAktyvt = registracijaAktyvt(r)
              const regNuoText = formatRegistracijaNuo(r)

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
                      {!regAktyvt && regNuoText && (
                        <div className="mt-2 flex items-center gap-1.5 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 w-fit">
                          <Clock size={13} />
                          Registracija atsidaro {regNuoText}
                        </div>
                      )}
                      {r.pastabos && <p className="text-sm text-slate-400 mt-2">{r.pastabos}</p>}
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      {mano && (
                        <span className="badge bg-green-50 text-green-700 flex items-center gap-1">
                          <Check size={12} /> Užsiregistravęs
                        </span>
                      )}
                      {r.reik_savanoriu && (
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                            <User size={14} /> {r.savanorystes?.length || 0}/{r.reik_savanoriu}
                          </div>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1">
                            <div
                              className={`h-full rounded-full transition-all ${vietosLiko === 0 ? 'bg-green-500' : 'bg-brand-500'}`}
                              style={{ width: `${Math.min(100, ((r.savanorystes?.length || 0) / r.reik_savanoriu) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {!mano && regAktyvt && (
                        <button
                          onClick={() => registruotis(r.id)}
                          disabled={isLoading || !savanorisId}
                          className="btn-primary text-sm py-1.5"
                        >
                          {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '+ Registruotis'}
                        </button>
                      )}
                      {!mano && !regAktyvt && (
                        <button disabled className="btn-secondary text-sm py-1.5 opacity-50 cursor-not-allowed">
                          <Clock size={13} /> Uždaryta
                        </button>
                      )}
                      {mano && (
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