'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiMap, FiPieChart, FiBike, FiSettings, FiUsers } from 'react-icons/fi';
import { LuBike } from 'react-icons/lu';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/fleet-management', icon: <FiHome />, label: 'Dashboard' },
    { href: '/fleet-management/bikes', icon: <LuBike />, label: 'Bikes' },
    { href: '/fleet-management/analytics', icon: <FiPieChart />, label: 'Analytics' },
    { href: '/fleet-management/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  return (
    <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 z-10">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-cyan-400">CycleChain</h1>
        <p className="text-xs text-gray-500 mt-1">Fleet Management</p>
      </div>
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  pathname === item.href 
                    ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {pathname === item.href && (
                  <span className="ml-auto w-2 h-2 bg-cyan-400 rounded-full"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Additional section for user/profile if needed */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400 font-semibold">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-200">Admin User</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}