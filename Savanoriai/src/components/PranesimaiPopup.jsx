import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Check, X, Bell } from 'lucide-react'

export default function PranesimaiPopup() {
  const { user } = useAuth()
  const [pranesimai, setPranesimai] = useState([])

  useEffect(() => {
    if (!user) return
    let channel = null

    async function start() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('savanoris_id')
        .eq('id', user.id)
        .single()
      const savId = profile?.savanoris_id
      if (!savId) return

      const load = async () => {
        const { data } = await supabase
          .from('savanorystes')
          .select('id, statusas, renginiai(pavadinimas, data, laikas)')
          .eq('savanoris_id', savId)
          .eq('pranesta', false)
          .in('statusas', ['patvirtinta', 'atmesta'])
        setPranesimai(data || [])
      }

      await load()

      channel = supabase
        .channel(`pranesimai-${savId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'savanorystes', filter: `savanoris_id=eq.${savId}` },
          () => load()
        )
        .subscribe()
    }

    start()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [user])

  const uzdaryti = async () => {
    const ids = pranesimai.map(p => p.id)
    setPranesimai([])
    await supabase.from('savanorystes').update({ pranesta: true }).in('id', ids)
  }

  if (pranesimai.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
            <Bell size={20} />
          </div>
          <h2 className="font-display font-semibold text-lg text-slate-800">Naujienos apie tavo registracijas</h2>
        </div>

        <div className="space-y-2 mb-5 max-h-80 overflow-y-auto">
          {pranesimai.map(p => {
            const patvirtinta = p.statusas === 'patvirtinta'
            return (
              <div
                key={p.id}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 ${patvirtinta ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className={`mt-0.5 ${patvirtinta ? 'text-green-600' : 'text-red-500'}`}>
                  {patvirtinta ? <Check size={18} /> : <X size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800">{p.renginiai?.pavadinimas}</p>
                  <p className="text-xs text-slate-500">
                    {p.renginiai?.data}{p.renginiai?.laikas ? ` · ${p.renginiai.laikas}` : ''}
                  </p>
                  <p className={`text-sm font-medium mt-1 ${patvirtinta ? 'text-green-700' : 'text-red-600'}`}>
                    {patvirtinta ? 'Tavo registracija patvirtinta!' : 'Tavo registracija atmesta'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={uzdaryti} className="btn-primary w-full justify-center">
          Supratau
        </button>
      </div>
    </div>
  )
}