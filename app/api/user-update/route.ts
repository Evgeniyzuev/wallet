import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { telegramId, updates } = await req.json()
        console.log('Received update request:', { telegramId, updates });

        if (!telegramId || !updates || typeof updates !== 'object') {
            console.log('Invalid parameters:', { telegramId, updates });
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
        }

        console.log('Attempting database update with:', updates);
        const updatedUser = await prisma.user.update({
            where: { telegramId },
            data: updates
        })
        console.log('Database update result:', updatedUser);

        return NextResponse.json({ 
            success: true, 
            user: updatedUser
        })
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
