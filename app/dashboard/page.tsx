import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = (session.user as any).id

  const [projects, recentScans] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      include: {
        _count: { select: { scans: true } },
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.scan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        project: true,
        _count: { select: { results: true } },
      },
    }),
  ])

  const statusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-status-success'
      case 'running': return 'text-accent-cyan'
      case 'failed': return 'text-status-error'
      default: return 'text-text-muted'
    }
  }

  const statusDot = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-status-success'
      case 'running': return 'bg-accent-cyan animate-pulse'
      case 'failed': return 'bg-status-error'
      default: return 'bg-text-muted'
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-syne font-bold text-text-primary">
            Dashboard
          </h1>
          <p className="text-text-secondary mt-1">
            Welcome back, {session.user.name?.split(' ')[0]}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/scan/new" className="btn-primary">
            + New Scan
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Projects', value: projects.length },
          { label: 'Total Scans', value: recentScans.length },
          {
            label: 'Issues Found',
            value: recentScans.reduce((acc, s) => acc + s.issueCount, 0),
          },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <div className="text-3xl font-syne font-bold text-accent-cyan">
              {stat.value}
            </div>
            <div className="text-text-secondary text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-syne font-semibold text-text-primary">
              Projects
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">◎</div>
              <h3 className="font-syne font-semibold text-text-primary mb-2">
                No projects yet
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                Create a project to organize your scans
              </p>
              <Link href="/dashboard/scan/new" className="btn-primary inline-flex">
                Create First Project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="card flex items-center justify-between hover:border-accent-cyan/30 transition-all duration-200 block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent-cyan text-xs font-syne font-bold">
                        {project.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">{project.name}</p>
                      <p className="text-text-muted text-xs monospace">{project.url}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-text-secondary text-sm">
                      {project._count.scans} scan{project._count.scans !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Scans */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-syne font-semibold text-text-primary">
              Recent Scans
            </h2>
          </div>

          {recentScans.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">⬡</div>
              <h3 className="font-syne font-semibold text-text-primary mb-2">
                No scans yet
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                Run your first cross-device scan
              </p>
              <Link href="/dashboard/scan/new" className="btn-primary inline-flex">
                Start Scanning
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <Link
                  key={scan.id}
                  href={`/dashboard/scans/${scan.id}`}
                  className="card flex items-center justify-between hover:border-accent-cyan/30 transition-all duration-200 block"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(scan.status)}`} />
                    <div className="min-w-0">
                      <p className="text-text-primary text-sm font-medium truncate monospace">
                        {scan.url}
                      </p>
                      <p className="text-text-muted text-xs">
                        {new Date(scan.createdAt).toLocaleDateString()} ·{' '}
                        {scan._count.results} devices
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4 text-right">
                    <span className={`text-sm font-medium ${statusColor(scan.status)}`}>
                      {scan.status}
                    </span>
                    {scan.status === 'complete' && (
                      <p className="text-text-muted text-xs">
                        {scan.issueCount} issues
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
