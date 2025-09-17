"use client";

import { BikeProvider } from './(fleet-management)/context/BikeContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Sidebar from './(fleet-management)/components/Sidebar';
import EmergencyAlert from './(fleet-management)/components/EmergencyAlert';
import { useJsApiLoader } from '@react-google-maps/api';


export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <BikeProvider>
          <div className="lg:pl-64">
            <Sidebar />
            {/* <EmergencyAlert /> */}
            {children}
          </div>
          <Toaster position="top-right" />
        </BikeProvider>
      </body>
    </html>
  );
}
