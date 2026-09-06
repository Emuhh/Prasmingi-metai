import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Calendar, MapPin, User, Check, Clock } from 'lucide-react'

export default function ManoSavanorystes() {
  const { user } = useAuth()
  const [savanorystes, setSavanorystes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('savanoris_id')
        .eq('id', user.id)
        .single()

      if (!profile?.savanoris_id) { setLoading(false); return }

      const { data } = await supabase
        .from('savanorystes')
        .select('*, renginiai(pavadinimas, data, laikas, vieta, mentorius)')
        .eq('savanoris_id', profile.savanoris_id)
        .not('renginys_id', 'is', null)
        .order('sukurta', { ascending: false })

      setSavanorystes(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const dabar = new Date().toISOString().slice(0, 10)

  const busimosSav = savanorystes.filter(s => {
    const d = s.renginiai?.data || s.data
    return d && d >= dabar
  })

  const ivykdytosSav = savanorystes.filter(s => {
    const d = s.renginiai?.data || s.data
    return !d || d < dabar
  })

  // Grupuoti pagal metus ir mėnesius
  const gruopuoti = (list) => {
    const grupes = {}
    list.forEach(s => {
      const d = s.renginiai?.data || s.data
      if (!d) return
      const metai = d.slice(0, 4)
      const menuo = d.slice(0, 7)
      if (!grupes[metai]) grupes[metai] = {}
      if (!grupes[metai][menuo]) grupes[metai][menuo] = []
      grupes[metai][menuo].push(s)
    })
    return grupes
  }

  const menesioVardas = (menuo) => {
    const data = new Date(menuo + '-01')
    return data.toLocaleString('lt-LT', { month: 'long' })
  }

  const RenginysCard = ({ s, busimas }) => {
    const d = s.renginiai?.data || s.data
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800">{s.renginiai?.pavadinimas || '—'}</h3>
            <div className="flex flex-wrap gap-x-4 text-sm text-slate-500 mt-1">
              {d && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> {d}
                  {s.renginiai?.laikas && ` · ${s.renginiai.laikas}`}
                </span>
              )}
              {s.renginiai?.vieta && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {s.renginiai.vieta}
                </span>
              )}
              {s.renginiai?.mentorius && (
                <span className="flex items-center gap-1">
                  <User size={13} /> {s.renginiai.mentorius}
                </span>
              )}
            </div>
          </div>
          {busimas ? (
            <span className="badge bg-amber-50 text-amber-700 flex items-center gap-1">
              <Clock size={12} /> Laukiamas
            </span>
          ) : (
            <span className="badge bg-green-50 text-green-700 flex items-center gap-1">
              <Check size={12} /> Savanoriauta
            </span>
          )}
        </div>
      </div>
    )
  }

  const GrupesSarasas = ({ grupes, busimas }) => (
    <div className="space-y-6">
      {Object.entries(grupes).sort(([a], [b]) => b.localeCompare(a)).map(([metai, menesiai]) => (
        <div key={metai}>
          <h3 className="font-display font-bold text-xl text-slate-700 mb-3">{metai}</h3>
          {Object.entries(menesiai).sort(([a], [b]) => b.localeCompare(a)).map(([menuo, sav]) => (
            <div key={menuo} className="mb-4">
              <h4 className="font-medium text-sm text-slate-400 uppercase tracking-wide mb-2">
                {menesioVardas(menuo)}
              </h4>
              <div className="space-y-2">
                {sav.sort((a, b) => {
                  const da = a.renginiai?.data || a.data || ''
                  const db = b.renginiai?.data || b.data || ''
                  return db.localeCompare(da)
                }).map(s => (
                  <RenginysCard key={s.id} s={s} busimas={busimas} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )

  const busimuGrupes = gruopuoti(busimosSav)
  const ivykdytuGrupes = gruopuoti(ivykdytosSav)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Mano savanorystės</h1>
        <p className="text-slate-500 mt-1">{savanorystes.length} iš viso</p>
      </div>

      {savanorystes.length === 0 ? (
        <div className="card text-center text-slate-400 py-16">
          Dar nėra savanorysčių – registruokis į renginius!
        </div>
      ) : (
        <div className="space-y-10">
          {busimosSav.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-lg text-slate-700 mb-4">⏳ Laukiami renginiai</h2>
              <GrupesSarasas grupes={busimuGrupes} busimas={true} />
            </div>
          )}
          {ivykdytosSav.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-lg text-slate-700 mb-4">✅ Įvykdytos savanorystės</h2>
              <GrupesSarasas grupes={ivykdytuGrupes} busimas={false} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}