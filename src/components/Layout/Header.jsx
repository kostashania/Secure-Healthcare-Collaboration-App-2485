import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiLogOut, FiBell } = FiIcons;

const Header = () => {
  const { user, signOut } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient': return 'text-patient-600 bg-patient-50';
      case 'doctor': return 'text-doctor-600 bg-doctor-50';
      case 'nurse': return 'text-nurse-600 bg-nurse-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'patient': return 'bg-patient-500';
      case 'doctor': return 'bg-doctor-500';
      case 'nurse': return 'bg-nurse-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HC</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">HealthCare Collab</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <SafeIcon icon={FiBell} className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={user?.profilePicture}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getRoleBadgeColor(user?.role)} border-2 border-white`}></div>
              </div>
              
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user?.role)}`}>
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </span>
                </div>
              </div>

              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <SafeIcon icon={FiLogOut} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;