import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.name) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword, userId } = await request.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        // Determine target user
        let targetUsername = session.user.name;

        // If admin and userId is provided, change that user's password
        if (session.user.role === 'ADMIN' && userId) {
            const targetUser = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
            if (!targetUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // SUPER ADMIN PROTECTION: Prevent admins from changing "Ahmet Mersin" password
            if (targetUser.username.toLowerCase() === 'ahmet mersin' && session.user.name?.toLowerCase() !== 'ahmet mersin') {
                return NextResponse.json({ error: 'Cannot change Super Admin password' }, { status: 403 });
            }

            targetUsername = targetUser.username;
        } else {
            // Regular user changing their own password
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password required' }, { status: 400 });
            }

            const user = await prisma.user.findUnique({
                where: { username: session.user.name }
            });

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { username: targetUsername },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
}
