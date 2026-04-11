'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { clsx } from 'clsx'

interface DashboardNavProps {
  user: {
    name?: string | null
    email?: string | null
    id?: string
  }
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', exact: true },
    { href: '/dashboard/scan/new', label: 'New Scan', exact: false },
  ]

  return (
    <nav className="border-b border-border bg-bg-primary/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-accent-cyan flex items-center justify-center">
                <span className="text-bg-primary font-bold text-sm font-syne">P</span>
              </div>
              <span className="font-syne font-bold text-lg text-text-primary">
                Pixel<span className="text-accent-cyan">Proof</span>
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-accent-cyan/10 text-accent-cyan'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-text-primary text-sm font-medium">{user.name}</p>
              <p className="text-text-muted text-xs">{user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="btn-ghost text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
