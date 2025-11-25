"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Toast from '@/components/Toast';
import Modal from '@/components/Modal';

interface User {
    id: number;
    username: string;
    role: string;
    createdAt: string;
}

interface Line {
    id: number;
    name: string;
    slug: string;
}

interface UserLine {
    id: number;
    lineId: number;
    line: Line;
}

export default function UsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);

    // Password Reset State
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [resetUserId, setResetUserId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState("");

    // Line Assignment State
    const [lineAssignModalOpen, setLineAssignModalOpen] = useState(false);
    const [assignUserId, setAssignUserId] = useState<number | null>(null);
    const [allLines, setAllLines] = useState<Line[]>([]);
    const [userLines, setUserLines] = useState<number[]>([]);
    const [loadingLines, setLoadingLines] = useState(false);

    // Role Change State
    const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
    const [roleChangeUserId, setRoleChangeUserId] = useState<number | null>(null);
    const [roleChangeUsername, setRoleChangeUsername] = useState("");
    const [selectedRole, setSelectedRole] = useState<string>("");

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false
    });

    // Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'info' | 'warning' | 'danger';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, visible: true });
    };

    const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'info' | 'warning' | 'danger' = 'warning') => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: () => {
                onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const isAdmin = session?.user?.role === 'ADMIN';

    useEffect(() => {
        fetchUsers();
        fetchAllLines();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                setUsername("");
                setPassword("");
                fetchUsers();
                showToast("User added successfully");
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to add user", 'error');
            }
        } catch (error) {
            console.error(error);
            showToast("An error occurred", 'error');
        }
    };

    const handleDeleteUser = async (id: number) => {
        showConfirm(
            'Delete User',
            'Are you sure you want to delete this user?',
            async () => {
                try {
                    const res = await fetch(`/api/users?id=${id}`, {
                        method: 'DELETE',
                    });
                    if (res.ok) {
                        fetchUsers();
                        showToast("User deleted successfully");
                    } else {
                        showToast("Failed to delete user", 'error');
                    }
                } catch (error) {
                    console.error(error);
                    showToast("Error deleting user", 'error');
                }
            },
            'danger'
        );
    };

    const openResetModal = (id: number) => {
        setResetUserId(id);
        setNewPassword("");
        setResetModalOpen(true);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetUserId) return;

        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: resetUserId, password: newPassword }),
            });

            if (res.ok) {
                showToast("Password updated successfully");
                setResetModalOpen(false);
                setResetUserId(null);
                setNewPassword("");
            } else {
                const err = await res.json();
                showToast(err.error || "Failed to update password", 'error');
            }
        } catch (error) {
            console.error(error);
            showToast("An error occurred", 'error');
        }
    };

    const fetchAllLines = async () => {
        try {
            // Fetch all lines for admin assignment modal
            const res = await fetch('/api/lines?all=true');
            const data = await res.json();
            setAllLines(data);
        } catch (error) {
            console.error('Error fetching lines:', error);
        }
    };

    const openLineAssignModal = async (userId: number) => {
        setAssignUserId(userId);
        setLoadingLines(true);
        setLineAssignModalOpen(true);

        try {
            const res = await fetch(`/api/user-lines?userId=${userId}`);
            const assignments: UserLine[] = await res.json();
            setUserLines(assignments.map(a => a.lineId));
        } catch (error) {
            console.error('Error fetching user lines:', error);
            setUserLines([]);
        } finally {
            setLoadingLines(false);
        }
    };

    const handleToggleLine = (lineId: number) => {
        setUserLines(prev =>
            prev.includes(lineId)
                ? prev.filter(id => id !== lineId)
                : [...prev, lineId]
        );
    };

    const handleSaveLineAssignments = async () => {
        if (!assignUserId) return;

        try {
            const res = await fetch('/api/user-lines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: assignUserId, lineIds: userLines })
            });

            if (res.ok) {
                showToast('Line assignments updated successfully!', 'success');
                setLineAssignModalOpen(false);
                setAssignUserId(null);
                setUserLines([]);
            } else {
                const err = await res.json();
                console.error('API Error:', err);
                showToast(`Failed: ${err.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error saving line assignments:', error);
            showToast(`Error: ${error}`, 'error');
        }
    };

    const openRoleChangeModal = (userId: number, currentRole: string, username: string) => {
        // Prevent changing Super Admin role
        if (username.toLowerCase() === 'ahmet mersin') {
            showToast('Cannot modify Super Admin role', 'error');
            return;
        }

        setRoleChangeUserId(userId);
        setRoleChangeUsername(username);
        setSelectedRole(currentRole || 'USER');
        setRoleChangeModalOpen(true);
    };

    const handleRoleChange = async () => {
        if (!roleChangeUserId || !selectedRole) return;

        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: roleChangeUserId, role: selectedRole })
            });

            if (res.ok) {
                showToast(`Role updated to ${selectedRole} successfully!`, 'success');
                setRoleChangeModalOpen(false);
                setRoleChangeUserId(null);
                setRoleChangeUsername("");
                setSelectedRole("");
                fetchUsers();
            } else {
                const err = await res.json();
                showToast(`Failed: ${err.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            showToast(`Error: ${error}`, 'error');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4">
            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, visible: false }))}
                />
            )}

            <Modal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            <h1 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">User Management</h1>

            {isAdmin && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Add New User</h2>
                    <form onSubmit={handleAddUser} className="flex gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition"
                        >
                            Add User
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role || 'USER'}
                                        </span>
                                        {isAdmin && user.username.toLowerCase() !== 'ahmet mersin' && (
                                            <button
                                                onClick={() => openRoleChangeModal(user.id, user.role || 'USER', user.username)}
                                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                                                title="Change user role"
                                            >
                                                Change Role
                                            </button>
                                        )}
                                        {user.username.toLowerCase() === 'ahmet mersin' && (
                                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full font-semibold">
                                                SUPER ADMIN
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        {user.role !== 'ADMIN' && (
                                            <button
                                                onClick={() => openLineAssignModal(user.id)}
                                                className="text-primary hover:text-green-700 dark:hover:text-green-400"
                                            >
                                                Assign Lines
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openResetModal(user.id)}
                                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                                        >
                                            Change Password
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Password Reset Modal */}
            {
                resetModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Reset Password</h3>
                            <form onSubmit={handleResetPassword}>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setResetModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Line Assignment Modal */}
            {lineAssignModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Assign Production Lines</h3>

                        {loadingLines ? (
                            <div className="text-center py-8 text-gray-500">Loading lines...</div>
                        ) : (
                            <>
                                <div className="mb-4 max-h-64 overflow-y-auto">
                                    {allLines.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">No production lines available.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {allLines.map(line => (
                                                <label
                                                    key={line.id}
                                                    className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={userLines.includes(line.id)}
                                                        onChange={() => handleToggleLine(line.id)}
                                                        className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                    />
                                                    <span className="text-gray-800 dark:text-white font-medium">{line.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLineAssignModalOpen(false);
                                            setAssignUserId(null);
                                            setUserLines([]);
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveLineAssignments}
                                        className="px-4 py-2 bg-primary hover:bg-green-600 text-white font-bold rounded"
                                    >
                                        Save Assignments
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Role Change Modal */}
            {roleChangeModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                            Change User Role - {roleChangeUsername}
                        </h3>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Select the role for this user:
                            </p>
                            <div className="space-y-3">
                                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedRole === 'USER'
                                    ? 'border-primary bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="USER"
                                        checked={selectedRole === 'USER'}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="mr-3 h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-800 dark:text-white">User</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Can view and edit assigned production lines only
                                        </div>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedRole === 'ADMIN'
                                    ? 'border-primary bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="ADMIN"
                                        checked={selectedRole === 'ADMIN'}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="mr-3 h-4 w-4 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-800 dark:text-white">Admin</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Full access to all features and user management
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setRoleChangeModalOpen(false);
                                    setRoleChangeUserId(null);
                                    setRoleChangeUsername("");
                                    setSelectedRole("");
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRoleChange}
                                className="px-4 py-2 bg-primary hover:bg-green-600 text-white font-bold rounded"
                            >
                                Update Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
