import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { UserPlus } from 'lucide-react'

export default function RegistracijaPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ vardas: '', pavarde: '', el_pastas: '', slaptazodis: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [showPasswordHint, setShowPasswordHint] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.vardas || !form.pavarde || !form.el_pastas || !form.slaptazodis) {
      setError('Užpildykite visus laukus')
      return
    }
    if (form.slaptazodis.length < 8) {
      setError('Slaptažodis turi būti bent 8 simbolių')
      return
    }
    if (!/\d/.test(form.slaptazodis)) {
      setError('Slaptažodis turi turėti bent vieną skaičių')
      return
    }
    if (!/[^A-Za-z0-9]/.test(form.slaptazodis)) {
      setError('Slaptažodis turi turėti bent vieną simbolį (pvz. !@#$%)')
      return
    }
    setLoading(true)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.el_pastas,
      password: form.slaptazodis,
      options: { data: { vardas: form.vardas, pavarde: form.pavarde } }
    })
    setLoading(false)
    if (signUpError) {
      setError(signUpError.message === 'User already registered' ? 'Toks el. paštas jau užregistruotas' : signUpError.message)
      return
    }
    if (signUpData?.user && signUpData.user.identities?.length === 0) {
      setError('Toks el. paštas jau užregistruotas')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="card max-w-sm text-center">
          <h1 className="font-display font-bold text-xl text-slate-800 mb-2">Registracija sėkminga!</h1>
          <p className="text-slate-500 text-sm mb-4">Patikrink savo el. paštą — gali reikėti patvirtinti paskyrą prieš prisijungiant.</p>
          <Link to="/login" className="btn-primary w-full justify-center">Prisijungti</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-50 p-4 py-10 overflow-y-auto">
      <form onSubmit={handleSubmit} className="card max-w-sm w-full">
        <div className="flex items-center gap-2 mb-5">
          <UserPlus className="text-brand-600" size={22} />
          <h1 className="font-display font-bold text-xl text-slate-800">Savanorio registracija</h1>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Vardas</label>
              <input className="input" value={form.vardas} onChange={e => setForm({ ...form, vardas: e.target.value })} />
            </div>
            <div>
              <label className="label">Pavardė</label>
              <input className="input" value={form.pavarde} onChange={e => setForm({ ...form, pavarde: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">El. paštas</label>
            <input className="input" type="email" value={form.el_pastas} onChange={e => setForm({ ...form, el_pastas: e.target.value })} />
          </div>
          <div>
            <label className="label">Slaptažodis</label>
            <input
              className="input"
              type="password"
              value={form.slaptazodis}
              onChange={e => setForm({ ...form, slaptazodis: e.target.value })}
              onFocus={() => setShowPasswordHint(true)}
              onBlur={() => setShowPasswordHint(false)}
            />
            {showPasswordHint && (
              <>
                <p className="text-xs text-slate-400 mt-1.5">Bent 8 simboliai, bent 1 skaičius ir 1 simbolis (!@#$ ir pan.)</p>
                <p className="text-xs text-amber-600 font-medium mt-1">⚠️ Nepamiršk šio slaptažodžio — vėliau jo atkurti nebus galima!</p>
              </>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-5">
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Registruotis'}
        </button>

        <p className="text-center text-sm text-slate-500 mt-4">
          Jau turi paskyrą? <Link to="/login" className="text-brand-600 font-medium">Prisijungti</Link>
        </p>
      </form>
    </div>
  )
}