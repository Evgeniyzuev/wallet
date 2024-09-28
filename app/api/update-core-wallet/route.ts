import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { id, coreUSD } = await req.json()

        if (!id || coreUSD === undefined) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const updatedWallet = await prisma.wallet.update({
            where: { id },
            data: { coreUSD }
        })

        return NextResponse.json({ success: true, updatedWallet })
    } catch (error) {
        console.error('Error updating core wallet:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
