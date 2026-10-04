import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const TEMOS = [
  { id: 'slyvine', pavadinimas: 'Slyvinė', spalva: '#963d86' },
  { id: 'violetine', pavadinimas: 'Violetinė', spalva: '#9333ea' },
  { id: 'melyna', pavadinimas: 'Mėlyna', spalva: '#2563eb' },
  { id: 'zalia', pavadinimas: 'Žalia', spalva: '#16a34a' },
  { id: 'rozine', pavadinimas: 'Rožinė', spalva: '#e11d48' },
  { id: 'oranzine', pavadinimas: 'Oranžinė', spalva: '#d97706' },
  { id: 'sviesiai-melyna', pavadinimas: 'Šviesiai mėlyna', spalva: '#269bd5' },
  { id: 'geltona', pavadinimas: 'Geltona', spalva: '#ffc800' },
]

function pritaikytiTema(tema) {
  document.documentElement.dataset.theme = tema
  try { localStorage.setItem('tema', tema) } catch {}
}

export default function TemosPasirinkimas() {
  const { user } = useAuth()
  const [tema, setTema] = useState(() => {
    try { return localStorage.getItem('tema') || 'slyvine' } catch { return 'slyvine' }
  })

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('tema')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.tema) {
          setTema(data.tema)
          pritaikytiTema(data.tema)
        }
      })
  }, [user])

  const pakeisti = async (id) => {
    setTema(id)
    pritaikytiTema(id)
    await supabase.from('profiles').update({ tema: id }).eq('id', user.id)
  }

  return (
    <div className="px-4 mb-3">
      <p className="text-xs text-slate-400 mb-2">Spalva</p>
      <div className="flex gap-2">
        {TEMOS.map(t => (
          <button
            key={t.id}
            title={t.pavadinimas}
            onClick={() => pakeisti(t.id)}
            className={`w-6 h-6 rounded-full transition-transform ${
              tema === t.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'
            }`}
            style={{ backgroundColor: t.spalva }}
          />
        ))}
      </div>
    </div>
  )
}