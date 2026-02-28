import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { ticketCode } = await req.json()

    if (!ticketCode) {
      return NextResponse.json({ error: 'ticketCode requis' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode },
      include: {
        booking: {
          include: {
            user: true,
            koreanIdentity: true,
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ valid: false, reason: 'Ticket inexistant' })
    }

    if (!ticket.isValid) {
      return NextResponse.json({ valid: false, reason: 'Ticket annulé' })
    }

    if (ticket.scannedAt) {
      return NextResponse.json({ 
        valid: false, 
        reason: `Déjà scanné à ${ticket.scannedAt.toLocaleTimeString()}` 
      })
    }

    // Marquer comme scanné
    await prisma.ticket.update({
      where: { ticketCode },
      data: { scannedAt: new Date() }
    })

    return NextResponse.json({
      valid: true,
      ticket,
      user: ticket.booking.user,
      koreanIdentity: ticket.booking.koreanIdentity,
      pass: ticket.booking.selectedPass,
    })

  } catch (error) {
    console.error('Validate error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}