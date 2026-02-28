import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
export async function POST() {
  try {
    // Supprimer dans l'ordre des dépendances
    await prisma.ticket.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.tontine.deleteMany()
    await prisma.koreanIdentity.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.user.deleteMany()

    return NextResponse.json({ success: true, message: 'Base de données réinitialisée' })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}