'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

// Dashboard stat card component
const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-t-4 ${color}`}>
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-opacity-10 mr-4" style={{ backgroundColor: `${color}30` }}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

// Quick action button component
const ActionButton = ({ title, icon, href, color }: { title: string, icon: string, href: string, color: string }) => (
  <Link href={href} className={`flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${color} text-center`}>
    <span className="text-3xl mb-2">{icon}</span>
    <span className="font-medium">{title}</span>
  </Link>
);

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const authStatus = localStorage.getItem('isLoggedIn');
    setIsAuthenticated(authStatus === 'true');
    
    if (authStatus !== 'true') {
      router.push('/signin');
      return;
    }

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        // You could replace this with actual API calls to your endpoints
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setStats({
          totalSales: 857,
          totalProducts: 15,
          totalCategories: 3,
          totalCustomers: 42
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-lg text-gray-700 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div>
            <button 
              onClick={() => {
                localStorage.removeItem('isLoggedIn');
                router.push('/signin');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Sales" value={stats.totalSales} icon="💰" color="border-blue-500" />
          <StatCard title="Products" value={stats.totalProducts} icon="📦" color="border-green-500" />
          <StatCard title="Categories" value={stats.totalCategories} icon="🏷️" color="border-yellow-500" />
          <StatCard title="Customers" value={stats.totalCustomers} icon="👥" color="border-purple-500" />
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <ActionButton title="View Database" icon="🗃️" href="/database" color="text-blue-600 dark:text-blue-400" />
          <ActionButton title="Run Queries" icon="🔍" href="/queries" color="text-green-600 dark:text-green-400" />
          <ActionButton title="View Reports" icon="📊" href="/reports" color="text-orange-600 dark:text-orange-400" />
          <ActionButton title="User Settings" icon="⚙️" href="/settings" color="text-gray-600 dark:text-gray-400" />
        </div>

        {/* Recent Activity */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">New product added: <span className="font-medium">Premium Package</span></p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">Database query executed: <span className="font-medium">Sales by Category</span></p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">User <span className="font-medium">John Doe</span> logged in</p>
                <p className="text-xs text-gray-500">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}