import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { BrandLogo } from '../components/ui/BrandLogo'

type AuthTab = 'signin' | 'register'

export function Login() {
  const [tab, setTab] = useState<AuthTab>('signin')
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    if (tab === 'signin') {
      const result = login(email, password)
      if (!result.ok) {
        setError(result.error ?? 'Unable to sign in.')
        return
      }
      const loggedInUser = useAuthStore.getState().currentUser
      navigate(
        loggedInUser?.role === 'admin'
          ? '/admin'
          : (redirect || '/catalog'),
        { replace: true },
      )
      return
    }

    const result = register(
      String(form.get('name') ?? ''),
      email,
      String(form.get('phone') ?? ''),
      password,
    )
    if (!result.ok) {
      setError(result.error ?? 'Unable to create account.')
      return
    }
    navigate(redirect || '/catalog', { replace: true })
  }

  const quickFill = (role: 'customer' | 'admin') => {
    setCredentials({
      email: role === 'admin' ? 'admin@jeswelry.ph' : 'client@jeswelry.ph',
      password: role === 'admin' ? 'admin123' : 'client123',
    })
  }

  return (
    <main className="min-h-[70vh] bg-[#F4EFE7] px-5 py-16 md:py-24">
      <div className="mx-auto max-w-lg border border-stone-300 bg-ivory px-6 py-8 shadow-[0_18px_50px_rgba(59,49,38,.08)] md:px-10 md:py-10">
        <BrandLogo size="lg" className="mx-auto" />
        <h1 className="mt-3 text-center font-heading text-5xl text-charcoal">
          {tab === 'signin' ? 'Welcome Back' : 'Create Your Account'}
        </h1>

        <form id="auth-form" onSubmit={submit} className="mt-7 space-y-4">
          {tab === 'register' && (
            <>
              <label className="block text-xs font-medium text-charcoal">
                Full Name
                <input name="name" required className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-champagne" />
              </label>
            </>
          )}
          <label className="block text-xs font-medium text-charcoal">
            Email Address
            <input name="email" required type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-champagne" />
          </label>
          {tab === 'register' && (
            <label className="block text-xs font-medium text-charcoal">
              Mobile Number
              <input name="phone" required type="tel" className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-champagne" />
            </label>
          )}
          <label className="block text-xs font-medium text-charcoal">
            Password
            <input name="password" required type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} minLength={tab === 'register' ? 6 : undefined} className="mt-2 w-full border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-champagne" />
          </label>
          {error && <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-charcoal px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all duration-200 hover:bg-[#A68246] hover:text-[#181615] active:scale-[0.98]">
            {tab === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-stone-500">
          {tab === 'signin' ? "Don't have an account?" : 'Already have an account?'}
          <button
            type="button"
            onClick={() => { setTab(tab === 'signin' ? 'register' : 'signin'); setError(''); setCredentials({ email: '', password: '' }) }}
            className="ml-1 font-semibold text-champagne hover:text-charcoal"
          >
            {tab === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {tab === 'signin' && (
          <div className="mt-7 border-t border-stone-200 pt-5">
            <p className="text-center text-[10px] uppercase tracking-[0.12em] text-stone-500">Quick Fill Demo Credentials</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => quickFill('customer')} className="border border-stone-300 px-3 py-2.5 text-xs text-charcoal hover:border-champagne">
                Demo Customer
              </button>
              <button type="button" onClick={() => quickFill('admin')} className="border border-stone-300 px-3 py-2.5 text-xs text-charcoal hover:border-champagne">
                Demo Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
