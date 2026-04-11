'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { DEVICE_PRESETS } from '@/lib/devices'

interface Project {
  id: string
  name: string
  url: string
}

function NewScanForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledUrl = searchParams.get('url') || ''

  const [url, setUrl] = useState(prefilledUrl)
  const [projectId, setProjectId] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [createProject, setCreateProject] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [scanId, setScanId] = useState<string | null>(null)
  const [scanStatus, setScanStatus] = useState<string>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data)
      })
      .catch(console.error)
  }, [])

  // Poll scan status
  useEffect(() => {
    if (!scanId || scanStatus === 'complete' || scanStatus === 'failed') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}`)
        if (res.ok) {
          const data = await res.json()
          setScanStatus(data.status)

          // Calculate progress based on device results
          const deviceCount = data.results?.length || 0
          setProgress(Math.min((deviceCount / 10) * 100, 95))

          if (data.status === 'complete') {
            setProgress(100)
            clearInterval(interval)
            setTimeout(() => {
              router.push(`/dashboard/scans/${scanId}`)
            }, 1000)
          } else if (data.status === 'failed') {
            clearInterval(interval)
            setError('Scan failed. Please try again.')
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [scanId, scanStatus, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a URL to scan')
      return
    }

    setLoading(true)
    setProgress(5)

    try {
      // Create project if needed
      let finalProjectId = projectId

      if (createProject && newProjectName) {
        const projRes = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newProjectName, url }),
        })

        if (projRes.ok) {
          const proj = await projRes.json()
          finalProjectId = proj.id
        }
      }

      // Start scan
      const scanRes = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          projectId: finalProjectId || null,
        }),
      })

      if (!scanRes.ok) {
        const data = await scanRes.json()
        throw new Error(data.error || 'Failed to start scan')
      }

      const scanData = await scanRes.json()
      setScanId(scanData.scanId)
      setScanStatus('running')
      setProgress(10)
    } catch (err: any) {
      setError(err.message || 'Failed to start scan')
      setLoading(false)
      setProgress(0)
    }
  }

  const progressSteps = [
    'Initializing browser',
    'Capturing mobile screenshots',
    'Capturing tablet screenshots',
    'Capturing desktop screenshots',
    'Running AI analysis',
    'Saving results',
  ]

  const currentStep = Math.floor((progress / 100) * progressSteps.length)

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-text-muted hover:text-text-secondary text-sm flex items-center gap-1 mb-4 transition-colors"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-syne font-bold text-text-primary">
          New Scan
        </h1>
        <p className="text-text-secondary mt-1">
          Test your URL across {DEVICE_PRESETS.length} device configurations
        </p>
      </div>

      {/* Scan Running State */}
      {loading && scanId && (
        <div className="card mb-6 border-accent-cyan/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-accent-cyan animate-pulse" />
            <h2 className="font-syne font-semibold text-text-primary">
              Scan in progress
            </h2>
            <span className="text-accent-cyan text-sm monospace ml-auto">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-accent-cyan rounded-full transition-all duration-500 progress-bar-animated"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {progressSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-2 text-sm">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    i < currentStep
                      ? 'bg-status-success border-status-success'
                      : i === currentStep
                      ? 'border-accent-cyan'
                      : 'border-border'
                  }`}
                >
                  {i < currentStep && (
                    <svg className="w-2.5 h-2.5 text-bg-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                  {i === currentStep && (
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                  )}
                </div>
                <span
                  className={
                    i < currentStep
                      ? 'text-status-success'
                      : i === currentStep
                      ? 'text-accent-cyan'
                      : 'text-text-muted'
                  }
                >
                  {step}
                </span>
              </div>
            ))}
          </div>

          <p className="text-text-muted text-xs mt-4">
            This typically takes 2-4 minutes. You'll be redirected when complete.
          </p>
        </div>
      )}

      {/* Form */}
      {!loading && (
        <div className="card">
          {error && (
            <div className="bg-status-error/10 border border-status-error/30 text-status-error rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="label">
                URL to scan <span className="text-status-error">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="input-field monospace"
                placeholder="https://example.com"
              />
              <p className="text-text-muted text-xs mt-1">
                Must be publicly accessible
              </p>
            </div>

            {/* Project Assignment */}
            <div>
              <label className="label">Project (optional)</label>

              {projects.length > 0 && (
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="input-field mb-3"
                  disabled={createProject}
                >
                  <option value="">No project (standalone scan)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createProject}
                  onChange={(e) => {
                    setCreateProject(e.target.checked)
                    if (e.target.checked) setProjectId('')
                  }}
                  className="w-4 h-4 rounded border-border bg-bg-tertiary accent-accent-cyan"
                />
                <span className="text-text-secondary text-sm">
                  Create a new project for this URL
                </span>
              </label>

              {createProject && (
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="input-field mt-3"
                  placeholder="Project name (e.g., My Portfolio)"
                />
              )}
            </div>

            {/* Device preview */}
            <div>
              <label className="label">Devices to scan</label>
              <div className="bg-bg-tertiary border border-border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2">
                  {DEVICE_PRESETS.map((device) => (
                    <div
                      key={device.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="text-accent-cyan">
                        {device.category === 'mobile'
                          ? '📱'
                          : device.category === 'tablet'
                          ? '📟'
                          : '🖥️'}
                      </span>
                      <span className="text-text-secondary truncate">
                        {device.name}
                      </span>
                      <span className="text-text-muted text-xs monospace ml-auto">
                        {device.marketShare}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-text-muted text-xs mt-3 border-t border-border pt-3">
                  All 10 devices will be scanned automatically
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full btn-primary flex items-center justify-center gap-2 text-base py-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Start Cross-Device Scan
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function NewScanPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary">Loading...</div>
      </div>
    }>
      <NewScanForm />
    </Suspense>
  )
}
