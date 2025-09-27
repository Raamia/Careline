'use client';

import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Header() {
  const { user, error, isLoading } = useUser();

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/croppedcarline.png"
              alt="Careline"
              width={256}
              height={98}
              className="h-12 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how-it-works')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              How it Works
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isLoading && !error && (
              <div className="text-gray-600">Loading...</div>
            )}
            {user ? (
              // Authenticated state
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Hello, {user.name}
                </span>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a
                      href="/api/auth/logout"
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Logout
                    </a>
              </div>
            ) : (
              // Unauthenticated state (show buttons even if there's an error)
              <>
                <a
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md transition-colors"
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
