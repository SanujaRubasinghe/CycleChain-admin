'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiChevronRight, FiCheckCircle, FiDownload, FiArrowLeft, FiWifi, FiBattery, FiMapPin, FiLock, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBikes = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/fleet/mqtt/available-bikes');
        const data = await res.json();
        setAvailableBikes(data.bikes || []);
      } catch (err) {
        console.error('Failed to fetch available bikes', err);
        toast.error('Could not load available bikes');
      } finally {
        setIsLoading(false);
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
      lat: bike.gps?.lat,
      lng: bike.gps?.lng,
      isLocked: Boolean(bike.isLocked)
    });
  };

  const handleSubmit = async () => {
    if (!selectedBike) return toast.error('Please select a bike first');

    try {
      const res = await fetch('/api/fleet/bikes', {
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const stepVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">
            {step === 1 && 'Add New Bike'}
            {step === 2 && 'Confirm Bike Details'}
            {step === 3 && 'Registration Complete'}
          </h2>
          <button
            onClick={() => router.push('/fleet-management/bikes')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pt-4">
          <div className="flex justify-center">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      step > stepNumber ? 'bg-cyan-600' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              {step === 1 && (
                <div>
                  <p className="text-gray-400 mb-6 text-center">Select a bike from the available devices</p>
                  
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                      <p className="text-gray-400">Scanning for available bikes...</p>
                    </div>
                  ) : availableBikes.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 border border-gray-800 rounded-lg bg-gray-800/50"
                    >
                      <FiWifi className="text-4xl text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No bikes detected</p>
                      <p className="text-sm text-gray-500">Ensure the devices are powered on and connected</p>
                    </motion.div>
                  ) : (
                    <motion.ul
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3 max-h-96 overflow-y-auto pr-2"
                    >
                      {availableBikes.map((bike) => (
                        <motion.li
                          key={bike.bikeId}
                          variants={itemVariants}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedBike?.bikeId === bike.bikeId 
                              ? 'border-cyan-500 bg-cyan-500/10' 
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                          onClick={() => handleSelectBike(bike)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="font-medium text-white">{bike.name || bike.bikeId}</h3>
                                <span className="ml-3 px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                                  {bike.type}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <div className="flex items-center">
                                  <FiBattery className="mr-1" />
                                  <span>{bike.battery}%</span>
                                </div>
                                <div className="flex items-center">
                                  <FiMapPin className="mr-1" />
                                  <span>{bike.gps?.lat?.toFixed(4)}, {bike.gps?.lng?.toFixed(4)}</span>
                                </div>
                                <div className="flex items-center">
                                  <FiLock className="mr-1" />
                                  <span>{bike.isLocked ? 'Locked' : 'Unlocked'}</span>
                                </div>
                              </div>
                            </div>
                            
                            {selectedBike?.bikeId === bike.bikeId && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-4"
                              >
                                <FiCheckCircle className="text-cyan-400 w-6 h-6" />
                              </motion.div>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                  
                  <div className="flex justify-end mt-6">
                    <motion.button
                      disabled={!selectedBike}
                      onClick={() => setStep(2)}
                      whileHover={{ scale: selectedBike ? 1.05 : 1 }}
                      whileTap={{ scale: selectedBike ? 0.95 : 1 }}
                      className={`px-6 py-3 rounded-lg flex items-center font-medium ${
                        selectedBike 
                          ? 'bg-cyan-600 text-white hover:bg-cyan-500' 
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Continue <FiChevronRight className="ml-2" />
                    </motion.button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="text-gray-400 mb-6 text-center">Review the details before completing registration</p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 p-5 rounded-lg border border-gray-700 mb-6"
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Bike ID:</span>
                        <p className="text-white font-medium">{selectedBike?.bikeId}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <p className="text-white font-medium">{formData.name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="text-white font-medium capitalize">{formData.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <p className="text-white font-medium">
                          {formData.isLocked ? 'Locked' : 'Unlocked'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Location:</span>
                        <p className="text-white font-medium">
                          Lat {Number(formData.lat).toFixed(6)}, Lng {Number(formData.lng).toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="flex justify-between">
                    <motion.button
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 flex items-center"
                    >
                      <FiArrowLeft className="mr-2" /> Back
                    </motion.button>
                    <motion.button
                      onClick={handleSubmit}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium"
                    >
                      Complete Registration
                    </motion.button>
                  </div>
                </div>
              )}

              {step === 3 && qrCode && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
                  >
                    <FiCheckCircle className="h-8 w-8 text-green-400" />
                  </motion.div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">Bike Successfully Registered</h3>
                  <p className="text-gray-400 mb-8">The bike has been added to your fleet</p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 p-6 rounded-lg border border-gray-700 inline-block mb-8"
                  >
                    <img src={qrCode} alt="Bike QR Code" className="w-48 h-48 mx-auto" />
                    <p className="mt-4 font-medium text-white">{formData.name}</p>
                    <p className="text-sm text-gray-400">{selectedBike?.bikeId}</p>
                  </motion.div>
                  
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      onClick={() => router.push('/fleet-management/bikes')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    >
                      Return to Fleet
                    </motion.button>
                    <motion.a
                      href={qrCode}
                      download={`${formData.name.replace(/\s+/g, '-')}-QR.png`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center"
                    >
                      <FiDownload className="mr-2" /> Download QR
                    </motion.a>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}