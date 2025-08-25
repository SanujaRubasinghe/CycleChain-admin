'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBattery, FiCalendar, FiDownload, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function BikeCard({ params }) {
  const [showQR, setShowQR] = useState(false);
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = React.use(params);

  const fetchBike = async () => {
    try {
      const res = await fetch(`/api/bikes/${id}`);
      const data = await res.json();
      setBike(data);
    } catch (error) {
      toast.error('Failed to fetch bike details');
    } finally {
      setLoading(false);
    }
  };

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
    available: 'bg-green-500/20 text-green-400 border-green-500/30',
    in_use: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    maintenance: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <div className="w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">{bike.name}</h3>
            <p className="text-sm text-gray-400">ID: {bike.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[bike.status]}`}>
            {bike.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
            <div className="p-2 bg-gray-700 rounded-md mr-3">
              <FiBattery className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Battery</p>
              <p className="text-white font-medium">{bike.battery}%</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
            <div className="p-2 bg-gray-700 rounded-md mr-3">
              <FiCalendar className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Maintenance</p>
              <p className="text-white font-medium">{bike.lastMaintenance}</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
            <div className="p-2 bg-gray-700 rounded-md mr-3">
              <FiMapPin className="text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Location</p>
              <p className="text-white font-medium">{bike.location.lat?.toFixed(4)}, {bike.location.lng?.toFixed(4)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
            <motion.span
              animate={{ rotate: showQR ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-1"
            >
              <FiArrowRight />
            </motion.span>
          </button>

          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 flex flex-col items-center"
              >
                <div className="p-4 bg-white rounded-lg mb-4">
                  <QRCodeSVG
                    id={`qr-${bike.id}`}
                    value={`bike://${bike.id}`}
                    size={160}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <button
                  onClick={downloadQRCode}
                  className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                >
                  <FiDownload className="mr-2" />
                  Download QR Code
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}