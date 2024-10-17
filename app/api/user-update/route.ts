import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { telegramId, updates } = await req.json()

        if (!telegramId || !updates || typeof updates !== 'object') {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: updates
        })

        return NextResponse.json({ 
            success: true, 
            user: updatedUser
        })
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
