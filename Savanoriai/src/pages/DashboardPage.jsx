import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Users, Clock, Calendar, TrendingUp, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { lt } from 'date-fns/locale'

function StatCard({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to} className="card hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="font-display font-bold text-3xl text-slate-800">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4 text-sm text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Peržiūrėti <ArrowRight size={14} />
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ savanoriai: 0, valandos: 0, renginiai: 0, savanorystes: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: savCount },
        { data: savData },
        { count: renCount },
        { count: savorysteCount },
      ] = await Promise.all([
        supabase.from('savanoriai').select('*', { count: 'exact', head: true }),
        supabase.from('savanorystes').select('valandos'),
        supabase.from('renginiai').select('*', { count: 'exact', head: true }),
        supabase.from('savanorystes').select('*', { count: 'exact', head: true }),
      ])
      const totalValandos = savData?.reduce((sum, r) => sum + (r.valandos || 0), 0) || 0
      const { data: recent } = await supabase
        .from('savanorystes')
        .select('*, savanoriai(vardas, pavarde), renginiai(pavadinimas)')
        .order('data', { ascending: false })
        .limit(5)
      setStats({ savanoriai: savCount || 0, valandos: totalValandos, renginiai: renCount || 0, savanorystes: savorysteCount || 0 })
      setRecentActivity(recent || [])
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
        <h1 className="font-display font-bold text-3xl text-slate-800">Apžvalga</h1>
        <p className="text-slate-500 mt-1">{format(new Date(), "yyyy 'm.' MMMM d 'd.'", { locale: lt })}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Savanoriai" value={stats.savanoriai} color="bg-brand-500" to="/savanoriai" />
        <StatCard icon={Clock} label="Valandos iš viso" value={stats.valandos} color="bg-blue-500" to="/statistika" />
        <StatCard icon={Calendar} label="Renginiai" value={stats.renginiai} color="bg-amber-500" to="/renginiai" />
        <StatCard icon={TrendingUp} label="Savanorystės" value={stats.savanorystes} color="bg-purple-500" to="/savanorystes" />
      </div>
      <div className="card">
        <h2 className="font-display font-semibold text-lg text-slate-800 mb-4">Paskutinė veikla</h2>
        {recentActivity.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">Dar nėra įrašų</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((r) => (
              <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                  {r.savanoriai?.vardas?.[0]}{r.savanoriai?.pavarde?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{r.savanoriai?.vardas} {r.savanoriai?.pavarde}</p>
                  <p className="text-xs text-slate-400 truncate">{r.renginiai?.pavadinimas}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-brand-600">{r.valandos}h</p>
                  <p className="text-xs text-slate-400">{r.data}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}