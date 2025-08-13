'use client';
import { motion } from 'framer-motion';
import { FiBattery, FiCalendar, FiDownload, FiMapPin } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function BikeCard({ bike }) {
  const [showQR, setShowQR] = useState(false);

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-${bike.id}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        saveAs(blob, `${bike.name}-qrcode.png`);
        toast.success('QR Code downloaded!');
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    in_use: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{bike.name}</h3>
            <p className="text-sm text-gray-500">ID: {bike.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[bike.status]}`}>
            {bike.status.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-3 mt-4">
          <div className="flex items-center text-sm text-gray-600">
            <FiBattery className="mr-2 text-gray-500" />
            <span>Battery: {bike.battery}%</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar className="mr-2 text-gray-500" />
            <span>Last Maintenance: {bike.lastMaintenance}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiMapPin className="mr-2 text-gray-500" />
            <span>Location: {bike.location.lat?.toFixed(4)}, {bike.location.lng?.toFixed(4)}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowQR(!showQR)}
            className="text-sm text-green-600 hover:text-green-800 font-medium"
          >
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </button>

          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-col items-center"
            >
              <QRCodeSVG
                id={`qr-${bike.id}`}
                value={`bike://${bike.id}`}
                size={128}
                level="H"
                includeMargin={true}
                className="mb-2"
              />
              <button
                onClick={downloadQRCode}
                className="text-sm text-green-600 hover:text-green-800 flex items-center"
              >
                <FiDownload className="mr-1" />
                Download QR Code
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}