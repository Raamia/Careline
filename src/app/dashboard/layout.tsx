'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, User, LogOut, Stethoscope, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
    
    // TODO: Get user role from database based on email
    // For now, we'll mock this based on URL or user metadata
    if (user) {
      // This would be replaced with actual role lookup from database
      const role = user.email?.includes('doctor') ? 'doctor' : 'patient';
      setUserRole(role);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting
  }

  const sidebarItems = userRole === 'doctor' ? [
    {
      name: 'Incoming Referrals',
      href: '/dashboard/referrals',
      icon: FileText,
    },
    {
      name: 'Schedule',
      href: '/dashboard/schedule',
      icon: Calendar,
    },
  ] : [
    {
      name: 'My Referrals',
      href: '/dashboard/referrals',
      icon: FileText,
    },
    {
      name: 'Appointments',
      href: '/dashboard/appointments',
      icon: Calendar,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500 mr-2" />
              <span className="text-2xl font-bold text-gray-900">CareLine</span>
              <span className="ml-4 text-sm text-gray-500">
                {userRole === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                {userRole === 'doctor' ? (
                  <Stethoscope className="h-4 w-4 mr-2" />
                ) : (
                  <User className="h-4 w-4 mr-2" />
                )}
                {user.name || user.email}
              </div>
              <a href="/api/auth/logout">
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r">
          <div className="p-6">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
