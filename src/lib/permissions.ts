import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';

/**
 * Check if user is an admin
 */
export function isAdmin(session: Session | null): boolean {
    return session?.user?.role === 'ADMIN';
}

/**
 * Check if user can edit a specific line
 * Admins can edit all lines, regular users only their assigned lines.
 */
export async function canUserAccessLine(
    userId: number,
    lineId: number,
    userRole: string
): Promise<boolean> {
    // Admins can edit all lines
    if (userRole === 'ADMIN') {
        return true;
    }
    // Regular users can edit only assigned lines
    const assignment = await prisma.userLine.findUnique({
        where: {
            userId_lineId: {
                userId,
                lineId,
            },
        },
    });
    return assignment !== null;
}

/**
 * Get all lines accessible (viewable) by a user
 * All users can view all lines; admins also can edit all.
 */
export async function getUserLines(userId: number, userRole: string) {
    // Return all lines for any user
    return await prisma.line.findMany({
        orderBy: { id: 'asc' },
    });
}

/**
 * Get line IDs accessible by a user (viewable)
 */
export async function getUserLineIds(userId: number, userRole: string): Promise<number[]> {
    const lines = await getUserLines(userId, userRole);
    return lines.map(line => line.id);
}
