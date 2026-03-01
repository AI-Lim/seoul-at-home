import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        bookings: {
          include: {
            koreanIdentity: true,
            tontine: true,
            payments: {
              orderBy: { createdAt: 'desc' }
            },
            ticket: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const booking = user.bookings[0]

    if (!booking) {
      return NextResponse.json({
        success: true,
        user,
        redirectTo: '/pass-selection',
        state: 'no_booking'
      })
    }

    const totalPaid = booking.payments
      .filter((p: any) => p.status === 'SUCCESS')
      .reduce((sum: number, p: any) => sum + p.amount, 0)

    const pendingPayment = booking.payments.find((p: any) => p.status === 'PENDING')
    const lastPayment = booking.payments[0]
    const lastRejected = lastPayment?.status === 'FAILED' ? lastPayment : null

    let redirectTo = '/pass-selection'
    let state = 'no_booking'

    if (booking.status === 'PAID' && booking.ticket) {
      redirectTo = '/ticket'
      state = 'paid'
    } else if (booking.status === 'TONTINE' && pendingPayment) {
      redirectTo = '/payment-waiting'
      state = 'tontine_pending'
    } else if (booking.status === 'TONTINE' && lastRejected) {
      redirectTo = '/tontine'
      state = 'tontine_rejected'
    } else if (booking.status === 'TONTINE') {
      redirectTo = '/tontine'
      state = 'tontine_in_progress'
    } else if (booking.status === 'PENDING' && pendingPayment) {
      redirectTo = '/payment-waiting'
      state = 'payment_pending'
    } else if (booking.status === 'PENDING' && lastRejected) {
      redirectTo = '/payment'
      state = 'payment_rejected'
    }

    return NextResponse.json({
      success: true,
      user,
      booking,
      redirectTo,
      state,
      totalPaid,
      ticketCode: booking.ticket?.ticketCode || null,
      rejectedNote: lastRejected?.adminNote || null,
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}