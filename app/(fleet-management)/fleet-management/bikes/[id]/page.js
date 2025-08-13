'use client';
import React, { useRef } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiLock, FiUnlock, FiMapPin, FiBattery, FiCalendar, FiArrowLeft, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

export default function BikeDetail({ params }) {
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const qrCodeRef = useRef(null);

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

  const toggleLock = async () => {
    try {
      const res = await fetch(`/api/bikes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !bike.isLocked })
      });
      const updatedBike = await res.json();
      setBike(updatedBike);
      toast.success(`Bike ${!bike.isLocked ? 'locked' : 'unlocked'}`);
    } catch (error) {
      toast.error('Failed to update bike status');
    }
  };

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current).then(canvas => {
        const link = document.createElement('a');
        link.download = `${bike.name}-qrcode.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  useEffect(() => { fetchBike(); }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (!bike) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800">Bike not found</h2>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
        >
          Back to Inventory
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center hover:bg-green-700 p-2 rounded-full transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold">{bike.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            bike.status === 'available' ? 'bg-green-100 text-green-800' :
            bike.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {bike.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-green-100 mt-1">ID: {bike.bikeId}</p>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Bike Info Card */}
          <div className="bg-gray-50 rounded-xl p-5 shadow-xs border border-gray-100">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Bike Information</h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-white rounded-lg">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <FiBattery className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Battery Level</p>
                  <div className="flex items-center mt-1">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className={`h-2.5 rounded-full ${
                          bike.battery > 70 ? 'bg-green-500' :
                          bike.battery > 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${bike.battery}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">{bike.battery}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-white rounded-lg">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FiCalendar className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Maintenance</p>
                  <p className="font-medium mt-1">
                    {new Date(bike.lastMaintenance).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-gray-50 rounded-xl p-5 shadow-xs border border-gray-100">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Location</h3>
            <div className="flex items-center p-3 bg-white rounded-lg">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FiMapPin className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Position</p>
                <p className="font-medium mt-1">
                  {bike.currentLocation.lat.toFixed(6)}, {bike.currentLocation.lng.toFixed(6)}
                </p>
                <a 
                  href={`https://www.google.com/maps?q=${bike.currentLocation.lat},${bike.currentLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-800 mt-2 inline-block"
                >
                  View on Map
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Lock Control Card */}
          <div className="bg-gray-50 rounded-xl p-5 shadow-xs border border-gray-100">
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Bike Controls</h3>
            <button
              onClick={toggleLock}
              className={`w-full py-4 rounded-xl flex items-center justify-center transition-colors ${
                bike.isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              } text-white font-medium`}
            >
              {bike.isLocked ? (
                <>
                  <FiUnlock className="mr-3 text-xl" /> Unlock Bike
                </>
              ) : (
                <>
                  <FiLock className="mr-3 text-xl" /> Lock Bike
                </>
              )}
            </button>
          </div>

          {/* QR Code Card */}
          <div className="bg-gray-50 rounded-xl p-5 shadow-xs border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-gray-800">QR Code</h3>
              <button
                onClick={downloadQRCode}
                className="flex items-center text-green-600 hover:text-green-800"
              >
                <FiDownload className="mr-1" /> Download
              </button>
            </div>
            <div 
              ref={qrCodeRef}
              className="bg-white p-4 rounded-lg flex flex-col items-center"
            >
              <img 
                src={bike.qrCode} 
                alt="Bike QR Code" 
                className="w-48 h-48 object-contain"
              />
              <div className="mt-4 text-center">
                <p className="font-medium text-gray-800">{bike.name}</p>
                <p className="text-sm text-gray-500">ID: {bike.bikeId}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              Scan this code to unlock the bike
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}