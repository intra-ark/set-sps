import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';

/**
 * Check if user is an admin
 */
export function isAdmin(session: Session | null): boolean {
    return session?.user?.role === 'ADMIN';
}

/**
 * Check if user can access a specific line
 * Admins can access all lines, regular users only their assigned lines
 */
export async function canUserAccessLine(
    userId: number,
    lineId: number,
    userRole: string
): Promise<boolean> {
    // Admins can access all lines
    if (userRole === 'ADMIN') {
        return true;
    }

    // Check if user has this line assigned
    const assignment = await prisma.userLine.findUnique({
        where: {
            userId_lineId: {
                userId,
                lineId
            }
        }
    });

    return assignment !== null;
}

/**
 * Get all lines accessible by a user
 * Admins get all lines, regular users get only assigned lines
 */
export async function getUserLines(userId: number, userRole: string) {
    if (userRole === 'ADMIN') {
        // Admins see all lines
        return await prisma.line.findMany({
            orderBy: { id: 'asc' }
        });
    }

    // Regular users see only assigned lines
    const assignments = await prisma.userLine.findMany({
        where: { userId },
        include: { line: true }
    });

    return assignments.map(a => a.line);
}

/**
 * Get line IDs accessible by a user
 */
export async function getUserLineIds(userId: number, userRole: string): Promise<number[]> {
    const lines = await getUserLines(userId, userRole);
    return lines.map(line => line.id);
}
