'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMessageSquare,FiTool, FiHome, FiPieChart, FiSettings, FiUsers, FiCreditCard, FiCalendar, FiChevronDown, FiChevronRight, FiDownload } from 'react-icons/fi';
import { LuBike } from 'react-icons/lu';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState({
    fleetManagement: true,
    userManagement: false,
    paymentManagement: false,
    reservationManagement: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Menu sections configuration
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
      ]
    },
    {
      id: 'feedbackManagement',
      title: 'Feedback',
      icon: <FiMessageSquare className="text-lg" />,
      items: [
        { href: '/feedback-management', icon: <FiHome />, label: 'Overview' },
      ]
    },
    {
      id: 'userManagement',
      title: 'User',
      icon: <FiUsers className="text-lg" />,
      items: [
        { href: '/user-management', icon: <FiUsers />, label: 'Users Overview' },
        { href: '/user-management/roles', icon: <FiSettings />, label: 'Roles & Permissions' },
        { href: '/user-management/activity', icon: <FiPieChart />, label: 'User Activity' },
      ]
    },
    {
      id: 'paymentManagement',
      title: 'Payment',
      icon: <FiCreditCard className="text-lg" />,
      items: [
        { href: '/payment-management', icon: <FiHome />, label: 'Transactions' },
        { href: '/payment-management/invoices', icon: <FiCreditCard />, label: 'Invoices' },
        { href: '/payment-management/subscriptions', icon: <FiCalendar />, label: 'Subscriptions' },
      ]
    },
    {
      id: 'reservationManagement',
      title: 'Reservation',
      icon: <FiCalendar className="text-lg" />,
      items: [
        { href: '/reservation-management', icon: <FiHome />, label: 'Reservations' },
        { href: '/reservation-management/analysis', icon: <FiPieChart />, label: 'Analytics' },
        { href: '/reservation-management/reports', icon: <FiDownload />, label: 'Reports' },
      ]
    }
  ];

  // Check if any item in a section is active
  const isSectionActive = (section) => {
    return section.items.some(item => 
      pathname === item.href || pathname.startsWith(item.href + '/')
    );
  };

  return (
    <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 z-10 overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-cyan-400">CycleChain</h1>
        <p className="text-xs text-gray-500 mt-1">Management Portal</p>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {menuSections.map((section) => {
            const isActive = isSectionActive(section);
            const isOpen = openSections[section.id];
            
            return (
              <li key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  {isOpen ? (
                    <FiChevronDown className="text-sm" />
                  ) : (
                    <FiChevronRight className="text-sm" />
                  )}
                </button>
                
                {/* Submenu Items */}
                {isOpen && (
                  <ul className="ml-6 mt-2 space-y-2 border-l border-gray-700 pl-3">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                            pathname === item.href 
                              ? 'bg-cyan-500/10 text-cyan-400' 
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
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Additional section for user/profile if needed */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900">
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