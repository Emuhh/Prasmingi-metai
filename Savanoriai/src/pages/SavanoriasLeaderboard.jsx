import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Trophy, Clock, Sparkles } from 'lucide-react'

export default function SavanoriasLeaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [manoInfo, setManoInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rodoVisus, setRodoVisus] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('savanoris_id')
        .eq('id', user.id)
        .single()

      const { data: savs } = await supabase
        .from('savanorystes')
        .select('savanoris_id, valandos')
        .not('renginys_id', 'is', null)
        .not('savanoris_id', 'is', null)
        .gt('valandos', 0)

      if (!savs) { setLoading(false); return }

      const savMap = {}
      savs.forEach(s => {
        if (!savMap[s.savanoris_id]) savMap[s.savanoris_id] = { savanorystes: 0, valandos: 0 }
        savMap[s.savanoris_id].savanorystes += 1
        savMap[s.savanoris_id].valandos += s.valandos || 0
      })

      const sorted = Object.entries(savMap)
        .sort(([, a], [, b]) =>
          b.savanorystes !== a.savanorystes ? b.savanorystes - a.savanorystes : b.valandos - a.valandos
        )
        .map(([id, stats], index) => ({ id, ...stats, vieta: index + 1 }))

      setLeaderboard(sorted)
      if (profile?.savanoris_id) {
        setManoInfo(sorted.find(s => s.id === profile.savanoris_id) || null)
      }
      setLoading(false)
    }
    load()
  }, [user?.id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const top3 = leaderboard.slice(0, 3)
  const kiti = leaderboard.slice(3)
  const rodomi = rodoVisus ? kiti : kiti.slice(0, 7)
  const max = leaderboard[0]?.savanorystes || 1

  const pakyla = [
    { s: top3[1], medalis: '🥈', aukstis: 'h-24', spalva: 'bg-slate-100' },
    { s: top3[0], medalis: '🥇', aukstis: 'h-32', spalva: 'bg-brand-100' },
    { s: top3[2], medalis: '🥉', aukstis: 'h-16', spalva: 'bg-amber-50' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-slate-800">Lyderiai</h1>
        <p className="text-slate-500 mt-1">Aktyviausi savanoriai</p>
      </div>

      {/* Mano vieta */}
      {manoInfo ? (
        <div className="card bg-gradient-to-r from-brand-600 to-brand-500 border-0 text-white mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/80 mb-1">Tavo vieta</p>
              <p className="font-display font-bold text-5xl">#{manoInfo.vieta}</p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-sm text-white/80">Savanorystės</p>
                <p className="font-display font-bold text-3xl">{manoInfo.savanorystes}</p>
              </div>
              <div>
                <p className="text-sm text-white/80">Valandos</p>
                <p className="font-display font-bold text-3xl">{manoInfo.valandos}h</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 flex-shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Tavo vieta lentelėje dar laukia!</p>
            <p className="text-sm text-slate-500">Užsiregistruok į renginį, ir po pirmos savanorystės atsirasi čia.</p>
          </div>
        </div>
      )}

      {leaderboard.length === 0 ? (
        <div className="card text-center text-slate-400 py-16">Lyderių dar nėra</div>
      ) : (
        <>
          {/* Pakyla */}
          <div className="card mb-6">
            <div className="grid grid-cols-3 gap-3 items-end">
              {pakyla.map(({ s, medalis, aukstis, spalva }, i) => (
                <div key={i} className="flex flex-col items-center">
                  {s ? (
                    <>
                      <span className="text-4xl mb-2">{medalis}</span>
                      <p className={`text-sm font-semibold mb-1 ${manoInfo?.id === s.id ? 'text-brand-700' : 'text-slate-700'}`}>
                        {manoInfo?.id === s.id ? 'Tu 👈' : `Savanoris #${s.vieta}`}
                      </p>
                      <p className="text-xs text-slate-500 mb-2">{s.savanorystes} sav. · {s.valandos}h</p>
                      <div className={`w-full ${aukstis} ${spalva} rounded-t-xl flex items-start justify-center pt-2`}>
                        <span className="font-display font-bold text-2xl text-slate-400">{s.vieta}</span>
                      </div>
                    </>
                  ) : (
                    <div className={`w-full ${aukstis} bg-slate-50 rounded-t-xl`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Kiti */}
          {kiti.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="divide-y divide-slate-50">
                {rodomi.map(s => {
                  const isMano = manoInfo?.id === s.id
                  return (
                    <div key={s.id} className={`flex items-center gap-4 px-6 py-3 ${isMano ? 'bg-brand-50' : ''}`}>
                      <span className="w-8 text-center text-sm font-bold text-slate-400">#{s.vieta}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={isMano ? 'font-semibold text-brand-700' : 'text-slate-600'}>
                            {isMano ? 'Tu 👈' : `Savanoris #${s.vieta}`}
                          </span>
                          <span className="flex items-center gap-3 text-slate-500">
                            <span className="flex items-center gap-1"><Clock size={12} /> {s.valandos}h</span>
                            <span className={`font-semibold ${isMano ? 'text-brand-700' : 'text-slate-700'}`}>{s.savanorystes} sav.</span>
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full">
                          <div className="h-full bg-brand-400 rounded-full" style={{ width: `${(s.savanorystes / max) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {kiti.length > 7 && (
                <button
                  onClick={() => setRodoVisus(!rodoVisus)}
                  className="w-full py-3 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors border-t border-slate-100"
                >
                  {rodoVisus ? '▲ Rodyti mažiau' : `▼ Rodyti visus (${leaderboard.length})`}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}