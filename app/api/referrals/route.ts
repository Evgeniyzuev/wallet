import { getReferrals, getReferrer, saveReferral } from '@/app/lib/storage';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const { userId, referrerId } = await request.json();
  
  if (!userId || !referrerId) {
    return NextResponse.json({ error: 'Missing userId or referrerId' }, { status: 400 });
  }

  saveReferral(userId, referrerId);
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: parseInt(userId) },
      include: {
        contacts: {
          where: { isReferral: true },
          include: {
            contact: {
              select: {
                telegramId: true,
                firstName: true,
                username: true,
                level: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const referrals = user.contacts.map(contact => ({
      telegramId: contact.contact.telegramId,
      firstName: contact.contact.firstName,
      username: contact.contact.username,
      level: contact.contact.level
    }));

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
