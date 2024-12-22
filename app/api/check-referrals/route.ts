import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {

    const { telegramId} = await req.json()

    // Get user's current paid referrals
    const user = await prisma.user.findUnique({
      where: { telegramId},
      include: {
        contacts: {
          where: { isReferral: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const actualReferrals = user.contacts.length;
    const currentPaidReferrals = user.paidReferrals;
    const newReferrals = actualReferrals - currentPaidReferrals;

    if (newReferrals > 0) {
      // Update user's paid referrals and aicore balance
      await prisma.user.update({
        where: { telegramId},
        data: {
          paidReferrals: actualReferrals,
          aicoreBalance: { increment: newReferrals }
        }
      });
    }

    return NextResponse.json({
      success: true,
      newReferrals,
      totalReferrals: actualReferrals
    });

  } catch (error) {
    console.error('Error checking referrals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 