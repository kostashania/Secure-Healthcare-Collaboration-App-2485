import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiUserPlus, FiUserCheck, FiUserX, FiSearch, FiMail, FiPhone, FiCheck, FiX } = FiIcons;

const ConnectionManager = () => {
  const { profile } = useAuth();
  const { 
    users,
    connectionRequests,
    userConnections,
    createConnectionRequest,
    approveConnectionRequest,
    rejectConnectionRequest,
    removeUserConnection
  } = useData();

  const [activeTab, setActiveTab] = useState('connections');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  // Filter users based on role logic
  const getAvailableUsers = () => {
    let availableUsers = [];
    
    if (profile?.role === 'patient') {
      // Patients can request doctors and office managers
      availableUsers = users.filter(u => 
        (u.role === 'doctor' || u.role === 'office_manager') && 
        u.id !== profile.id
      );
    } else if (profile?.role === 'doctor') {
      // Doctors can request patients, nurses, and office managers
      availableUsers = users.filter(u => 
        (u.role === 'patient' || u.role === 'nurse' || u.role === 'office_manager') && 
        u.id !== profile.id
      );
    } else if (profile?.role === 'nurse') {
      // Nurses can request patients and office managers
      availableUsers = users.filter(u => 
        (u.role === 'patient' || u.role === 'office_manager') && 
        u.id !== profile.id
      );
    } else if (profile?.role === 'office_manager' || profile?.role === 'admin') {
      // Office managers and admins can connect to anyone
      availableUsers = users.filter(u => u.id !== profile.id);
    }

    // Filter out already connected users
    const connectedUserIds = userConnections.map(conn => 
      conn.user1_id === profile.id ? conn.user2_id : conn.user1_id
    );
    
    // Filter out users with pending requests
    const pendingUserIds = connectionRequests
      .filter(req => req.status === 'pending')
      .map(req => req.requester_id === profile.id ? req.recipient_id : req.requester_id);

    return availableUsers.filter(user => 
      !connectedUserIds.includes(user.id) && 
      !pendingUserIds.includes(user.id) &&
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getPendingRequests = () => {
    return connectionRequests.filter(req => 
      req.status === 'pending' && 
      (req.recipient_id === profile.id || 
       profile?.role === 'admin' || 
       profile?.role === 'office_manager' ||
       (profile?.role === 'nurse' && req.recipient_role === 'doctor'))
    );
  };

  const getMyConnections = () => {
    return userConnections.filter(conn => 
      conn.user1_id === profile.id || conn.user2_id === profile.id
    );
  };

  const handleSendRequest = async (targetUser) => {
    setSelectedUser(targetUser);
    setShowRequestModal(true);
  };

  const submitConnectionRequest = async () => {
    if (!selectedUser) return;

    const request = await createConnectionRequest({
      requester_id: profile.id,
      recipient_id: selectedUser.id,
      requester_role: profile.role,
      recipient_role: selectedUser.role,
      message: requestMessage,
      status: 'pending'
    });

    if (request.success) {
      setShowRequestModal(false);
      setSelectedUser(null);
      setRequestMessage('');
    }
  };

  const handleApproveRequest = async (requestId) => {
    await approveConnectionRequest(requestId);
  };

  const handleRejectRequest = async (requestId) => {
    await rejectConnectionRequest(requestId);
  };

  const handleRemoveConnection = async (connectionId) => {
    if (window.confirm('Are you sure you want to remove this connection?')) {
      await removeUserConnection(connectionId);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      case 'nurse': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'office_manager': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableUsers = getAvailableUsers();
  const pendingRequests = getPendingRequests();
  const myConnections = getMyConnections();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connection Manager</h1>
          <p className="text-gray-600 mt-1">
            Manage your professional healthcare connections
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
          <SafeIcon icon={FiUsers} className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {myConnections.length} Active Connections
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'connections', name: 'My Connections', count: myConnections.length },
              { id: 'requests', name: 'Pending Requests', count: pendingRequests.length },
              { id: 'discover', name: 'Discover Users', count: availableUsers.length }
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
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Search Bar */}
          {(activeTab === 'discover' || activeTab === 'connections') && (
            <div className="mb-6">
              <div className="relative">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'discover' ? 'available users' : 'your connections'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'connections' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Active Connections</h3>
              
              {myConnections.length === 0 ? (
                <div className="text-center py-12">
                  <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active connections yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Start by discovering and connecting with other healthcare professionals
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myConnections.map((connection) => {
                    const connectedUser = connection.user1_id === profile.id 
                      ? connection.user2 
                      : connection.user1;
                    
                    return (
                      <motion.div
                        key={connection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <img
                            src={connectedUser?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(connectedUser?.full_name || 'Unknown')}&background=random&color=fff`}
                            alt={connectedUser?.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{connectedUser?.full_name}</h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(connectedUser?.role)}`}>
                              {connectedUser?.role?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <SafeIcon icon={FiMail} className="w-4 h-4" />
                            <span>{connectedUser?.email}</span>
                          </div>
                          {connectedUser?.phone_number && (
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={FiPhone} className="w-4 h-4" />
                              <span>{connectedUser?.phone_number}</span>
                            </div>
                          )}
                          {connectedUser?.specialization && (
                            <p className="text-xs text-gray-500">
                              Specialization: {connectedUser.specialization}
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 mb-4">
                          Connected: {new Date(connection.created_at).toLocaleDateString()}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRemoveConnection(connection.id)}
                          className="w-full bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          Remove Connection
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Connection Requests</h3>
              
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <SafeIcon icon={FiUserCheck} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={request.requester?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.requester?.full_name || 'Unknown')}&background=random&color=fff`}
                            alt={request.requester?.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {request.requester?.full_name}
                            </h4>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(request.requester?.role)}`}>
                              {request.requester?.role?.replace('_', ' ')}
                            </span>
                            {request.message && (
                              <p className="text-sm text-gray-600 mt-2">{request.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Requested: {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-green-50 text-green-600 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center space-x-1"
                          >
                            <SafeIcon icon={FiCheck} className="w-4 h-4" />
                            <span>Approve</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRejectRequest(request.id)}
                            className="bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center space-x-1"
                          >
                            <SafeIcon icon={FiX} className="w-4 h-4" />
                            <span>Reject</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Discover Healthcare Professionals</h3>
              
              {availableUsers.length === 0 ? (
                <div className="text-center py-12">
                  <SafeIcon icon={FiUserPlus} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No available users to connect with</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {searchTerm ? 'Try adjusting your search terms' : 'You are connected to all available professionals in your network'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random&color=fff`}
                          alt={user.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                            {user.role?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <SafeIcon icon={FiMail} className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                        {user.specialization && (
                          <p className="text-xs text-gray-500">
                            Specialization: {user.specialization}
                          </p>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendRequest(user)}
                        className="w-full bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                      >
                        <SafeIcon icon={FiUserPlus} className="w-4 h-4" />
                        <span>Send Request</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connection Request Modal */}
      {showRequestModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Send Connection Request
            </h2>
            
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={selectedUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.full_name)}&background=random&color=fff`}
                alt={selectedUser.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium text-gray-900">{selectedUser.full_name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(selectedUser.role)}`}>
                  {selectedUser.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Introduce yourself and explain why you'd like to connect..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={submitConnectionRequest}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
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

export default ConnectionManager;