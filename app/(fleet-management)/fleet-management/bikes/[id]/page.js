'use client';
import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiLock, FiUnlock, FiMapPin, FiBattery, FiCalendar, FiArrowLeft, FiDownload, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import MaintenanceForm from '@/app/(fleet-management)/components/MaintenanceForm';

export default function BikeDetail({ params }) {
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const qrCodeRef = useRef(null);

  const [maintenanceForm, setMaintenanceForm] = useState({
    issue: "",
    notes: "",
    cost: "",
  })

  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false)

  const { id } = React.use(params);

  const fetchBike = async () => {
    try {
      const res = await fetch(`/api/fleet/bikes/${id}`);
      const data = await res.json();
      setBike(data);
    } catch (error) {
      toast.error('Failed to fetch bike details');
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async () => {
    if (bike.status === 'offline') return;
    try {
      const res = await fetch(`/api/fleet/bikes/${id}`, {
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
    if (bike.status === 'offline') return;
    if (qrCodeRef.current) {
      html2canvas(qrCodeRef.current).then(canvas => {
        const link = document.createElement('a');
        link.download = `${bike.name}-qrcode.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('QR Code downloaded successfully');
      });
    }
  };

  const handleDeleteBike = async () => {
    if (bike.status === 'offline') return;
    if (!adminPassword) {
      toast.error('Please enter admin password');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/fleet/bikes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword })
      });

      if (res.ok) {
        toast.success('Bike deleted successfully');
        router.push('/fleet-management/bikes');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to delete bike');
      }
    } catch (error) {
      toast.error('Failed to delete bike');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setAdminPassword('');
    }
  };

  const handleMaintenanceChange = (e) => {
    const {name, value} = e.target
    setMaintenanceForm((prev) => ({...prev, [name]: value}))
  }

  const handleSaveMaintenance = async () => {
    if (!maintenanceForm.issue) {
      toast.error("Issue description is required")
      return;
    }
    setIsSavingMaintenance(true)
    try {
      const res = await fetch(`/api/fleet/maintenance/post`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          bike_id: bike.bikeId,
          ...maintenanceForm,
          cost: maintenanceForm.cost ? Number(maintenanceForm.cost) : 0,
        })
      })

      if (res.ok) {
        toast.success("Maintenance record added")
        setShowMaintenanceModal(false)
        setMaintenanceForm({
          issue: "",
          notes: "",
          cost: "",
        })
      } else {
        const error = (await res).json()
        toast.error(error.message || "Failed to save maintenance")
      }
    } catch (err) {
      toast.error("Failed to save maintenance")
    } finally {
      setIsSavingMaintenance(false)
    }
  }

  useEffect(() => { fetchBike(); }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
  );

  if (!bike) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Bike not found</h2>
        <button 
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 transition-colors"
        >
          Back to Inventory
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4 lg:p-8 relative">
      {/* Offline Modal */}
      {/* {bike.status === 'offline' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-rose-500/40 shadow-lg text-center animate-fade-in">
            <h3 className="text-2xl font-bold text-rose-400 mb-4">Bike Offline</h3>
            <p className="text-gray-300 mb-4">
              This bike is currently offline. All actions are temporarily disabled until the bike reconnects.
            </p>
            <button
              onClick={fetchBike}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )} */}

      {showMaintenanceModal && (
        <MaintenanceForm 
          record={{bikeId: bike.bikeId}}
          onClose={() => setShowMaintenanceModal(false)}
        />
      )}

      <div className={`max-w-6xl mx-auto `}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-400 hover:text-white p-2 transition-colors mr-4"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-white">{bike.name}</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-400">ID: {bike.bikeId}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              bike.status === 'available' ? 'bg-green-500/20 text-green-400' :
              bike.status === 'in_use' ? 'bg-blue-500/20 text-blue-400' :
              bike.status === 'offline' ? 'bg-rose-500/20 text-rose-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {bike.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Bike Info Card */}
            <div className="bg-gray-800 rounded-xl p-5 shadow-md transition-opacity duration-300">
              <h3 className="font-semibold text-lg text-white mb-4">Bike Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-cyan-500/20 p-2 rounded-lg mr-3">
                    <FiBattery className="text-cyan-400 text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Battery Level</p>
                    <div className="flex items-center mt-1">
                      <div className="w-32 bg-gray-700 rounded-full h-2 mr-3">
                        <div 
                          className={`h-2 rounded-full ${
                            bike.battery > 70 ? 'bg-green-500' :
                            bike.battery > 30 ? 'bg-amber-500' : 'bg-rose-500'
                          }`} 
                          style={{ width: `${bike.battery}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-white text-sm">{bike.battery}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-purple-500/20 p-2 rounded-lg mr-3">
                    <FiCalendar className="text-purple-400 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Maintenance</p>
                    <p className="font-medium text-white text-sm mt-1">
                      {new Date(bike.lastMaintenance).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-gray-800 rounded-xl p-5 shadow-md transition-opacity duration-300">
              <h3 className="font-semibold text-lg text-white mb-4">Location</h3>
              <div className="flex items-center">
                <div className="bg-rose-500/20 p-2 rounded-lg mr-3">
                  <FiMapPin className="text-rose-400 text-lg" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Current Position</p>
                  <p className="font-medium text-white text-sm mt-1">
                    {bike.currentLocation.lat.toFixed(6)}, {bike.currentLocation.lng.toFixed(6)}
                  </p>
                  <a 
                    href={`https://www.google.com/maps?q=${bike.currentLocation.lat},${bike.currentLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-cyan-400 hover:text-cyan-300 mt-2 inline-flex items-center transition-colors"
                  >
                    View on Map <FiExternalLink className="ml-1 text-xs" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Lock Control Card */}
            <div className="bg-gray-800 rounded-xl p-5 shadow-md transition-opacity duration-300">
              <h3 className="font-semibold text-lg text-white mb-4">Bike Controls</h3>
              <button
                onClick={toggleLock}
                disabled={bike.status === 'offline'}
                className={`w-full py-3 rounded-lg flex items-center justify-center transition-colors ${
                  bike.isLocked 
                    ? 'bg-emerald-600 hover:bg-emerald-500' 
                    : 'bg-rose-600 hover:bg-rose-500'
                } text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {bike.isLocked ? (
                  <>
                    <FiUnlock className="mr-2" /> Unlock Bike
                  </>
                ) : (
                  <>
                    <FiLock className="mr-2" /> Lock Bike
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 mt-3 text-center">
                {bike.isLocked 
                  ? 'Bike is currently locked' 
                  : 'Bike is unlocked'
                }
              </p>
            </div>

            {/* Mark Maintenance button */}
            <div className='bg-gray-800 rounded-xl p-5 shadow-md transition-opacity duration-300'>
              <h3 className='font-semibold text-lg text-white mb-4'>Maintenance</h3>
              <button
                onClick={() => setShowMaintenanceModal(true)}
                // disabled={bike.status === 'offline'}
                className='w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <FiCalendar className='mr-2'/> Mark for Maintenance
              </button>
            </div>

            {/* QR Code */}
            <div className="bg-gray-800 rounded-xl p-5 shadow-md transition-opacity duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-white">QR Code</h3>
                <button
                  onClick={downloadQRCode}
                  disabled={bike.status === 'offline'}
                  className="flex items-center text-cyan-400 hover:text-cyan-300 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiDownload className="mr-1" /> Download
                </button>
              </div>
              <div 
                ref={qrCodeRef}
                className="bg-gray-900 p-4 rounded-lg flex flex-col items-center"
              >
                <img 
                  src={bike.qrCode} 
                  alt="Bike QR Code" 
                  className="w-40 h-40 object-contain"
                />
                <div className="mt-3 text-center">
                  <p className="font-medium text-white text-sm">{bike.name}</p>
                  <p className="text-xs text-gray-400">ID: {bike.bikeId}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">
                Scan to unlock the bike
              </p>
            </div>

            {/* Danger Zone */}
            <div className="bg-gray-800 rounded-xl p-5 border border-rose-500/30 shadow-md transition-opacity duration-300">
              <h3 className="font-semibold text-lg text-white mb-4 text-rose-400">Danger Zone</h3>
              <p className="text-sm text-gray-400 mb-4">
                Permanently remove this bike from the fleet. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={bike.status === 'offline'}
                className="w-full py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTrash2 className="mr-2" /> Delete Bike
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-rose-500/30 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Confirm Deletion</h3>
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to delete <span className="font-medium text-white">{bike.name}</span>? 
              This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password to confirm"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAdminPassword('');
                }}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBike}
                disabled={isDeleting || !adminPassword}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
