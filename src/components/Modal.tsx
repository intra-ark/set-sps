import React from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'danger';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function Modal({
    isOpen,
    title,
    message,
    type = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
}: ModalProps) {
    if (!isOpen) return null;

    const colors = {
        info: 'bg-blue-600 hover:bg-blue-700',
        warning: 'bg-yellow-600 hover:bg-yellow-700',
        danger: 'bg-red-600 hover:bg-red-700'
    };

    const iconColors = {
        info: 'text-blue-600 bg-blue-100',
        warning: 'text-yellow-600 bg-yellow-100',
        danger: 'text-red-600 bg-red-100'
    };

    const icons = {
        info: 'info',
        warning: 'warning',
        danger: 'error_outline'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 animate-scale-in">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full shrink-0 ${iconColors[type]}`}>
                            <span className="material-icons-outlined text-2xl">{icons[type]}</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white font-medium shadow-lg shadow-gray-200 dark:shadow-none transition-all transform hover:-translate-y-0.5 ${colors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
