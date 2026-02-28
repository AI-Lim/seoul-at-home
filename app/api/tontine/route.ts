import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { bookingId, paidBoxes, amountPaid } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId requis' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tontine: true }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking non trouvé' }, { status: 404 })
    }

    const totalBoxes = Math.floor(booking.passPrice / 1000)
    const remainingAmount = booking.passPrice - amountPaid

    // Créer ou mettre à jour la tontine
    const tontine = await prisma.tontine.upsert({
      where: { bookingId },
      update: {
        paidBoxes,
        amountPaid,
        remainingAmount,
      },
      create: {
        bookingId,
        totalBoxes,
        paidBoxes,
        amountPaid,
        remainingAmount,
      }
    })

    // Vérifier si la tontine est complète
    const isComplete = paidBoxes >= totalBoxes

    if (isComplete) {
      // Tontine complète → statut PAID + générer ticket
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'PAID' }
      })

      const ticketCode = `SAH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      const fullBooking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { koreanIdentity: true }
      })

      const qrData = JSON.stringify({
        id: ticketCode,
        name: fullBooking?.koreanIdentity?.koreanName,
        pass: fullBooking?.selectedPass,
      })

      const ticket = await prisma.ticket.create({
        data: {
          bookingId,
          ticketCode,
          qrData,
          isValid: true
        }
      })

      return NextResponse.json({
        success: true,
        tontine,
        isComplete: true,
        ticket,
        ticketCode,
        message: 'Tontine complète ! Ton Soul Pass est prêt 🎉'
      })
    }

    // Tontine incomplète → statut TONTINE
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'TONTINE' }
    })

    return NextResponse.json({
      success: true,
      tontine,
      isComplete: false,
      paidBoxes,
      totalBoxes,
      remainingAmount,
      message: `Merci pour ton acompte ! Tu as payé ${paidBoxes} boxes sur ${totalBoxes}. Reviens vite pour compléter ta tontine et obtenir ton Soul Pass ! 🌟`
    })

  } catch (error) {
    console.error('Tontine error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId requis' }, { status: 400 })
    }

    const tontine = await prisma.tontine.findUnique({
      where: { bookingId },
    })

    return NextResponse.json({ success: true, tontine })

  } catch (error) {
    console.error('Tontine GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}