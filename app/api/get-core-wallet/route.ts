import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get('userId')

        if (!id) {
            return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
        }

        const coreWallet = await prisma.wallet.findUnique({
            where: { id }
        })

        if (!coreWallet) {
            return NextResponse.json({ error: 'CoreWallet not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, coreWallet })
    } catch (error) {
        console.error('Error fetching core wallet:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
