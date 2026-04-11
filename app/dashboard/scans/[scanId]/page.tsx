'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { clsx } from 'clsx'

interface Issue {
  id: string
  severity: string
  category: string
  description: string
  boundingBox?: string
  suggestion?: string
}

interface DeviceResult {
  id: string
  deviceName: string
  viewportWidth: number
  viewportHeight: number
  marketShare: number
  screenshotPath: string
  issues: Issue[]
  createdAt: string
}

interface Scan {
  id: string
  url: string
  status: string
  issueCount: number
  createdAt: string
  project?: { id: string; name: string }
  results: DeviceResult[]
}

function SeverityBadge({ severity }: { severity: string }) {
  const classes = {
    critical: 'badge-critical',
    major: 'badge-major',
    minor: 'badge-minor',
    info: 'badge-info',
  }

  const icons = {
    critical: '⚠',
    major: '◉',
    minor: '◎',
    info: 'ℹ',
  }

  return (
    <span className={clsx(classes[severity as keyof typeof classes] || 'badge-info')}>
      {icons[severity as keyof typeof icons] || '•'} {severity}
    </span>
  )
}

function DeviceIcon({ category }: { category: string }) {
  if (category === 'mobile') return <span>📱</span>
  if (category === 'tablet') return <span>📟</span>
  return <span>🖥️</span>
}

function getDeviceCategory(width: number): string {
  if (width <= 430) return 'mobile'
  if (width <= 1024) return 'tablet'
  return 'desktop'
}

