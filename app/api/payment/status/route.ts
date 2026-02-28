import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId requis' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ticket: true,
        tontine: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ status: 'NOT_FOUND' })
    }

    // Calculer total payé
    const totalPaid = booking.payments
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + p.amount, 0)

    // Paiement en attente le plus récent
    const pendingPayment = booking.payments.find(p => p.status === 'PENDING')

    return NextResponse.json({
      status: booking.status,
      ticketCode: booking.ticket?.ticketCode || null,
      totalPaid,
      totalAmount: booking.totalAmount,
      remaining: booking.totalAmount - totalPaid,
      hasPendingPayment: !!pendingPayment,
      tontine: booking.tontine,
    })

  } catch (error) {
    console.error('Payment status error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}