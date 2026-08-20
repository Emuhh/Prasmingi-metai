import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(false)

  const signIn = async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.data?.user) {
      setUser(result.data.user)
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', result.data.user.id)
        .single()
      setRole(data?.role || 'savanoris')
    }
    return result
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password })

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)