import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pendingPayments = await prisma.payment.findMany({
      where: { status: 'PENDING' },
      include: {
        booking: {
          include: {
            user: true,
            koreanIdentity: true,
            tontine: true,
            payments: {
              where: { status: 'SUCCESS' },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Enrichir avec le total déjà payé
    const enriched = pendingPayments.map(payment => {
      const totalPaid = payment.booking.payments.reduce((sum, p) => sum + p.amount, 0)
      const isTontine = payment.amount < payment.booking.totalAmount || payment.booking.status === 'TONTINE'
      return {
        ...payment,
        totalPaid,
        isTontine,
        remaining: payment.booking.totalAmount - totalPaid - payment.amount,
      }
    })

    return NextResponse.json({
      success: true,
      payments: enriched,
      count: enriched.length
    })

  } catch (error) {
    console.error('Pending payments error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}