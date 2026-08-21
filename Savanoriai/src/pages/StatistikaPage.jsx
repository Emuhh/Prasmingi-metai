import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#16a34a','#2563eb','#d97706','#9333ea','#dc2626','#0891b2','#be185d','#7c3aed']

export default function StatistikaPage() {
  const [data, setData] = useState({ topSavanoriai: [], byMonth: [], byMentorius: [], byOrg: [], totals: {} })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('savanoriai')

  useEffect(() => {
    async function load() {
      const [{ data: savs }, { data: sav_info }, { data: renginiai }] = await Promise.all([
        supabase.from('savanorystes').select('*, savanoriai(vardas, pavarde, mentorius), renginiai(pavadinimas, vieta)'),
        supabase.from('savanoriai').select('id, vardas, pavarde, mentorius'),
        supabase.from('renginiai').select('id, pavadinimas, vieta, data, reik_savanoriu, savanorystes(valandos)'),
      ])

      if (!savs) { setLoading(false); return }

      // Top savanoriai - rikiuojami pagal savanorystes, o lygiose - pagal valandas
      const savMap = {}
      savs.forEach(s => {
        const key = s.savanoris_id
        if (!savMap[key]) savMap[key] = { name: `${s.savanoriai?.vardas} ${s.savanoriai?.pavarde}`, savanorystes: 0, valandos: 0 }
        savMap[key].savanorystes += 1
        savMap[key].valandos += s.valandos || 0
      })
      const topSavanoriai = Object.values(savMap).sort((a, b) =>
        b.savanorystes !== a.savanorystes
          ? b.savanorystes - a.savanorystes
          : b.valandos - a.valandos
      ).slice(0, 10)

      // Pagal mėnesį
      const monthMap = {}
      savs.forEach(s => {
        if (!s.data) return
        const month = s.data.slice(0, 7)
        if (!monthMap[month]) monthMap[month] = { month, savanorystes: 0, valandos: 0 }
        monthMap[month].savanorystes += 1
        monthMap[month].valandos += s.valandos || 0
      })
      const byMonth = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-12)

      // Pagal mentorių
      const mentMap = {}
      savs.forEach(s => {
        const key = s.savanoriai?.mentorius || 'Nenurodyta'
        if (!mentMap[key]) mentMap[key] = { name: key, savanorystes: 0, savanoriai: new Set() }
        mentMap[key].savanorystes += 1
        mentMap[key].savanoriai.add(s.savanoris_id)
      })
      const byMentorius = Object.values(mentMap).map(m => ({ ...m, savanoriai: m.savanoriai.size })).sort((a, b) => b.savanorystes - a.savanorystes)

      // Pagal organizaciją
      const orgMap = {}
      renginiai?.forEach(r => {
        const org = r.vieta || 'Nenurodyta'
        if (!orgMap[org]) orgMap[org] = {
          name: org,
          renginiai: 0,
          savanorystes: 0,
          valandos: 0,
          reik_savanoriu_metai: 0,
          byMonth: {}
        }
        orgMap[org].renginiai += 1
        orgMap[org].reik_savanoriu_metai += r.reik_savanoriu || 0
        const savs_org = r.savanorystes || []
        orgMap[org].savanorystes += savs_org.length
        orgMap[org].valandos += savs_org.reduce((s, x) => s + (x.valandos || 0), 0)
        if (r.data) {
          const menuo = r.data.slice(0, 7)
          if (!orgMap[org].byMonth[menuo]) orgMap[org].byMonth[menuo] = { savanorystes: 0, valandos: 0, reik_savanoriu: 0 }
          orgMap[org].byMonth[menuo].savanorystes += savs_org.length
          orgMap[org].byMonth[menuo].valandos += savs_org.reduce((s, x) => s + (x.valandos || 0), 0)
          orgMap[org].byMonth[menuo].reik_savanoriu += r.reik_savanoriu || 0
        }
      })
      const byOrg = Object.values(orgMap).sort((a, b) => b.savanorystes - a.savanorystes)

      const totalValandos = savs.reduce((s, r) => s + (r.valandos || 0), 0)
      setData({ topSavanoriai, byMonth, byMentorius, byOrg, totals: { valandos: totalValandos, irasu: savs.length, savanoriai: sav_info?.length || 0 } })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const tabs = [
    { id: 'savanoriai', label: 'Savanoriai' },
    { id: 'organizacijos', label: 'Organizacijos' },
    { id: 'mentorius', label: 'Mentoriai' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-slate-800">Statistika</h1>
        <p className="text-slate-500 mt-1">Savanorystės apžvalga</p>
      </div>

      {/* Bendri skaičiai */}
      <div className="grid grid-cols-3 gap-4 mb-6">
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === t.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Savanoriai tab */}
      {activeTab === 'savanoriai' && (
        <div className="space-y-6">
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
                          <span className="text-brand-600 font-semibold">{s.savanorystes} sav. · {s.valandos}h</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(s.savanorystes / max) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Organizacijos tab */}
      {activeTab === 'organizacijos' && (
        <div className="space-y-6">
          {data.byOrg.length === 0 ? (
            <div className="card text-center text-slate-400 py-12">Duomenų nėra</div>
          ) : (
            <>
              {/* Skritulinė diagrama */}
              <div className="card">
                <h2 className="font-display font-semibold text-lg text-slate-800 mb-4">Savanorystės pagal organizaciją</h2>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="40%" height={220}>
                    <PieChart>
                      <Pie data={data.byOrg} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="savanorystes" paddingAngle={3}>
                        {data.byOrg.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v) => [v, 'Savanorystės']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {data.byOrg.map((org, i) => (
                      <div key={org.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-600 truncate flex-1">{org.name}</span>
                        <span className="font-medium text-slate-800">{org.savanorystes} sav.</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kiekvienos organizacijos detalės */}
              {data.byOrg.map(org => (
                <div key={org.name} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="font-display font-semibold text-lg text-slate-800">{org.name}</h2>
                    <div className="flex gap-4 text-right">
                      <div>
                        <p className="text-xs text-slate-400">Renginiai</p>
                        <p className="font-bold text-slate-800">{org.renginiai}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Savanorystės</p>
                        <p className="font-bold text-brand-600">{org.savanorystes}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Valandos</p>
                        <p className="font-bold text-slate-800">{org.valandos}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Reikėjo sav.</p>
                        <p className="font-bold text-slate-800">{org.reik_savanoriu_metai}</p>
                      </div>
                    </div>
                  </div>
                  {Object.keys(org.byMonth).length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left font-medium text-slate-500 py-2">Data</th>
                            <th className="text-right font-medium text-slate-500 py-2">Savanorystės</th>
                            <th className="text-right font-medium text-slate-500 py-2">Valandos</th>
                            <th className="text-right font-medium text-slate-500 py-2">Reikėjo sav.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(org.byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, stats]) => (
                            <tr key={month} className="border-b border-slate-50 hover:bg-slate-50">
                              <td className="py-2 text-slate-600">{month}</td>
                              <td className="py-2 text-right font-medium text-brand-600">{stats.savanorystes}</td>
                              <td className="py-2 text-right text-slate-600">{stats.valandos}h</td>
                              <td className="py-2 text-right text-slate-600">{stats.reik_savanoriu}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Mentoriai tab */}
      {activeTab === 'mentorius' && (
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-slate-800 mb-4">Savanorystės pagal mentorių</h2>
          {data.byMentorius.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Duomenų nėra</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left font-medium text-slate-500 py-2">Mentorius</th>
                    <th className="text-right font-medium text-slate-500 py-2">Savanoriai</th>
                    <th className="text-right font-medium text-slate-500 py-2">Savanorystės</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byMentorius.map(m => (
                    <tr key={m.name} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-800">{m.name}</td>
                      <td className="py-2 text-right text-slate-600">{m.savanoriai}</td>
                      <td className="py-2 text-right font-medium text-brand-600">{m.savanorystes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}