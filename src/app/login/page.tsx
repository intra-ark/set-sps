"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid username or password");
        } else {
            router.push("/admin");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Login Form - Now First */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#3dcd58] rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl font-bold">SE</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">SET System Gate</h1>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3dcd58] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3dcd58] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#3dcd58] hover:bg-[#34b84c] text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                        >
                            Sign In
                        </button>
                    </form>
                </div>

                {/* Security Banner - Now Below Login */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-t-[5px] border-[#3dcd58] p-8 text-center">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-xl font-bold text-[#3dcd58] uppercase tracking-wide mb-4">
                        Yetkili Erişim
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                        Bu sistem <span className="font-bold text-gray-800 dark:text-white">Schneider Electric</span> mülkiyetindedir ve yalnızca yetkili iş kullanımı için tasarlanmıştır.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        Bu sistemdeki tüm aktiviteler güvenlik amaçlı kaydedilir ve izlenir. Yetkisiz erişim veya kötüye kullanım kesinlikle yasaktır ve yürürlükteki ulusal ve uluslararası siber güvenlik yasalarına tabidir.
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                        <p className="mb-2">Bu sistem aşağıdaki yasalar kapsamında korunmaktadır:</p>
                        <ul className="text-left space-y-1 pl-4">
                            <li>• GDPR (EU 2016/679)</li>
                            <li>• Computer Fraud and Abuse Act (CFAA)</li>
                            <li>• Computer Misuse Act 1990</li>
                            <li>• ISO/IEC 27001 Security Standards</li>
                        </ul>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-4">
                        Giriş yaparak Kabul Edilebilir Kullanım Politikasını ve yürürlükteki tüm güvenlik düzenlemelerini kabul etmiş olursunuz.
                    </div>
                </div>
            </div>
        </div>
    );
}
