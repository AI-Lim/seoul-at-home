import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId, selectedPass, passPrice } = await req.json()

    if (!userId || !selectedPass || !passPrice) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        selectedPass,
        passPrice,
        totalAmount: passPrice,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, bookingId: booking.id, booking })

  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { bookingId, ...data } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId requis' }, { status: 400 })
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data
    })

    return NextResponse.json({ success: true, booking })

  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}