import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const telegramId = req.nextUrl.searchParams.get('telegramId');

  if (!telegramId) {
    return NextResponse.json({ error: 'telegramId is required' }, { status: 400 });
  }

  try {
    const completedTasks = await prisma.completedTask.findMany({
      where: { telegramId: parseInt(telegramId) },
      select: { taskId: true },
    });

    const completedTaskIds = completedTasks.map(task => task.taskId);

    return NextResponse.json({ completedTaskIds });
  } catch (error) {
    console.error('Error fetching completed tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch completed tasks' }, { status: 500 });
  }
}
