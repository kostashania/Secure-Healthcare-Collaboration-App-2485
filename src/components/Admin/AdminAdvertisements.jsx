import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEye, FiCheck, FiX, FiEdit, FiTrash2, FiSearch, FiFilter } = FiIcons;

const AdminAdvertisements = () => {
  const { profile } = useAuth();
  const { advertisements, updateAdvertisement, deleteAdvertisement } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAds = advertisements.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.sponsor?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveAd = async (adId) => {
    await updateAdvertisement(adId, {
      status: 'approved',
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
      start_date: new Date().toISOString()
    });
  };

  const handleRejectAd = async (adId) => {
    await updateAdvertisement(adId, {
      status: 'rejected',
      approved_by: profile.id,
      approved_at: new Date().toISOString()
    });
  };

  const handleDeleteAd = async (adId) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      await deleteAdvertisement(adId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisement Management</h1>
          <p className="text-gray-600 mt-1">
            Review and manage sponsor advertisements
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {advertisements.filter(ad => ad.status === 'pending').length} pending approval
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search advertisements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Advertisements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAds.map((ad) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">{ad.title}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ad.status)}`}>
                {ad.status}
              </span>
            </div>

            {ad.image_url && (
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
            )}

            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{ad.content}</p>

            <div className="space-y-2 mb-4 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Sponsor:</span>
                <span className="font-medium">{ad.sponsor?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Impressions:</span>
                <span className="font-medium">{ad.total_impressions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Clicks:</span>
                <span className="font-medium">{ad.total_clicks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="font-medium">{new Date(ad.created_at).toLocaleDateString()}</span>
              </div>
              {ad.end_date && (
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="font-medium">{new Date(ad.end_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {ad.status === 'pending' && (
              <div className="flex space-x-2 mb-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApproveAd(ad.id)}
                  className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                  <span>Approve</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRejectAd(ad.id)}
                  className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                  <span>Reject</span>
                </motion.button>
              </div>
            )}

            <div className="flex space-x-2">
              {ad.status !== 'pending' && (
                <>
                  {ad.status === 'active' ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateAdvertisement(ad.id, { status: 'paused' })}
                      className="flex-1 bg-yellow-50 text-yellow-600 py-2 px-3 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium"
                    >
                      Pause
                    </motion.button>
                  ) : ad.status === 'paused' ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateAdvertisement(ad.id, { status: 'active' })}
                      className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                    >
                      Resume
                    </motion.button>
                  ) : null}
                </>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDeleteAd(ad.id)}
                className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        ))}

        {filteredAds.length === 0 && (
          <div className="col-span-full text-center py-12">
            <SafeIcon icon={FiEye} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No advertisements found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Advertisements will appear here when sponsors create them'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAdvertisements;