import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
export async function POST(req: NextRequest) {
  try {
    const { bookingId, operator, phone, amount, isTontine } = await req.json()

    if (!bookingId || !operator || !phone || !amount) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Créer un nouveau paiement PENDING
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        operator,
        phone,
        senderPhone: phone,
        amount,
        status: 'PENDING',
      }
    })

    // Mettre le booking en attente
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: isTontine ? 'TONTINE' : 'PENDING' }
    })

    return NextResponse.json({ success: true, paymentId: payment.id })

  } catch (error) {
    console.error('Payment initiate error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}