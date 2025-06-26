import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiPlus, FiSearch, FiEdit, FiEye, FiFileText, FiCalendar, FiCheckSquare, FiUser, FiMail, FiPhone } = FiIcons;

const PatientManagement = () => {
  const { profile } = useAuth();
  const { 
    patients, 
    getPatientDocuments,
    getUserAppointments,
    getPatientTasks,
    getPatientTeam
  } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientStats = (patientId) => {
    const documents = getPatientDocuments(patientId);
    const appointments = getUserAppointments(patientId, 'patient');
    const tasks = getPatientTasks(patientId);
    const team = getPatientTeam(patientId);

    return {
      documents: documents.length,
      appointments: appointments.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      teamMembers: team.length
    };
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const PatientDetailModal = ({ patient, onClose }) => {
    const stats = getPatientStats(patient.id);
    const documents = getPatientDocuments(patient.id);
    const appointments = getUserAppointments(patient.id, 'patient');
    const tasks = getPatientTasks(patient.id);
    const team = getPatientTeam(patient.id);

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
                  src={patient.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.full_name)}&background=3b82f6&color=fff`}
                  alt={patient.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{patient.full_name}</h2>
                  <p className="text-gray-600">{patient.email}</p>
                  {patient.phone_number && (
                    <p className="text-gray-500">{patient.phone_number}</p>
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
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiFileText} className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Documents</p>
                    <p className="text-xl font-bold text-blue-700">{stats.documents}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCalendar} className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600">Appointments</p>
                    <p className="text-xl font-bold text-green-700">{stats.appointments}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiCheckSquare} className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600">Pending Tasks</p>
                    <p className="text-xl font-bold text-orange-700">{stats.pendingTasks}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <SafeIcon icon={FiUsers} className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600">Care Team</p>
                    <p className="text-xl font-bold text-purple-700">{stats.teamMembers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Documents */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Recent Documents</h3>
                <div className="space-y-2">
                  {documents.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-3 p-2 bg-white rounded">
                      <SafeIcon icon={FiFileText} className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-sm text-gray-500">No documents yet</p>
                  )}
                </div>
              </div>

              {/* Care Team */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Care Team</h3>
                <div className="space-y-2">
                  {team.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-2 bg-white rounded">
                      <img
                        src={member.provider?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.provider?.full_name || 'Unknown')}&background=random&color=fff`}
                        alt={member.provider?.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{member.provider?.full_name}</p>
                        <p className="text-xs text-gray-500">{member.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))}
                  {team.length === 0 && (
                    <p className="text-sm text-gray-500">No team members assigned</p>
                  )}
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Upcoming Appointments</h3>
                <div className="space-y-2">
                  {appointments.filter(apt => new Date(apt.date) > new Date()).slice(0, 3).map((apt) => (
                    <div key={apt.id} className="flex items-center space-x-3 p-2 bg-white rounded">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{apt.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(apt.date).toLocaleDateString()} at {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {appointments.filter(apt => new Date(apt.date) > new Date()).length === 0 && (
                    <p className="text-sm text-gray-500">No upcoming appointments</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor patient care and progress
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => {
          const stats = getPatientStats(patient.id);
          
          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={patient.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.full_name)}&background=3b82f6&color=fff`}
                  alt={patient.full_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{patient.full_name}</h3>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                  {patient.phone_number && (
                    <p className="text-xs text-gray-500">{patient.phone_number}</p>
                  )}
                </div>
                <span className={`w-3 h-3 rounded-full ${patient.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{stats.documents}</p>
                  <p className="text-xs text-gray-500">Documents</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{stats.appointments}</p>
                  <p className="text-xs text-gray-500">Appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-orange-600">{stats.pendingTasks}</p>
                  <p className="text-xs text-gray-500">Pending Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">{stats.teamMembers}</p>
                  <p className="text-xs text-gray-500">Team Members</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewPatient(patient)}
                  className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <SafeIcon icon={FiEye} className="w-4 h-4" />
                  <span>View Details</span>
                </motion.button>
              </div>

              {/* Last Activity */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(patient.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          );
        })}

        {filteredPatients.length === 0 && (
          <div className="col-span-full text-center py-12">
            <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No patients found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search terms' : 'Patients will appear here when assigned'}
            </p>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {showPatientModal && selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => {
            setShowPatientModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default PatientManagement;