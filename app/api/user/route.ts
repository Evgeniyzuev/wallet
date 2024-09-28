import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const userData = await req.json()

        if (!userData || !userData.id) {
            return NextResponse.json({ error: 'Invalid user data' }, { status: 400 })
        }

        let user = await prisma.user.findUnique({
            where: { telegramId: userData.id }
        })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    telegramId: userData.id,
                    username: userData.username || '',
                    firstName: userData.first_name || '',
                    lastName: userData.last_name || ''
                }
            })
        }

        let coreWallet = await prisma.wallet.findUnique({
            where: { id: user.id }
        })

        if (!coreWallet) {
            coreWallet = await prisma.wallet.create({
                data: {
                    id: user.id,
                    coreUSD: 0,
                    walletUSD: 0,
                    userLevel: 0,
                    tokens: 0,
                    reputationPlus: 0,
                    reputationMinus: 0
                }
            })
        }

        return NextResponse.json({ user, coreWallet })
    } catch (error) {
        console.error('Error processing user data:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}