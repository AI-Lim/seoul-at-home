import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        bookings: {
          include: {
            koreanIdentity: true,
            tontine: true,
            payments: true,
            ticket: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    // Si l'utilisateur existe déjà avec un booking actif
    if (existingUser) {
      const lastBooking = existingUser.bookings[0];
      
      if (lastBooking && lastBooking.status !== 'CANCELLED') {
        return NextResponse.json({ 
          error: 'Vous avez déjà un compte. Connectez-vous pour retrouver votre réservation.',
          shouldLogin: true,
          userId: existingUser.id,
        }, { status: 409 })
      }

      // Utilisateur existe mais pas de booking actif → on le retourne juste
      return NextResponse.json({ 
        success: true, 
        userId: existingUser.id,
        user: existingUser,
        isExisting: true
      })
    }

    // Créer le nouvel utilisateur
    const user = await prisma.user.create({
      data: { email, name, phone }
    })

    return NextResponse.json({ 
      success: true, 
      userId: user.id,
      user,
      isExisting: false
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}