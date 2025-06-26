import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiPlus, FiUserCheck, FiUserX, FiUser, FiMail, FiPhone, FiCalendar } = FiIcons;

const TeamManager = () => {
  const { profile } = useAuth();
  const { 
    users, 
    patients, 
    getPatientTeam, 
    getProviderPatients,
    assignProviderToPatient,
    removeProviderFromPatient
  } = useData();
  
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.id || '');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentData, setAssignmentData] = useState({
    providerId: '',
    role: 'primary_doctor'
  });

  const providers = users.filter(user => 
    user.role === 'doctor' || user.role === 'nurse'
  );

  const getTeamToShow = () => {
    if (profile?.role === 'patient') {
      return getPatientTeam(profile.id);
    } else if (selectedPatient) {
      return getPatientTeam(selectedPatient);
    }
    return [];
  };

  const getMyPatients = () => {
    if (profile?.role === 'doctor' || profile?.role === 'nurse') {
      return getProviderPatients(profile.id);
    }
    return [];
  };

  const handleAssignProvider = (e) => {
    e.preventDefault();
    
    const patientId = profile?.role === 'patient' ? profile.id : selectedPatient;
    
    const result = assignProviderToPatient({
      patientId,
      providerId: assignmentData.providerId,
      role: assignmentData.role
    });

    if (result.success) {
      setShowAssignModal(false);
      setAssignmentData({
        providerId: '',
        role: 'primary_doctor'
      });
    }
  };

  const handleRemoveProvider = (assignmentId) => {
    if (window.confirm('Are you sure you want to remove this provider from the team?')) {
      removeProviderFromPatient(assignmentId);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'primary_doctor':
        return 'green';
      case 'primary_nurse':
        return 'purple';
      case 'specialist':
        return 'blue';
      case 'consultant':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'primary_doctor':
        return 'Primary Doctor';
      case 'primary_nurse':
        return 'Primary Nurse';
      case 'specialist':
        return 'Specialist';
      case 'consultant':
        return 'Consultant';
      default:
        return role;
    }
  };

  const teamMembers = getTeamToShow();
  const myPatients = getMyPatients();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            {profile?.role === 'patient' 
              ? 'View your healthcare team members'
              : 'Manage patient care teams and assignments'
            }
          </p>
        </div>
        
        {(profile?.role === 'doctor' || profile?.role === 'admin') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAssignModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Assign Provider</span>
          </motion.button>
        )}
      </div>

      {/* Patient Selector for non-patients */}
      {profile?.role !== 'patient' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Patient
          </label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Care Team Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {profile?.role === 'patient' ? 'My Care Team' : 'Patient Care Team'}
          </h2>
          
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={member.provider?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.provider?.full_name || 'Unknown')}&background=random&color=fff`}
                      alt={member.provider?.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      member.provider?.role === 'doctor' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{member.provider?.full_name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{member.provider?.role}</p>
                    {member.provider?.specialization && (
                      <p className="text-xs text-gray-500">{member.provider.specialization}</p>
                    )}
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 bg-${getRoleColor(member.role)}-100 text-${getRoleColor(member.role)}-800`}>
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm text-gray-500">
                    <p>Assigned {new Date(member.assignedAt).toLocaleDateString()}</p>
                  </div>
                  
                  {(profile?.role === 'doctor' || profile?.role === 'admin') && (
                    <button
                      onClick={() => handleRemoveProvider(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <SafeIcon icon={FiUserX} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {teamMembers.length === 0 && (
              <div className="text-center py-8">
                <SafeIcon icon={FiUsers} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No team members assigned</p>
                <p className="text-sm text-gray-400 mt-1">
                  {profile?.role === 'patient' 
                    ? 'Your healthcare providers will appear here'
                    : 'Assign healthcare providers to this patient'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* My Patients (for providers) */}
        {(profile?.role === 'doctor' || profile?.role === 'nurse') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Patients</h2>
            
            <div className="space-y-4">
              {myPatients.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={assignment.patient?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(assignment.patient?.full_name || 'Unknown')}&background=3b82f6&color=fff`}
                        alt={assignment.patient?.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{assignment.patient?.full_name}</h3>
                      <p className="text-sm text-gray-600">{assignment.patient?.email}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 bg-${getRoleColor(assignment.role)}-100 text-${getRoleColor(assignment.role)}-800`}>
                        {getRoleLabel(assignment.role)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-500">
                    <p>Assigned {new Date(assignment.assignedAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}

              {myPatients.length === 0 && (
                <div className="text-center py-8">
                  <SafeIcon icon={FiUser} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No patients assigned</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Patients assigned to you will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available Providers (for patients or when no provider role) */}
        {profile?.role === 'patient' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Providers</h2>
            
            <div className="space-y-4">
              {providers.slice(0, 5).map((provider) => (
                <div key={provider.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                  <img
                    src={provider.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.full_name)}&background=random&color=fff`}
                    alt={provider.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{provider.full_name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{provider.role}</p>
                    {provider.specialization && (
                      <p className="text-xs text-gray-500">{provider.specialization}</p>
                    )}
                  </div>

                  <div className={`w-3 h-3 rounded-full bg-${provider.role === 'doctor' ? 'green' : 'purple'}-500`}></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assign Provider Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assign Provider</h2>
            <form onSubmit={handleAssignProvider} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Healthcare Provider
                </label>
                <select
                  required
                  value={assignmentData.providerId}
                  onChange={(e) => setAssignmentData({ ...assignmentData, providerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select provider</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.full_name} - {provider.role} {provider.specialization && `(${provider.specialization})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role in Care Team
                </label>
                <select
                  value={assignmentData.role}
                  onChange={(e) => setAssignmentData({ ...assignmentData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="primary_doctor">Primary Doctor</option>
                  <option value="primary_nurse">Primary Nurse</option>
                  <option value="specialist">Specialist</option>
                  <option value="consultant">Consultant</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Provider
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;