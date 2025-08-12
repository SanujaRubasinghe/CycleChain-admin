'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronRight, FiMapPin, FiBike } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AddBikeForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'city',
    lat: null,
    lng: null
  });
  const [qrCode, setQrCode] = useState(null);
  const router = useRouter();

  const handleLocationFetch = async () => {
    toast.loading('Fetching GPS location...');
    try {
      // In production, this would come from your ESP32 endpoint
      const mockLocation = {
        lat: 40.7128 + (Math.random() * 0.01 - 0.005),
        lng: -74.0060 + (Math.random() * 0.01 - 0.005)
      };
      setFormData({ ...formData, ...mockLocation });
      toast.success('Location acquired!');
    } catch (error) {
      toast.error('Failed to get location');
    } finally {
      toast.dismiss();
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/bikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const newBike = await res.json();
      setQrCode(newBike.qrCode);
      setStep(3);
      toast.success('Bike registered successfully!');
    } catch (error) {
      toast.error('Failed to register bike');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Register New Bike</h1>
      
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bike Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. City Bike 001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bike Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="city">City Bike</option>
              <option value="mountain">Mountain Bike</option>
              <option value="electric">Electric Bike</option>
            </select>
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!formData.name}
            className={`w-full mt-6 py-2 rounded-lg flex items-center justify-center ${
              formData.name ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue <FiChevronRight className="ml-2" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              Ensure your ESP32 device is powered on and connected to the network. 
              We'll attempt to fetch the current GPS location.
            </p>
            <button
              onClick={handleLocationFetch}
              className="w-full py-2 bg-green-600 text-white rounded-lg flex items-center justify-center"
            >
              <FiMapPin className="mr-2" /> Fetch Current Location
            </button>
          </div>

          {formData.lat && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                Location acquired: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.lat}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center ${
                formData.lat ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Register Bike <FiChevronRight className="ml-2" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && qrCode && (
        <div className="space-y-6 text-center">
          <h2 className="text-lg font-semibold text-gray-800">Bike Registration Complete!</h2>
          <p className="text-sm text-gray-600">
            Download the QR code to use for bike unlocking:
          </p>
          <img src={qrCode} alt="Bike QR Code" className="mx-auto" />
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/dashboard/bikes')}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg"
            >
              Done
            </button>
            <a
              href={qrCode}
              download={`${formData.name}-qrcode.png`}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg flex items-center justify-center"
            >
              Download QR
            </a>
          </div>
        </div>
      )}
    </div>
  );
}