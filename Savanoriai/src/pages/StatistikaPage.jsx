import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#16a34a', '#2563eb', '#d97706', '#9333ea', '#dc2626', '#0891b2']

export default function StatistikaPage() {
  const [data, setData] = useState({ topSavanoriai: [], byMonth: [], byMentorius: [], totals: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: savs }, { data: sav_info }] = await Promise.all([
        supabase.from('savanorystes').select('*, savanoriai(vardas, pavarde, mentorius)'),
        supabase.from('savanoriai').select('id, vardas, pavarde, mentorius'),
      ])

      if (!savs) { setLoading(false); return }

      // Top savanoriai pagal savanorysčių skaičių
      const savMap = {}
      savs.forEach(s => {
        const key = s.savanoris_id
        if (!savMap[key]) savMap[key] = { name: `${s.savanoriai?.vardas} ${s.savanoriai?.pavarde}`, savanorystes: 0, valandos: 0 }
        savMap[key].savanorystes += 1
        savMap[key].valandos += s.valandos || 0
      })
      const topSavanoriai = Object.values(savMap).sort((a, b) => b.savanorystes - a.savanorystes).slice(0, 10)

      // Pagal mėnesį - savanorysčių skaičius
      const monthMap = {}
      savs.forEach(s => {
        if (!s.data) return
        const month = s.data.slice(0, 7)
        if (!monthMap[month]) monthMap[month] = { month, savanorystes: 0, valandos: 0 }
        monthMap[month].savanorystes += 1
        monthMap[month].valandos += s.valandos || 0
      })
      const byMonth = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)

      // Pagal mentorių - savanorysčių skaičius
      const mentMap = {}
      savs.forEach(s => {
        const key = s.savanoriai?.mentorius || 'Nenurodyta'
        if (!mentMap[key]) mentMap[key] = { name: key, savanorystes: 0, savanoriai: new Set() }
        mentMap[key].savanorystes += 1
        mentMap[key].savanoriai.add(s.savanoris_id)
      })
      const byMentorius = Object.values(mentMap).map(m => ({ ...m, savanoriai: m.savanoriai.size })).sort((a, b) => b.savanorystes - a.savanorystes)

      const totalValandos = savs.reduce((s, r) => s + (r.valandos || 0), 0)

      setData({ topSavanoriai, byMonth, byMentorius, totals: { valandos: totalValandos, irasu: savs.length, savanoriai: sav_info?.length || 0 } })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-slate-800">Statistika</h1>
        <p className="text-slate-500 mt-1">Savanorystės apžvalga</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Savanoriai iš viso', value: data.totals.savanoriai },
          { label: 'Savanorystės iš viso', value: data.totals.irasu },
          { label: 'Valandos iš viso', value: `${data.totals.valandos}h` },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <p className="font-display font-bold text-4xl text-brand-600">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pagal mėnesį */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-slate-800 mb-4">Savanorystės pagal mėnesį</h2>
          {data.byMonth.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Duomenų nėra</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.byMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="savanorystes" fill="#16a34a" radius={[4, 4, 0, 0]} name="Savanorystės" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pagal mentorių */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-slate-800 mb-4">Savanorystės pagal mentorių</h2>
          {data.byMentorius.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Duomenų nėra</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={data.byMentorius} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="savanorystes" paddingAngle={3}>
                    {data.byMentorius.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [v, 'Savanorystės']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {data.byMentorius.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600 truncate flex-1">{m.name}</span>
                    <span className="font-medium text-slate-800">{m.savanorystes}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top savanoriai */}
      <div className="card">
        <h2 className="font-display font-semibold text-lg text-slate-800 mb-4">Aktyviausi savanoriai</h2>
        {data.topSavanoriai.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Duomenų nėra</p>
        ) : (
          <div className="space-y-2">
            {data.topSavanoriai.map((s, i) => {
              const max = data.topSavanoriai[0].savanorystes
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right">{i + 1}</span>
                  <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0">
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-800">{s.name}</span>
                      <span className="text-brand-600 font-semibold">{s.savanorystes} sav.</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${(s.savanorystes / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}