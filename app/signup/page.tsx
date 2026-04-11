'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('url')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create account')
        return
      }

      // Automatically sign in after signup
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError('Account created but sign in failed. Please log in manually.')
        router.push('/login')
        return
      }

      // Redirect appropriately
      if (redirectUrl) {
        router.push(
          `/dashboard/scan/new?url=${encodeURIComponent(redirectUrl)}`
        )
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-accent-cyan flex items-center justify-center">
              <span className="text-bg-primary font-bold font-syne text-lg">P</span>
            </div>
            <span className="font-syne font-bold text-2xl text-text-primary">
              Pixel<span className="text-accent-cyan">Proof</span>
            </span>
          </Link>
          <p className="text-text-secondary mt-2 text-sm">AI Cross-Device Testing Monitor</p>
        </div>

        <div className="card">
          <h1 className="text-2xl font-syne font-bold text-text-primary mb-1">
            Create your account
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            Start scanning your site across 10 devices with AI
          </p>

          {redirectUrl && (
            <div className="bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg px-4 py-3 mb-4">
              <p className="text-accent-cyan text-sm">
                <span className="font-medium">Ready to scan:</span>{' '}
                <span className="monospace text-xs">{redirectUrl}</span>
              </p>
            </div>
          )}

          {error && (
            <div className="bg-status-error/10 border border-status-error/30 text-status-error rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="label">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
                placeholder="Alex Johnson"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password{' '}
                <span className="text-text-muted">(min. 8 characters)</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="input-field"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Free Account'
              )}
            </button>
          </form>

          <p className="text-text-muted text-xs mt-4 text-center">
            By creating an account, you agree to our Terms of Service.
          </p>

          <div className="mt-4 text-center border-t border-border pt-4">
            <p className="text-text-secondary text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-accent-cyan hover:text-accent-cyan-dark transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          <Link href="/" className="hover:text-text-secondary transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
