import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { KeyRound } from 'lucide-react'

export default function PamirsauPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) { setError('Įvesk el. paštą'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/naujas-slaptazodis`,
    })
    setLoading(false)
    if (error) {
      setError(error.message.toLowerCase().includes('rate limit')
        ? 'Per daug bandymų. Pabandyk po valandos.'
        : 'Nepavyko išsiųsti laiško. Bandyk dar kartą.')
      return
    }
    setDone(true)
  }

  return (
    <div className="min-h-dvh flex items-start justify-center bg-slate-50 p-4 py-10">
      <div className="card max-w-sm w-full">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="text-brand-600" size={22} />
          <h1 className="font-display font-bold text-xl text-slate-800">Slaptažodžio atkūrimas</h1>
        </div>

        {done ? (
          <>
            <p className="text-slate-600 text-sm mb-4">
              Jei toks el. paštas užregistruotas, į jį išsiuntėme nuorodą slaptažodžiui pakeisti. Patikrink ir Spam aplanką.
            </p>
            <Link to="/login" className="btn-primary w-full justify-center">Grįžti į prisijungimą</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-slate-500 mb-4">Įvesk el. paštą, kuriuo registravaisi, ir atsiųsime nuorodą naujam slaptažodžiui.</p>
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            <label className="label">El. paštas</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-5">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Siųsti nuorodą'}
            </button>
            <p className="text-center text-sm text-slate-500 mt-4">
              <Link to="/login" className="text-brand-600 font-medium">Grįžti į prisijungimą</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}