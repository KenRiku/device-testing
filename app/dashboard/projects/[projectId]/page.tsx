import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { clsx } from 'clsx'

interface Props {
  params: { projectId: string }
}

export default async function ProjectDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const userId = (session.user as any).id

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      scans: {
        orderBy: { createdAt: 'desc' },
        include: {
          results: {
            include: {
              _count: { select: { issues: true } },
            },
          },
        },
      },
    },
  })

  if (!project || project.userId !== userId) {
    notFound()
  }

  const latestScan = project.scans[0]

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
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="text-text-muted hover:text-text-secondary text-sm flex items-center gap-1 mb-4 transition-colors"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-syne font-bold text-text-primary">
              {project.name}
            </h1>
            <p className="text-text-secondary monospace text-sm mt-1">{project.url}</p>
            <p className="text-text-muted text-xs mt-1">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>

          <Link
            href={`/dashboard/scan/new?url=${encodeURIComponent(project.url)}`}
            className="btn-primary"
          >
            + New Scan
          </Link>
        </div>
      </div>

      {/* Overview cards */}
      {latestScan && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-syne font-bold text-accent-cyan">
              {project.scans.length}
            </div>
            <div className="text-text-muted text-sm mt-1">Total Scans</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-syne font-bold text-status-error">
              {latestScan.issueCount}
            </div>
            <div className="text-text-muted text-sm mt-1">Issues (Latest Scan)</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-syne font-bold text-status-success">
              {latestScan.results.length}
            </div>
            <div className="text-text-muted text-sm mt-1">Devices (Latest)</div>
          </div>
        </div>
      )}

      {/* Scan History */}
      <div>
        <h2 className="text-xl font-syne font-semibold text-text-primary mb-4">
          Scan History
        </h2>

        {project.scans.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">⬡</div>
            <h3 className="font-syne font-semibold text-text-primary mb-2">
              No scans yet
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              Run your first scan for this project
            </p>
            <Link
              href={`/dashboard/scan/new?url=${encodeURIComponent(project.url)}`}
              className="btn-primary inline-flex"
            >
              Start First Scan
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {project.scans.map((scan, index) => {
              const devicesCount = scan.results.length
              const totalIssues = scan.results.reduce(
                (acc, r) => acc + r._count.issues,
                0
              )

              return (
                <Link
                  key={scan.id}
                  href={`/dashboard/scans/${scan.id}`}
                  className="card flex items-center justify-between hover:border-accent-cyan/30 transition-all duration-200 block"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${statusDot(scan.status)}`} />
                      {index === 0 && (
                        <span className="text-accent-cyan text-xs font-medium">
                          latest
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="text-text-primary font-medium text-sm">
                        Scan #{project.scans.length - index}
                      </p>
                      <p className="text-text-muted text-xs">
                        {new Date(scan.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-text-secondary text-sm">
                        {devicesCount}/10 devices
                      </p>
                    </div>
                    <div>
                      <p className={clsx('font-medium text-sm', statusColor(scan.status))}>
                        {scan.status}
                      </p>
                      {scan.status === 'complete' && (
                        <p className="text-text-muted text-xs">
                          {scan.issueCount} issues
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
