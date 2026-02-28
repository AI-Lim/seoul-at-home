import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
// Récupérer la config
export async function GET() {
  try {
    let config = await prisma.eventConfig.findFirst()

    // Créer une config par défaut si elle n'existe pas
    if (!config) {
      config = await prisma.eventConfig.create({
        data: {
          seoulEntryTotal: 100,
          neonVibeTotal: 50,
        }
      })
    }

    // Compter les tickets déjà vendus
    const seoulEntrySold = await prisma.booking.count({
      where: { 
        selectedPass: 'seoul-entry',
        status: { in: ['PAID', 'TONTINE'] }
      }
    })

    const neonVibeSold = await prisma.booking.count({
      where: { 
        selectedPass: 'neon-vibe',
        status: { in: ['PAID', 'TONTINE'] }
      }
    })

    return NextResponse.json({
      success: true,
      config,
      availability: {
        seoulEntry: {
          total: config.seoulEntryTotal,
          sold: seoulEntrySold,
          remaining: config.seoulEntryTotal - seoulEntrySold,
        },
        neonVibe: {
          total: config.neonVibeTotal,
          sold: neonVibeSold,
          remaining: config.neonVibeTotal - neonVibeSold,
        }
      }
    })

  } catch (error) {
    console.error('Config GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Mettre à jour la config (admin seulement)
export async function PATCH(req: NextRequest) {
  try {
    const { seoulEntryTotal, neonVibeTotal } = await req.json()

    let config = await prisma.eventConfig.findFirst()

    if (!config) {
      config = await prisma.eventConfig.create({
        data: { seoulEntryTotal, neonVibeTotal }
      })
    } else {
      config = await prisma.eventConfig.update({
        where: { id: config.id },
        data: {
          ...(seoulEntryTotal !== undefined && { seoulEntryTotal }),
          ...(neonVibeTotal !== undefined && { neonVibeTotal }),
        }
      })
    }

    return NextResponse.json({ success: true, config })

  } catch (error) {
    console.error('Config PATCH error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { seoulEntryTotal, neonVibeTotal } = await req.json()

    const config = await prisma.eventConfig.create({
      data: { seoulEntryTotal, neonVibeTotal }
    })

    return NextResponse.json({ success: true, config })

  } catch (error) {
    console.error('Config POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}