import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
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
  const totalPaid = payment.booking.payments.reduce(
    (sum: number, p: any) => sum + p.amount, 0
  )
  // Utiliser tontine.amountPaid si disponible, sinon calculer
  const realPaid = payment.booking.tontine?.amountPaid || totalPaid
  const isTontine = payment.amount < payment.booking.totalAmount || 
                    payment.booking.status === 'TONTINE'
  return {
    ...payment,
    totalPaid: realPaid,
    isTontine,
    remaining: payment.booking.totalAmount - realPaid - payment.amount,
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