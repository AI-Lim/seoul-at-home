import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { gender, mood, bookingId } = await req.json()

    const moodMap: Record<string, string> = {
  dreamy: 'rêveur, poétique, doux comme un songe',
  energetic: 'énergique, vif, dynamique, plein de vie',
  elegant: 'élégant, raffiné, gracieux, sophistiqué',
  mysterious: 'mystérieux, profond, envoûtant, sombre',
  fierce: 'puissant, audacieux, courageux, intense comme le feu',
  soft: 'doux, tendre, délicat, comme une fleur de printemps',
  cosmic: 'cosmique, universel, mystique, connecté aux étoiles',
  pure: 'pur, innocent, lumineux, serein comme la lumière',
}

    const genderMap: Record<string, string> = {
      male: 'masculin',
      female: 'féminin',
      other: 'neutre ou mixte',
    }

    // Appel Mistral API
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{
          role: 'user',
          content: `Génère un vrai prénom coréen authentique et unique pour une personne de genre ${genderMap[gender]} avec une vibe ${moodMap[mood]} , ne donne pas des noms courant, soit créatif et imaginatif.

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown :
{
  "hangul": "les caractères coréens",
  "koreanName": "la romanisation (ex: Ji-woo)",
  "pronunciation": "comment prononcer en français (ex: Dji-Ou)",
  "meaning": "phrase poétique de 4 mots sur la signification du nom en lien avec la vibe ${moodMap[mood]}"
}`
        }],
        temperature: 0.9,
      })
    })

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const identity = JSON.parse(clean)

    // Sauvegarde en BDD si bookingId fourni
    if (bookingId) {
      await prisma.koreanIdentity.upsert({
        where: { bookingId },
        update: { ...identity, gender, mood },
        create: { bookingId, ...identity, gender, mood }
      })
    }

    return NextResponse.json({ success: true, identity })

  } catch (error) {
    console.error('Identity error:', error)
    return NextResponse.json({ error: 'Erreur génération' }, { status: 500 })
  }
}