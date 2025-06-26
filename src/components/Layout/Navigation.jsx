import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiUsers, FiFileText, FiCalendar, FiCheckSquare, FiMessageCircle } = FiIcons;

const Navigation = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: FiHome }
    ];

    switch (user?.role) {
      case 'patient':
        return [
          ...baseItems,
          { id: 'team', label: 'My Team', icon: FiUsers },
          { id: 'documents', label: 'Documents', icon: FiFileText },
          { id: 'appointments', label: 'Appointments', icon: FiCalendar },
          { id: 'tasks', label: 'Tasks', icon: FiCheckSquare }
        ];
      case 'doctor':
        return [
          ...baseItems,
          { id: 'patients', label: 'Patients', icon: FiUsers },
          { id: 'appointments', label: 'Appointments', icon: FiCalendar },
          { id: 'tasks', label: 'Tasks', icon: FiCheckSquare }
        ];
      case 'nurse':
        return [
          ...baseItems,
          { id: 'patients', label: 'Patients', icon: FiUsers },
          { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
          { id: 'documents', label: 'Documents', icon: FiFileText }
        ];
      default:
        return baseItems;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient': return 'patient';
      case 'doctor': return 'doctor';
      case 'nurse': return 'nurse';
      default: return 'gray';
    }
  };

  const navItems = getNavItems();
  const roleColor = getRoleColor(user?.role);

  return (
    <nav className="bg-white border-t border-gray-200 sm:border-t-0 sm:border-r">
      <div className="flex sm:flex-col overflow-x-auto sm:overflow-x-visible">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap sm:w-full ${
              activeTab === item.id
                ? `text-${roleColor}-600 bg-${roleColor}-50 border-r-2 border-${roleColor}-600`
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <SafeIcon icon={item.icon} className="w-5 h-5" />
            <span className="hidden sm:block">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;