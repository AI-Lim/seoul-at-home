import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ticketCode = searchParams.get('code')
    const bookingId = searchParams.get('bookingId')

    const ticket = await prisma.ticket.findFirst({
      where: ticketCode ? { ticketCode } : { bookingId: bookingId! },
      include: {
        booking: {
          include: {
            user: true,
            koreanIdentity: true,
            tontine: true,
            payments: true,
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ success: true, ticket })

  } catch (error) {
    console.error('Ticket error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}