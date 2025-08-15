'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiMap, FiPieChart, FiBike, FiSettings, FiUsers } from 'react-icons/fi';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/fleet-management', icon: <FiHome />, label: 'Dashboard' },
    { href: '/fleet-management/bikes', icon: <FiHome />, label: 'Bikes' },
    { href: '/fleet-management/analytics', icon: <FiPieChart />, label: 'Analytics' },
    { href: '/fleet-management/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  return (
    <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white shadow-sm z-10">
      <div className="p-6">
        <h1 className="text-xl font-bold text-green-600">CycleChain</h1>
      </div>
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg ${pathname === item.href ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}