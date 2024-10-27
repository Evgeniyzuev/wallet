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
                    referrerId: start_param ? parseInt(start_param) : null,
                    username: user.username || '',
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    lastLoginDate: new Date(new Date().setHours(0, 0, 0, 0)),
                    reinvestSetup: 100,
                    aicoreBalance: 0,
                    walletBalance: 0,
                    level: 0
                }
            })

            // Save contact as referral if start_param exists
            if (start_param) {
                const referrer = await prisma.user.findUnique({
                    where: { telegramId: parseInt(start_param) }
                })

                if (referrer) {
                    await prisma.contact.create({
                        data: {
                            userId: referrer.telegramId,
                            contactId: dbUser.telegramId,
                            isReferral: true
                        }
                    })
                }
            }
        }

        return NextResponse.json({ ...dbUser })
    } catch (error) {
        console.error('Error processing user data:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const telegramId = req.nextUrl.searchParams.get('telegramId');
    
    if (!telegramId) {
        return NextResponse.json({ error: 'Missing telegramId' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { telegramId: parseInt(telegramId) },
            select: {
                telegramId: true,
                username: true,
                firstName: true,
                level: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
