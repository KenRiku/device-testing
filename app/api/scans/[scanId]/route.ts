import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { scanId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { scanId } = params

    const scan = await prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        results: {
          include: {
            issues: {
              orderBy: [
                { severity: 'asc' },
                { createdAt: 'asc' },
              ],
            },
          },
          orderBy: { marketShare: 'desc' },
        },
        project: true,
      },
    })

    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    if (scan.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(scan)
  } catch (error) {
    console.error('Scan GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan' },
      { status: 500 }
    )
  }
}
