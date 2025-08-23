import { BikeProvider } from './(fleet-management)/context/BikeContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Sidebar from './(fleet-management)/components/Sidebar';
// EmergencyAlert can be added back later

export const metadata = {
  title: "Smart E-Bike System",
  description: "Fleet management for smart e-bikes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <BikeProvider>
          <div className="lg:pl-64">
            <Sidebar />
            {children}
          </div>
          <Toaster position="top-right" />
        </BikeProvider>
      </body>
    </html>
  );
}
