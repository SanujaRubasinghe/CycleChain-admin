'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronRight, FiCheckCircle, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AddBikeForm() {
  const [step, setStep] = useState(1);
  const [availableBikes, setAvailableBikes] = useState([]);
  const [selectedBike, setSelectedBike] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'city',
    lat: null,
    lng: null,
    isLocked: null
  });
  const [qrCode, setQrCode] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        const res = await fetch('/api/mqtt/available-bikes');
        const data = await res.json();
        setAvailableBikes(data.bikes);
        console.log("available bikes:",availableBikes)
      } catch (err) {
        console.error('Failed to fetch available bikes', err);
        toast.error('Could not load available bikes');
      }
    };

    fetchBikes();
    const interval = setInterval(fetchBikes, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleSelectBike = (bike) => {
    setSelectedBike(bike);
    setFormData({
      ...formData,
      name: bike.name || bike.bikeId,
      type: bike.type || 'city',
      lat: bike.gps.lat,
      lng: bike.gps.lng,
      isLocked: Boolean(bike.isLocked)
    });
  };

  const handleSubmit = async () => {
    if (!selectedBike) return toast.error('Please select a bike first');

    try {
      const res = await fetch('/api/bikes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, bikeId: selectedBike.bikeId })
      });
      const newBike = await res.json();
      setQrCode(newBike.qrCode);
      setStep(3);
      toast.success('Bike successfully registered');
    } catch (err) {
      console.error(err);
      toast.error('Failed to register bike');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden p-6">
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Select an Available Bike</h2>
          {availableBikes.length === 0 ? (
            <p className="text-gray-500">No bikes available right now. Ensure the devices are powered on.</p>
          ) : (
            <ul className="space-y-2">
              {availableBikes.map((bike) => (
                <li
                  key={bike.bikeId}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedBike?.bikeId === bike.bikeId ? 'border-green-600 bg-green-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectBike(bike)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{bike.name || bike.bikeId}</p>
                      <p className="text-sm text-gray-500">Type: {bike.type}</p>
                      <p className="text-xs text-gray-400">
                        Battery: {bike.battery}% | Lat: {bike.gps.lat} Lng: {Number(bike.gps.lng).toFixed(4)}
                      </p>
                    </div>
                    {selectedBike?.bikeId === bike.bikeId && <FiCheckCircle className="text-green-600 w-6 h-6" />}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end mt-4">
            <button
              disabled={!selectedBike}
              onClick={() => setStep(2)}
              className={`px-6 py-2 rounded-lg flex items-center ${
                selectedBike ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue <FiChevronRight className="ml-2" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Confirm Registration</h2>
          <p className="text-gray-600 mb-4">Ensure the details are correct before completing the registration.</p>
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <p><strong>Bike ID:</strong> {selectedBike.bikeId}</p>
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Type:</strong> {formData.type}</p>
            <p><strong>Location:</strong> Lat {Number(formData.lat).toFixed(4)}, Lng {Number(formData.lng).toFixed(4)}</p>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Complete Registration
            </button>
          </div>
        </div>
      )}

      {step === 3 && qrCode && (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Bike Successfully Registered</h2>
          <p className="text-sm text-gray-600 mb-6">The bike has been added to your fleet. Download the QR code for deployment.</p>
          <div className="bg-white p-6 rounded-lg border border-gray-200 inline-block mb-6">
            <img src={qrCode} alt="Bike QR Code" className="w-48 h-48 mx-auto" />
            <p className="mt-3 font-medium text-gray-800">{formData.name}</p>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/fleet-management/bikes')}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
            >
              Return to Fleet
            </button>
            <a
              href={qrCode}
              download={`${formData.name.replace(/\s+/g, '-')}-QR.png`}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
            >
              <FiDownload className="mr-2" /> Download QR
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
