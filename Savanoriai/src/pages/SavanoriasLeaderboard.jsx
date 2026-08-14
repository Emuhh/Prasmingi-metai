import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Trophy } from 'lucide-react'

export default function SavanoriasLeaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [manoVieta, setManoVieta] = useState(null)
  const [manoInfo, setManoInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Gauti profilio savanoris_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('savanoris_id')
        .eq('id', user.id)
        .single()

      const { data: savs } = await supabase
        .from('savanorystes')
        .select('savanoris_id, valandos')

      if (!savs) { setLoading(false); return }

      // Suskaičiuoti savanorystes
      const savMap = {}
      savs.forEach(s => {
        if (!savMap[s.savanoris_id]) savMap[s.savanoris_id] = { savanorystes: 0, valandos: 0 }
        savMap[s.savanoris_id].savanorystes += 1
        savMap[s.savanoris_id].valandos += s.valandos || 0
      })

      const sorted = Object.entries(savMap)
        .sort(([, a], [, b]) => b.savanorystes - a.savanorystes)
        .map(([id, stats], index) => ({ id, ...stats, vieta: index + 1 }))

      setLeaderboard(sorted)

      // Rasti mano vietą
      if (profile?.savanoris_id) {
        const mano = sorted.find(s => s.id === profile.savanoris_id)
        if (mano) {
          setManoVieta(mano.vieta)
          setManoInfo(mano)
        }
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

  const medaliai = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Lyderiai</h1>
        <p className="text-slate-500 mt-1">Savanorysčių skaičius</p>
      </div>

      {/* Mano vieta */}
      {manoInfo && (
        <div className="card bg-brand-50 border-brand-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-600 font-medium mb-1">Mano vieta</p>
              <p className="font-display font-bold text-4xl text-brand-700">#{manoVieta}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Savanorystės</p>
              <p className="font-display font-bold text-3xl text-slate-800">{manoInfo.savanorystes}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Valandos</p>
              <p className="font-display font-bold text-3xl text-slate-800">{manoInfo.valandos}h</p>
            </div>
            <Trophy className="text-brand-400 w-12 h-12" />
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-lg text-slate-800">Visos vietos</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {leaderboard.map((s) => {
            const isMano = manoInfo && s.id === manoInfo.id
            return (
              <div
                key={s.id}
                className={`flex items-center gap-4 px-6 py-3 ${isMano ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
              >
                <div className="w-8 text-center">
                  {s.vieta <= 3
                    ? <span className="text-xl">{medaliai[s.vieta - 1]}</span>
                    : <span className="text-sm font-bold text-slate-400">#{s.vieta}</span>
                  }
                </div>
                <div className="flex-1">
                  {isMano
                    ? <span className="font-semibold text-brand-700">Tu 👈</span>
                    : <span className="text-slate-500 text-sm">Savanoris #{s.vieta}</span>
                  }
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${isMano ? 'text-brand-700' : 'text-slate-700'}`}>
                    {s.savanorystes} sav.
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}