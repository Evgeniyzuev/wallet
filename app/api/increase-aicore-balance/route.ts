import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { telegramId, amount } = await req.json()

        if (!telegramId || isNaN(amount)) {
            return NextResponse.json({ error: 'Invalid telegramId or amount' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: { aicoreBalance: { increment: amount } }
        })

        return NextResponse.json({ success: true, aicoreBalance: updatedUser.aicoreBalance })
    } catch (error) {
        console.error('Error increasing Aicore balance:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
