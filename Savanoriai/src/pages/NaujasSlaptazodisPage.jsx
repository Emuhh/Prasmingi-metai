import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { KeyRound } from 'lucide-react'

export default function NaujasSlaptazodisPage() {
  const [pass, setPass] = useState('')
  const [pass2, setPass2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (pass.length < 8) { setError('Slaptažodis turi būti bent 8 simbolių'); return }
    if (!/\d/.test(pass)) { setError('Slaptažodis turi turėti bent vieną skaičių'); return }
    if (!/[^A-Za-z0-9]/.test(pass)) { setError('Slaptažodis turi turėti bent vieną simbolį (pvz. !@#$%)'); return }
    if (pass !== pass2) { setError('Slaptažodžiai nesutampa'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: pass })
    setLoading(false)
    if (error) {
      setError('Nuoroda nebegalioja arba jau panaudota. Paprašyk naujos nuorodos.')
      return
    }
    await supabase.auth.signOut()
    setDone(true)
  }

  return (
    <div className="min-h-dvh flex items-start justify-center bg-slate-50 p-4 py-10">
      <div className="card max-w-sm w-full">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="text-brand-600" size={22} />
          <h1 className="font-display font-bold text-xl text-slate-800">Naujas slaptažodis</h1>
        </div>

        {done ? (
          <>
            <p className="text-slate-600 text-sm mb-4">Slaptažodis pakeistas! Dabar gali prisijungti su nauju slaptažodžiu.</p>
            <Link to="/login" className="btn-primary w-full justify-center">Prisijungti</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div>
              <label className="label">Naujas slaptažodis</label>
              <input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)} />
              <p className="text-xs text-slate-400 mt-1.5">Bent 8 simboliai, bent 1 skaičius ir 1 simbolis (!@#$ ir pan.)</p>
            </div>
            <div>
              <label className="label">Pakartok slaptažodį</label>
              <input className="input" type="password" value={pass2} onChange={e => setPass2(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Išsaugoti'}
            </button>
            {error && (
              <p className="text-center text-sm mt-2">
                <Link to="/pamirsau" className="text-brand-600 font-medium">Gauti naują nuorodą</Link>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}