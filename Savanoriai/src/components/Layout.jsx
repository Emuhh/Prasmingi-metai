import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Users, ClipboardList, Calendar,
  BarChart2, LogOut, Heart
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Apžvalga' },
  { to: '/savanoriai',   icon: Users,            label: 'Savanoriai' },
  { to: '/savanorystes', icon: ClipboardList,    label: 'Savanorystės' },
  { to: '/renginiai',    icon: Calendar,         label: 'Renginiai' },
  { to: '/statistika',   icon: BarChart2,        label: 'Statistika' },
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Šoninė navigacija - tik desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-100 flex-col fixed inset-y-0 z-10">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-800">Savanoriai</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={isActive ? 'text-brand-600' : 'text-slate-400'} size={18} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="px-4 py-2 mb-1">
            <p className="text-xs text-slate-400">Prisijungęs</p>
            <p className="text-sm font-medium text-slate-700 truncate">{user?.email}</p>
          </div>
          <button onClick={handleSignOut} className="btn-danger w-full justify-center text-sm">
            <LogOut size={15} /> Atsijungti
          </button>
        </div>
      </aside>

      {/* Pagrindinis turinys */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Apatinė navigacija - tik mobilus */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-10">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-brand-600' : 'text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                  <span className="text-xs font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-slate-400"
          >
            <LogOut size={20} />
            <span className="text-xs font-medium">Išeiti</span>
          </button>
        </div>
      </nav>
    </div>
  )
}