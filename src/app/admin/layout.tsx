import Link from 'next/link';
import AuthProvider from '@/components/AuthProvider';
import LogoutButton from '@/components/LogoutButton';
import ChangePasswordButton from '@/components/ChangePasswordButton';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <Link href="/admin" className="text-xl font-bold text-primary">
                                        SET SPS Admin
                                    </Link>
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    <Link
                                        href="/"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium dark:text-gray-300 dark:hover:text-white"
                                    >
                                        Public Dashboard
                                    </Link>
                                    <Link
                                        href="/admin"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium dark:text-gray-300 dark:hover:text-white"
                                    >
                                        Admin Panel
                                    </Link>
                                    <Link
                                        href="/admin/users"
                                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium dark:text-gray-300 dark:hover:text-white"
                                    >
                                        Users
                                    </Link>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <ChangePasswordButton />
                                <LogoutButton />
                            </div>
                        </div>
                    </div>
                </nav>
                <main className="py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </AuthProvider>
    );
}
