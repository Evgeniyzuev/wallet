import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { telegramId, newDate } = await req.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId },
      data: {
        lastLoginDate: new Date(newDate)
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating login date:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
