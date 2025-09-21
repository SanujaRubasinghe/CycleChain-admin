'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiMessageSquare, FiTool, FiHome, FiPieChart, FiSettings,
  FiUsers, FiCreditCard, FiCalendar, FiChevronDown,
  FiChevronRight, FiDownload, FiMenu,
  FiShoppingBag
} from 'react-icons/fi';
import { LuBike } from 'react-icons/lu';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSidebar } from '@/app/context/SidebarContext';

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar()
  const [openSections, setOpenSections] = useState({
    fleetManagement: true,
    userManagement: false,
    paymentManagement: false,
    reservationManagement: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const menuSections = [
    {
      id: 'fleetManagement',
      title: 'Fleet',
      icon: <LuBike className="text-lg" />,
      items: [
        { href: '/fleet-management', icon: <FiHome />, label: 'Dashboard' },
        { href: '/fleet-management/bikes', icon: <LuBike />, label: 'Bikes' },
        { href: '/fleet-management/analytics', icon: <FiPieChart />, label: 'Analytics' },
        { href: '/fleet-management/maintenance', icon: <FiTool />, label: 'Maintenance' },
      ],
    },
    {
      id: 'feedbackManagement',
      title: 'Feedback',
      icon: <FiMessageSquare className="text-lg" />,
      items: [{ href: '/feedback-management', icon: <FiHome />, label: 'Overview' }],
    },
    {
      id: 'userManagement',
      title: 'User',
      icon: <FiUsers className="text-lg" />,
      items: [
        { href: '/user-management/analytics', icon: <FiUsers />, label: 'Users Overview' },
        // { href: '/user-management/roles', icon: <FiSettings />, label: 'Roles & Permissions' },
        // { href: '/user-management/activity', icon: <FiPieChart />, label: 'User Activity' },
      ],
    },
    {
      id: 'paymentManagement',
      title: 'Payment',
      icon: <FiCreditCard className="text-lg" />,
      items: [
        { href: '/payment-management', icon: <FiHome />, label: 'Transactions' },
        { href: '/payment-management/invoices', icon: <FiCreditCard />, label: 'Invoices' },
        { href: '/payment-management/subscriptions', icon: <FiCalendar />, label: 'Subscriptions' },
      ],
    },
    {
      id: 'reservationManagement',
      title: 'Reservation',
      icon: <FiCalendar className="text-lg" />,
      items: [
        { href: '/reservation-management', icon: <FiHome />, label: 'Reservations' },
        { href: '/reservation-management/analysis', icon: <FiPieChart />, label: 'Analytics' },
        { href: '/reservation-management/reports', icon: <FiDownload />, label: 'Reports' },
      ],
    },
    {
      id: 'storeManagement',
      title: 'Store',
      icon: <FiShoppingBag className="text-lg" />,
      items: [
        { href: '/store-management', icon: <FiHome />, label: 'Overview' },
        // { href: '/reservation-management/analysis', icon: <FiPieChart />, label: 'Analytics' },
        // { href: '/reservation-management/reports', icon: <FiDownload />, label: 'Reports' },
      ],
    },
  ];

  const isSectionActive = (section) =>
    section.items.some(
      (item) => pathname === item.href || pathname.startsWith(item.href + '/')
    );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-10 border-r border-gray-800 
      bg-gradient-to-b from-gray-950 to-gray-900 shadow-lg overflow-y-auto
      transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-cyan-400">CycleChain</h1>
            <p className="text-xs text-gray-500">Management Portal</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-cyan-400 transition"
        >
          <FiMenu />
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-4 px-2">
        <ul className="space-y-2">
          {menuSections.map((section) => {
            const isActive = isSectionActive(section);
            const isOpen = openSections[section.id];

            return (
              <li key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`flex items-center justify-between w-full px-3 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{section.icon}</span>
                    {!collapsed && <span className="font-medium">{section.title}</span>}
                  </div>
                  {!collapsed &&
                    (isOpen ? <FiChevronDown className="text-sm" /> : <FiChevronRight className="text-sm" />)}
                </button>

                {/* Submenu */}
                {isOpen && !collapsed && (
                  <ul className="ml-6 mt-2 space-y-1 border-l border-gray-700 pl-3">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            pathname === item.href
                              ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                          }`}
                        >
                          <span className="mr-3 text-base">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-950/80 backdrop-blur-md`}
      >
        <Link
          href="/profile"
          className="flex items-center group hover:bg-gray-800 p-2 rounded-lg transition"
        >
          <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
            {session?.user?.username?.[0] || 'A'}
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-200 group-hover:text-cyan-400">
                {session?.user?.username || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
