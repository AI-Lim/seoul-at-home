import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalTickets,
      totalUsers,
      paidBookings,
      tontineBookings,
      seoulEntryCount,
      neonVibeCount,
      payments,
      recentTickets,
      tontineInProgress,
    ] = await Promise.all([
      prisma.ticket.count(),
      prisma.user.count(),
      prisma.booking.count({ where: { status: 'PAID' } }),
      prisma.booking.count({ where: { status: 'TONTINE' } }),
      prisma.booking.count({ where: { selectedPass: 'seoul-entry' } }),
      prisma.booking.count({ where: { selectedPass: 'neon-vibe' } }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
      }),
      prisma.ticket.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              user: true,
              koreanIdentity: true,
            }
          }
        }
      }),
      // Bookings tontine en cours avec progression
      prisma.booking.findMany({
        where: { status: 'TONTINE' },
        include: {
          user: true,
          koreanIdentity: true,
          tontine: true,
          payments: {
            where: { status: 'SUCCESS' },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({
      success: true,
      stats: {
        totalTickets,
        totalUsers,
        paidBookings,
        tontineBookings,
        seoulEntryCount,
        neonVibeCount,
        totalRevenue: payments._sum.amount || 0,
      },
      recentTickets,
      tontineInProgress,
    })

  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}