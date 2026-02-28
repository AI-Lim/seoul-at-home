import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function generateTicket(bookingId: string) {
  const ticketCode = `SAH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { koreanIdentity: true }
  })
  const qrData = JSON.stringify({
    id: ticketCode,
    name: booking?.koreanIdentity?.koreanName,
    pass: booking?.selectedPass,
  })
  const ticket = await prisma.ticket.upsert({
    where: { bookingId },
    update: { ticketCode, qrData, isValid: true },
    create: { bookingId, ticketCode, qrData, isValid: true }
  })
  return { ticket, ticketCode }
}

export async function POST(req: NextRequest) {
  try {
    const { paymentId, action, adminNote } = await req.json()

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { 
        booking: {
          include: { tontine: true }
        }
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 })
    }

    if (action === 'approve') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'SUCCESS', paidAt: new Date() }
      })

      const booking = payment.booking
      const isTontineBooking = booking.status === 'TONTINE' || payment.amount < booking.totalAmount

      if (isTontineBooking) {
        // Calculer le total déjà payé
        const allSuccessPayments = await prisma.payment.findMany({
          where: { 
            bookingId: booking.id,
            status: 'SUCCESS'
          }
        })
        const totalPaid = allSuccessPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
        const isComplete = totalPaid >= booking.totalAmount

        // Upsert tontine
        await prisma.tontine.upsert({
  where: { bookingId: booking.id },
  update: {
    amountPaid: totalPaid,
    paidBoxes: Math.floor(totalPaid / 1000),
    remainingAmount: booking.totalAmount - totalPaid,
    status: isComplete ? 'COMPLETE' : 'IN_PROGRESS',
  },
  create: {
    bookingId: booking.id,
    totalBoxes: Math.floor(booking.totalAmount / 1000),
    paidBoxes: Math.floor(totalPaid / 1000),
    amountPaid: totalPaid,
    remainingAmount: booking.totalAmount - totalPaid,
    status: isComplete ? 'COMPLETE' : 'IN_PROGRESS',
  }
})

        if (isComplete) {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'PAID' }
          })
          const { ticket, ticketCode } = await generateTicket(booking.id)
          return NextResponse.json({
            success: true,
            tontineComplete: true,
            ticket,
            ticketCode,
            message: '🎉 Tontine complète ! Ticket généré.'
          })
        } else {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'TONTINE' }
          })
          return NextResponse.json({
            success: true,
            tontineComplete: false,
            totalPaid,
            remaining: booking.totalAmount - totalPaid,
            message: `✅ Versement de ${payment.amount.toLocaleString()} F validé. Reste ${(booking.totalAmount - totalPaid).toLocaleString()} F`
          })
        }

      } else {
        // Paiement complet en une fois
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'PAID' }
        })
        const { ticket, ticketCode } = await generateTicket(booking.id)
        return NextResponse.json({
          success: true,
          tontineComplete: false,
          ticket,
          ticketCode,
          message: '✅ Paiement validé ! Ticket généré.'
        })
      }

    } else if (action === 'reject') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', adminNote: adminNote || 'Paiement rejeté' }
      })
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'PENDING' }
      })
      return NextResponse.json({ success: true, message: 'Paiement rejeté.' })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })

  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}