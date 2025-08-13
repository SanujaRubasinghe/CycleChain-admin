'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronRight, FiMapPin, FiBike, FiCheckCircle, FiDownload } from 'react-icons/fi';
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

  const steps = [
    { id: 1, name: 'Basic Information', status: step > 1 ? 'complete' : 'current' },
    { id: 2, name: 'Location Setup', status: step === 2 ? 'current' : step > 2 ? 'complete' : 'upcoming' },
    { id: 3, name: 'Registration Complete', status: step === 3 ? 'current' : 'upcoming' }
  ];

  const handleLocationFetch = async () => {
    toast.loading('Acquiring device location...');
    try {
      // In production, this would come from your ESP32 endpoint
      const mockLocation = {
        lat: 40.7128 + (Math.random() * 0.01 - 0.005),
        lng: -74.0060 + (Math.random() * 0.01 - 0.005)
      };
      setFormData({ ...formData, ...mockLocation });
      toast.success('Device location acquired successfully');
    } catch (error) {
      toast.error('Failed to connect to device location service');
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
      toast.success('Bike successfully added to fleet');
    } catch (error) {
      toast.error('Failed to register bike in system');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Add New Bike to Fleet</h1>
        <p className="text-sm text-gray-600 mt-1">Register a new bike in the management system</p>
      </div>

      {/* Progress Steps */}
      <nav className="px-6 py-4 border-b border-gray-200">
        <ol className="flex items-center">
          {steps.map((stepItem, index) => (
            <li key={stepItem.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
              <div className="flex items-center">
                {stepItem.status === 'complete' ? (
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-500 rounded-full">
                    <FiCheckCircle className="w-5 h-5 text-white" />
                  </div>
                ) : stepItem.status === 'current' ? (
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-green-500 rounded-full bg-white">
                    <span className="h-2.5 w-2.5 bg-green-500 rounded-full"></span>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-full bg-white">
                    <span className="h-2.5 w-2.5 bg-transparent rounded-full"></span>
                  </div>
                )}
                <span className={`ml-3 text-sm font-medium ${
                  stepItem.status === 'complete' ? 'text-green-600' :
                  stepItem.status === 'current' ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {stepItem.name}
                </span>
              </div>
              {index !== steps.length - 1 && (
                <div className="absolute top-4 right-0 w-6 sm:w-16 h-0.5 bg-gray-200" aria-hidden="true"></div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form Content */}
      <div className="p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Bike Identification</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bike Name/Identifier*</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g. NYC-CityBike-001"
                  />
                  <p className="mt-1 text-xs text-gray-500">This will be displayed to users and in reports</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bike Category*</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="city">City Bike</option>
                    <option value="mountain">Mountain Bike</option>
                    <option value="electric">Electric Bike</option>
                    <option value="premium">Premium Bike</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.name}
                className={`px-6 py-2 rounded-lg flex items-center ${
                  formData.name ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                } transition-colors`}
              >
                Continue <FiChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Device Configuration</h2>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <h3 className="font-medium text-blue-800 mb-2">Device Connection Instructions</h3>
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                  <li>Ensure the bike's IoT device is powered on</li>
                  <li>Verify the device is connected to your network</li>
                  <li>Place the bike in its intended deployment location</li>
                  <li>Click "Acquire Location" below to register coordinates</li>
                </ol>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleLocationFetch}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <FiMapPin className="mr-2" /> Acquire Device Location
                </button>

                {formData.lat && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center text-green-800">
                      <FiCheckCircle className="mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Location successfully registered</p>
                        <p className="text-sm mt-1 font-mono">Lat: {formData.lat.toFixed(6)}, Lng: {formData.lng.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.lat}
                className={`px-6 py-2 rounded-lg flex items-center ${
                  formData.lat ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                } transition-colors`}
              >
                Complete Registration <FiChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && qrCode && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <FiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Bike Successfully Registered</h2>
            <p className="text-sm text-gray-600 mb-6">
              The bike has been added to your fleet management system. Download the QR code for deployment.
            </p>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 inline-block mb-6">
              <img src={qrCode} alt="Bike QR Code" className="w-48 h-48 mx-auto" />
              <p className="mt-3 font-medium text-gray-800">{formData.name}</p>
              <p className="text-xs text-gray-500">ID: {formData.type.toUpperCase()}-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/fleet-management/bikes')}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              >
                Return to Fleet
              </button>
              <a
                href={qrCode}
                download={`${formData.name.replace(/\s+/g, '-')}-QR.png`}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
              >
                <FiDownload className="mr-2" /> Download QR
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}