import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard, Users, ClipboardList, Calendar,
  BarChart2, LogOut, ChevronRight, BookCheck
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Apžvalga' },
  { to: '/savanoriai',   icon: Users,            label: 'Savanoriai' },
  { to: '/savanorystes', icon: ClipboardList,    label: 'Savanorystės' },
  { to: '/renginiai',    icon: Calendar,         label: 'Renginiai' },
  { to: '/rezervacijos', icon: BookCheck,        label: 'Rezervacijos' },
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
            <svg viewBox="0 0 100 130" width="20" height="20" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M50,5 L58,25 L50,35 L42,25 Z"/>
              <path d="M50,35 C50,35 50,55 50,65"/>
              <path d="M50,45 C35,38 15,40 8,55 C3,67 12,78 25,72 C35,68 44,58 50,45"/>
              <path d="M50,45 C65,38 85,40 92,55 C97,67 88,78 75,72 C65,68 56,58 50,45"/>
              <path d="M50,45 C42,50 35,62 32,75"/>
              <path d="M50,45 C58,50 65,62 68,75"/>
              <rect x="35" y="75" width="30" height="5" rx="2"/>
              <rect x="37" y="82" width="26" height="5" rx="2"/>
              <path d="M43,87 C38,90 30,98 32,108 C33,115 40,112 44,105"/>
              <path d="M57,87 C62,90 70,98 68,108 C67,115 60,112 56,105"/>
              <path d="M44,87 L50,115 L56,87"/>
              <path d="M47,115 L44,125 L50,120 L56,125 L53,115"/>
            </svg>
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