import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

async function fetchRoleWithTimeout(userId) {
  try {
    const result = await Promise.race([
      supabase.from('profiles').select('role').eq('id', userId).single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ])
    return result.data?.role || 'mentorius'
  } catch {
    return 'mentorius'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const r = await fetchRoleWithTimeout(session.user.id)
        setRole(r)
      } else {
        setRole(null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const r = await fetchRoleWithTimeout(session.user.id)
        setRole(r)
      } else {
        setRole(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)