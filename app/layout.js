// app/layout.jsx
import ClientProviders from './components/ClientProviders';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { initMqttStatusServer } from '@/lib/initMqtt';

initMqttStatusServer();

export default function RootLayout({ children }) {
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
