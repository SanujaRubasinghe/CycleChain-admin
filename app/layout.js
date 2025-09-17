import { BikeProvider } from './(fleet-management)/context/BikeContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import 'leaflet/dist/leaflet.css'
import Sidebar from './(fleet-management)/components/Sidebar';
import EmergencyAlertModalWrapper from './(fleet-management)/components/EmergencyAlertWrapper';
import { initMqttStatusServer } from '@/lib/initMqtt';


initMqttStatusServer()

export const metadata = {
  title: "CycleChain - Admin Panel",
  description: "Fleet management for smart e-bikes",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-gray-100 transition-colors duration-200">
        {/* <EmergencyAlertModalWrapper/> */}
        <BikeProvider>
          <div className="lg:pl-64">
            <Sidebar />

            <main className="min-h-screen">
              {children}
            </main>

          </div>
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'bg-gray-800 text-gray-100 border border-gray-700',
              success: {
                className: 'bg-green-900 text-green-100 border-green-700',
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#ECFDF5',
                },
              },
              error: {
                className: 'bg-rose-900 text-rose-100 border-rose-700',
                iconTheme: {
                  primary: '#F43F5E',
                  secondary: '#FDF2F2',
                },
              },
            }}
          />
        </BikeProvider>
      </body>
    </html>
  );
}