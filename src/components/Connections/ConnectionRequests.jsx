import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUserCheck, FiUserPlus, FiCheck, FiX, FiSearch, FiUsers, FiMessageSquare } = FiIcons;

const ConnectionRequests = () => {
  const { profile } = useAuth();
  const { 
    users, 
    connectionRequests, 
    userConnections,
    createConnectionRequest,
    approveConnectionRequest,
    rejectConnectionRequest
  } = useData();

  const [activeTab, setActiveTab] = useState('received');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  // Filter requests
  const receivedRequests = connectionRequests.filter(req => 
    req.target_id === profile.id && req.status === 'pending'
  );

  const sentRequests = connectionRequests.filter(req => 
    req.requester_id === profile.id
  );

  // Get available users to connect with
  const getAvailableUsers = () => {
    const connectedUserIds = userConnections
      .filter(conn => conn.patient_id === profile.id || conn.provider_id === profile.id)
      .map(conn => conn.patient_id === profile.id ? conn.provider_id : conn.patient_id);

    const pendingRequestUserIds = connectionRequests
      .filter(req => req.requester_id === profile.id || req.target_id === profile.id)
      .map(req => req.requester_id === profile.id ? req.target_id : req.requester_id);

    return users.filter(user => {
      if (user.id === profile.id) return false;
      if (connectedUserIds.includes(user.id)) return false;
      if (pendingRequestUserIds.includes(user.id)) return false;

      // Connection rules
      if (profile.role === 'patient') {
        return user.role === 'doctor' || user.role === 'nurse';
      } else if (profile.role === 'doctor') {
        return user.role === 'patient' || user.role === 'nurse';
      } else if (profile.role === 'nurse') {
        return user.role === 'patient' || user.role === 'doctor';
      }

      return false;
    }).filter(user => 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleSendRequest = async () => {
    if (!selectedUser) return;

    const result = await createConnectionRequest(
      selectedUser.id,
      selectedUser.role,
      requestMessage
    );

    if (result.success) {
      setShowRequestModal(false);
      setSelectedUser(null);
      setRequestMessage('');
    }
  };

  const handleApprove = async (requestId) => {
    await approveConnectionRequest(requestId);
  };

  const handleReject = async (requestId) => {
    await rejectConnectionRequest(requestId);
  };

  const canApproveRequest = (request) => {
    // Admin and office manager can approve all requests
    if (profile.role === 'admin' || profile.role === 'office_manager') {
      return true;
    }

    // Nurses can approve patient requests to doctors they're connected with
    if (profile.role === 'nurse' && request.requester_type === 'patient' && request.target_type === 'doctor') {
      // Check if nurse is connected to the target doctor
      const nurseConnections = userConnections.filter(conn => 
        conn.provider_id === profile.id && conn.provider_type === 'nurse'
      );
      const doctorPatients = userConnections.filter(conn => 
        conn.provider_id === request.target_id && conn.provider_type === 'doctor'
      );
      
      // Check if nurse and doctor share any patients
      const sharedPatients = nurseConnections.some(nurseConn =>
        doctorPatients.some(docConn => docConn.patient_id === nurseConn.patient_id)
      );

      return sharedPatients;
    }

    // Users can approve requests directed to them
    return request.target_id === profile.id;
  };

  const getUserRole = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.role || 'Unknown';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || 'Unknown User';
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connection Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage your healthcare provider and patient connections
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowRequestModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SafeIcon icon={FiUserPlus} className="w-4 h-4" />
          <span>Send Request</span>
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'received', name: `Received (${receivedRequests.length})`, icon: FiUserCheck },
              { id: 'sent', name: `Sent (${sentRequests.length})`, icon: FiUserPlus }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'received' && (
            <div className="space-y-4">
              {receivedRequests.map((request) => {
                const requester = users.find(u => u.id === request.requester_id);
                const canApprove = canApproveRequest(request);

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={requester?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(requester?.full_name || 'Unknown')}&background=random&color=fff`}
                        alt={requester?.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{requester?.full_name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{requester?.role}</p>
                        {requester?.specialization && (
                          <p className="text-xs text-gray-500">{requester.specialization}</p>
                        )}
                        {request.message && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <SafeIcon icon={FiMessageSquare} className="w-3 h-3 inline mr-1" />
                            {request.message}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </span>
                      {canApprove && (
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApprove(request.id)}
                            className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <SafeIcon icon={FiCheck} className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReject(request.id)}
                            className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <SafeIcon icon={FiX} className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                      {!canApprove && (
                        <span className="text-xs text-gray-400">
                          Awaiting approval from {getUserRole(request.target_id)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {receivedRequests.length === 0 && (
                <div className="text-center py-12">
                  <SafeIcon icon={FiUserCheck} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending connection requests</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="space-y-4">
              {sentRequests.map((request) => {
                const target = users.find(u => u.id === request.target_id);

                return (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={target?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(target?.full_name || 'Unknown')}&background=random&color=fff`}
                        alt={target?.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{target?.full_name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{target?.role}</p>
                        {target?.specialization && (
                          <p className="text-xs text-gray-500">{target.specialization}</p>
                        )}
                        {request.message && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <SafeIcon icon={FiMessageSquare} className="w-3 h-3 inline mr-1" />
                            {request.message}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRequestStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(request.requested_at).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {sentRequests.length === 0 && (
                <div className="text-center py-12">
                  <SafeIcon icon={FiUserPlus} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No connection requests sent</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Send Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Connection Request</h2>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for healthcare providers or patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Available Users */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {getAvailableUsers().map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random&color=fff`}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                      {user.specialization && (
                        <p className="text-xs text-gray-500">{user.specialization}</p>
                      )}
                    </div>
                  </div>
                  {selectedUser?.id === user.id && (
                    <SafeIcon icon={FiCheck} className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              ))}

              {getAvailableUsers().length === 0 && (
                <div className="text-center py-8">
                  <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No available users to connect with</p>
                </div>
              )}
            </div>

            {/* Message */}
            {selectedUser && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a message with your connection request..."
                  rows={3}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendRequest}
                disabled={!selectedUser}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Request
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedUser(null);
                  setRequestMessage('');
                  setSearchTerm('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ConnectionRequests;