export default function ScanResultsPage() {
  const params = useParams()
  const router = useRouter()
  const scanId = params.scanId as string

  const [scan, setScan] = useState<Scan | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState<DeviceResult | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const fetchScan = async () => {
    try {
      const res = await fetch(`/api/scans/${scanId}`)
      if (res.ok) {
        const data = await res.json()
        setScan(data)
        if (data.results?.length > 0 && !selectedDevice) {
          setSelectedDevice(data.results[0])
        }
        return data.status
      }
    } catch (err) {
      console.error('Error fetching scan:', err)
    }
    return null
  }

  useEffect(() => {
    setLoading(true)
    fetchScan().then((status) => {
      setLoading(false)

      // If still running, poll
      if (status === 'running' || status === 'pending') {
        const interval = setInterval(async () => {
          const s = await fetchScan()
          if (s === 'complete' || s === 'failed') {
            clearInterval(interval)
          }
        }, 4000)
        return () => clearInterval(interval)
      }
    })
  }, [scanId])

  const severityOrder = { critical: 0, major: 1, minor: 2, info: 3 }

  const sortedResults = scan?.results
    ? [...scan.results].sort((a, b) => {
        // Sort by: has critical issues first, then by market share desc
        const aCritical = a.issues.some((i) => i.severity === 'critical') ? 0 : 1
        const bCritical = b.issues.some((i) => i.severity === 'critical') ? 0 : 1
        if (aCritical !== bCritical) return aCritical - bCritical
        return b.marketShare - a.marketShare
      })
    : []

  const filteredIssues = selectedDevice?.issues.filter((issue) => {
    if (activeFilter === 'all') return true
    return issue.severity === activeFilter
  })

  const totalCritical = scan?.results.reduce(
    (acc, r) => acc + r.issues.filter((i) => i.severity === 'critical').length,
    0
  ) || 0

  const totalMajor = scan?.results.reduce(
    (acc, r) => acc + r.issues.filter((i) => i.severity === 'major').length,
    0
  ) || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading scan results...</p>
        </div>
      </div>
    )
  }

  if (!scan) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-syne font-bold text-text-primary mb-2">
          Scan not found
        </h2>
        <Link href="/dashboard" className="btn-secondary inline-flex mt-4">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
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
            <h1 className="text-2xl font-syne font-bold text-text-primary flex items-center gap-3">
              Scan Results
              <span
                className={clsx(
                  'text-sm px-2 py-0.5 rounded font-normal',
                  scan.status === 'complete'
                    ? 'bg-status-success/10 text-status-success'
                    : scan.status === 'running'
                    ? 'bg-accent-cyan/10 text-accent-cyan'
                    : 'bg-status-error/10 text-status-error'
                )}
              >
                {scan.status}
              </span>
            </h1>
            <p className="text-text-secondary monospace text-sm mt-1">{scan.url}</p>
            {scan.project && (
              <Link
                href={`/dashboard/projects/${scan.project.id}`}
                className="text-accent-cyan text-sm hover:underline mt-1 inline-block"
              >
                {scan.project.name} →
              </Link>
            )}
          </div>

          <div className="text-right">
            <p className="text-text-muted text-xs">
              {new Date(scan.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Running indicator */}
      {scan.status === 'running' && (
        <div className="card border-accent-cyan/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-accent-cyan animate-pulse" />
            <div>
              <p className="text-text-primary font-medium">
                Scan in progress — {scan.results.length}/10 devices complete
              </p>
              <p className="text-text-secondary text-sm">
                Results will appear below as each device completes
              </p>
            </div>
          </div>
          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-accent-cyan rounded-full transition-all duration-500"
              style={{ width: `${(scan.results.length / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Summary stats */}
      {scan.status === 'complete' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-syne font-bold text-text-primary">
              {scan.results.length}
            </div>
            <div className="text-text-muted text-xs mt-1">Devices Tested</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-syne font-bold text-status-error">
              {totalCritical}
            </div>
            <div className="text-text-muted text-xs mt-1">Critical Issues</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-syne font-bold text-status-warning">
              {totalMajor}
            </div>
            <div className="text-text-muted text-xs mt-1">Major Issues</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-syne font-bold text-accent-cyan">
              {scan.issueCount}
            </div>
            <div className="text-text-muted text-xs mt-1">Total Issues</div>
          </div>
        </div>
      )}

      {/* Device Results Grid */}
      {sortedResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device List */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Devices — sorted by impact
            </h2>
            {sortedResults.map((result) => {
              const critical = result.issues.filter((i) => i.severity === 'critical').length
              const major = result.issues.filter((i) => i.severity === 'major').length
              const isSelected = selectedDevice?.id === result.id
              const category = getDeviceCategory(result.viewportWidth)

              return (
                <button
                  key={result.id}
                  onClick={() => setSelectedDevice(result)}
                  className={clsx(
                    'w-full text-left card cursor-pointer transition-all duration-200',
                    isSelected
                      ? 'border-accent-cyan/50 bg-accent-cyan/5'
                      : 'hover:border-border-bright'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <DeviceIcon category={category} />
                    <span className="text-text-primary text-sm font-medium">
                      {result.deviceName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="monospace">
                      {result.viewportWidth}×{result.viewportHeight}
                    </span>
                    <span>·</span>
                    <span>{result.marketShare}% share</span>
                  </div>
                  {result.issues.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {critical > 0 && (
                        <span className="badge-critical">
                          {critical} critical
                        </span>
                      )}
                      {major > 0 && (
                        <span className="badge-major">{major} major</span>
                      )}
                      {result.issues.length - critical - major > 0 && (
                        <span className="badge-info">
                          {result.issues.length - critical - major} more
                        </span>
                      )}
                    </div>
                  )}
                  {result.issues.length === 0 && (
                    <span className="text-status-success text-xs mt-2 inline-block">
                      ✓ No issues found
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Device Detail */}
          {selectedDevice && (
            <div className="lg:col-span-2 space-y-4">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-syne font-semibold text-text-primary">
                    {selectedDevice.deviceName}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-text-muted monospace">
                    <span>
                      {selectedDevice.viewportWidth}×{selectedDevice.viewportHeight}
                    </span>
                    <span>·</span>
                    <span>{selectedDevice.marketShare}% market share</span>
                  </div>
                </div>

                {/* Screenshot */}
                <div className="relative bg-bg-tertiary rounded-lg overflow-hidden border border-border">
                  <div className="aspect-video relative">
                    <Image
                      src={selectedDevice.screenshotPath}
                      alt={`Screenshot on ${selectedDevice.deviceName}`}
                      fill
                      className="object-cover object-top"
                      unoptimized
                    />
                    {selectedDevice.issues.some((i) => i.severity === 'critical') && (
                      <div className="absolute top-2 right-2">
                        <span className="badge-critical">
                          ⚠ Critical issues
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Issues */}
              {selectedDevice.issues.length > 0 && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-syne font-semibold text-text-primary">
                      Issues ({selectedDevice.issues.length})
                    </h3>

                    {/* Filter */}
                    <div className="flex gap-1">
                      {['all', 'critical', 'major', 'minor'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setActiveFilter(f)}
                          className={clsx(
                            'px-2 py-1 rounded text-xs font-medium capitalize transition-colors',
                            activeFilter === f
                              ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                              : 'text-text-muted hover:text-text-secondary border border-transparent'
                          )}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredIssues?.map((issue) => (
                      <div
                        key={issue.id}
                        className="bg-bg-tertiary rounded-lg p-4 border border-border"
                      >
                        <div className="flex items-start gap-3">
                          <SeverityBadge severity={issue.severity} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-text-muted text-xs monospace uppercase tracking-wider">
                                {issue.category}
                              </span>
                              {issue.boundingBox && (
                                <span className="text-text-muted text-xs">
                                  @ {issue.boundingBox}
                                </span>
                              )}
                            </div>
                            <p className="text-text-primary text-sm">
                              {issue.description}
                            </p>
                            {issue.suggestion && (
                              <p className="text-accent-cyan text-xs mt-2 flex items-start gap-1">
                                <span className="flex-shrink-0">→</span>
                                <span>{issue.suggestion}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredIssues?.length === 0 && (
                      <p className="text-text-muted text-sm text-center py-4">
                        No {activeFilter} issues for this device
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedDevice.issues.length === 0 && (
                <div className="card text-center py-8">
                  <div className="text-3xl mb-2">✓</div>
                  <p className="text-status-success font-medium">
                    No issues detected on this device
                  </p>
                  <p className="text-text-muted text-sm mt-1">
                    Layout looks great on {selectedDevice.deviceName}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {scan.status === 'complete' && scan.results.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-text-secondary">No results available for this scan.</p>
        </div>
      )}
    </div>
  )
}
