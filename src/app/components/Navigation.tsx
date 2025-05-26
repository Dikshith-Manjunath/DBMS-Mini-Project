'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const authStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(authStatus === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    router.push('/signin');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/database" className="text-white font-bold">
          Dashboard
        </Link>
        <div>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-300 transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link href="/signin" className="text-white hover:text-gray-300 transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}