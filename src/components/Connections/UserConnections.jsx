import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiCalendar, FiFileText, FiCheckSquare, FiPhone, FiMail, FiUserMinus } = FiIcons;

const UserConnections = () => {
  const { profile } = useAuth();
  const { 
    users, 
    userConnections,
    getPatientProviders,
    getProviderPatients,
    getUserAppointments,
    getPatientDocuments,
    getPatientTasks
  } = useData();

  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Get user's connections based on role
  const getMyConnections = () => {
    if (profile.role === 'patient') {
      return getPatientProviders(profile.id);
    } else {
      return getProviderPatients(profile.id);
    }
  };

  const handleViewDetails = (connection) => {
    setSelectedConnection(connection);
    setShowDetailModal(true);
  };

  const handleRemoveConnection = (connectionId) => {
    if (window.confirm('Are you sure you want to remove this connection?')) {
      // In real app, this would call an API to remove the connection
      console.log('Removing connection:', connectionId);
      // For demo, we'll just show a success message
      toast.success('Connection removed successfully!');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor': return 'green';
      case 'nurse': return 'purple';
      case 'patient': return 'blue';
      default: return 'gray';
    }
  };

  const myConnections = getMyConnections();

  const ConnectionDetailModal = ({ connection, onClose }) => {
    const connectedUser = profile.role === 'patient' ? connection.provider : connection.patient;
    const appointments = getUserAppointments(connectedUser.id, connectedUser.role);
    const documents = profile.role === 'patient' 
      ? getPatientDocuments(profile.id)
      : getPatientDocuments(connectedUser.id);
    const tasks = profile.role === 'patient'
      ? getPatientTasks(profile.id).filter(task => task.assigned_by === connectedUser.id)
      : getPatientTasks(connectedUser.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={connectedUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(connectedUser.full_name)}&background=random&color=fff`}
                  alt={connectedUser.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{connectedUser.full_name}</h2>
                  <p className="text-gray-600 capitalize">{connectedUser.role}</p>
                  {connectedUser.specialization && (
                    <p className="text-sm text-gray-500">{connectedUser.specialization}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiMail} className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">{connectedUser.email}</span>
                  </div>
                  {connectedUser.phone_number && (
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiPhone} className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">{connectedUser.phone_number}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Connected since: {new Date(connection.connected_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{appointments.length}</p>
                    <p className="text-xs text-gray-500">Appointments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{documents.length}</p>
                    <p className="text-xs text-gray-500">Documents</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600">{tasks.length}</p>
                    <p className="text-xs text-gray-500">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {tasks.filter(t => t.status === 'completed').length}
                    </p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Appointments */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Appointments</h3>
                <div className="space-y-2">
                  {appointments.slice(0, 3).map((apt) => (
                    <div key={apt.id} className="flex items-center space-x-3 p-2 bg-white rounded">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{apt.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(apt.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-sm text-gray-500">No appointments yet</p>
                  )}
                </div>
              </div>

              {/* Recent Documents */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Documents</h3>
                <div className="space-y-2">
                  {documents.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-3 p-2 bg-white rounded">
                      <SafeIcon icon={FiFileText} className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-sm text-gray-500">No documents yet</p>
                  )}
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Pending Tasks</h3>
                <div className="space-y-2">
                  {tasks.filter(t => t.status === 'pending').slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-2 bg-white rounded">
                      <SafeIcon icon={FiCheckSquare} className="w-4 h-4 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.priority} priority</p>
                      </div>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === 'pending').length === 0 && (
                    <p className="text-sm text-gray-500">No pending tasks</p>
                  )}
                </div>
              </div>

              {/* Custom Fields */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                <div className="space-y-2">
                  {connectedUser.custom_field_1 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Custom Field 1:</p>
                      <p className="text-sm text-gray-900">{connectedUser.custom_field_1}</p>
                    </div>
                  )}
                  {connectedUser.custom_field_2 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Custom Field 2:</p>
                      <p className="text-sm text-gray-900">{connectedUser.custom_field_2}</p>
                    </div>
                  )}
                  {connectedUser.custom_field_3 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600">Custom Field 3:</p>
                      <p className="text-sm text-gray-900">{connectedUser.custom_field_3}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile.role === 'patient' ? 'My Healthcare Providers' : 'My Patients'}
          </h1>
          <p className="text-gray-600 mt-1">
            {profile.role === 'patient' 
              ? 'View and manage your connected healthcare providers'
              : 'View and manage your connected patients'
            }
          </p>
        </div>
      </div>

      {/* Connections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myConnections.map((connection) => {
          const connectedUser = profile.role === 'patient' ? connection.provider : connection.patient;
          const roleColor = getRoleColor(connectedUser.role);
          
          return (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={connectedUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(connectedUser.full_name)}&background=random&color=fff`}
                    alt={connectedUser.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-${roleColor}-500`}></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{connectedUser.full_name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{connectedUser.role}</p>
                  {connectedUser.specialization && (
                    <p className="text-xs text-gray-500">{connectedUser.specialization}</p>
                  )}
                </div>
              </div>

              {/* Connection Details */}
              <div className="mb-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${roleColor}-100 text-${roleColor}-800`}>
                  {connection.role.replace('_', ' ')}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Connected on {new Date(connection.connected_at).toLocaleDateString()}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewDetails(connection)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  View Details
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRemoveConnection(connection.id)}
                  className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <SafeIcon icon={FiUserMinus} className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}

        {myConnections.length === 0 && (
          <div className="col-span-full text-center py-12">
            <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No connections yet</p>
            <p className="text-sm text-gray-400 mt-1">
              {profile.role === 'patient' 
                ? 'Connect with healthcare providers to get started'
                : 'Your connected patients will appear here'
              }
            </p>
          </div>
        )}
      </div>

      {/* Connection Detail Modal */}
      {showDetailModal && selectedConnection && (
        <ConnectionDetailModal
          connection={selectedConnection}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedConnection(null);
          }}
        />
      )}
    </div>
  );
};

export default UserConnections;