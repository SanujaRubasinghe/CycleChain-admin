// app/layout.jsx
import ClientProviders from './components/ClientProviders';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { initMqttStatusServer } from '@/lib/initMqtt';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

initMqttStatusServer();

export default async function RootLayout({ children }) {
  // const session = await getServerSession(authOptions)
  // if (!session) {
  //   redirect('/auth/login')
  // }
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-gray-100 transition-colors duration-200">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
