import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { user, start_param } = await req.json()

        if (!user || !user.id) {
            return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
        }

        let dbUser = await prisma.user.findUnique({
            where: { telegramId: user.id }
        })

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    telegramId: user.id,
                    referrerId: start_param || null,
                    username: user.username || '',
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                }
            })
        }

        return NextResponse.json(dbUser)
    } catch (error) {
        console.error('Error processing user data:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}