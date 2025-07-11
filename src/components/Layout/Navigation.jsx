import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { 
  FiHome, FiUsers, FiFileText, FiCalendar, FiCheckSquare, FiSettings, 
  FiEye, FiDollarSign, FiShield, FiBarChart, FiUserCheck, FiFolder, 
  FiClipboard, FiTool, FiUserPlus 
} = FiIcons

const Navigation = ({ activeTab, setActiveTab }) => {
  const { profile } = useAuth()

  const getNavItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: FiHome }
    ]

    switch (profile?.role) {
      case 'patient':
        return [
          ...baseItems,
          { id: 'connections', label: 'My Providers', icon: FiUsers },
          { id: 'documents', label: 'Documents', icon: FiFileText },
          { id: 'appointments', label: 'Appointments', icon: FiCalendar },
          { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
          { id: 'requests', label: 'Connection Requests', icon: FiUserCheck }
        ]

      case 'doctor':
        return [
          ...baseItems,
          { id: 'patients', label: 'My Patients', icon: FiUsers },
          { id: 'appointments', label: 'Appointments', icon: FiCalendar },
          { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
          { id: 'documents', label: 'Documents', icon: FiFileText },
          { id: 'rooms', label: 'Exam Rooms', icon: FiClipboard },
          { id: 'connections', label: 'Connections', icon: FiUserPlus }
        ]

      case 'nurse':
        return [
          ...baseItems,
          { id: 'patients', label: 'My Patients', icon: FiUsers },
          { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
          { id: 'appointments', label: 'Appointments', icon: FiCalendar },
          { id: 'documents', label: 'Documents', icon: FiFileText },
          { id: 'connections', label: 'Connections', icon: FiUserPlus }
        ]

      case 'office_manager':
        return [
          ...baseItems,
          { id: 'patients', label: 'Patients', icon: FiUsers },
          { id: 'appointments', label: 'Appointments', icon: FiCalendar },
          { id: 'documents', label: 'Documents', icon: FiFileText },
          { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
          { id: 'rooms', label: 'Exam Rooms', icon: FiClipboard },
          { id: 'connections', label: 'Connections', icon: FiUserPlus },
          { id: 'reports', label: 'Reports', icon: FiBarChart }
        ]

      case 'admin':
        return [
          { id: 'admin', label: 'Admin Panel', icon: FiShield },
          { id: 'users', label: 'Users', icon: FiUsers },
          { id: 'advertisements', label: 'Advertisements', icon: FiEye },
          { id: 'analytics', label: 'Analytics', icon: FiBarChart },
          { id: 'document-types', label: 'Document Types', icon: FiFolder },
          { id: 'rooms', label: 'Exam Rooms', icon: FiClipboard },
          { id: 'custom-fields', label: 'Custom Fields', icon: FiTool },
          { id: 'settings', label: 'Settings', icon: FiSettings }
        ]

      case 'sponsor':
        return [
          { id: 'sponsor', label: 'Sponsor Panel', icon: FiEye },
          { id: 'advertisements', label: 'My Ads', icon: FiEye },
          { id: 'packages', label: 'Packages', icon: FiDollarSign },
          { id: 'analytics', label: 'Analytics', icon: FiBarChart }
        ]

      default:
        return baseItems
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient': return 'blue'
      case 'doctor': return 'green'
      case 'nurse': return 'purple'
      case 'admin': return 'red'
      case 'office_manager': return 'orange'
      case 'sponsor': return 'yellow'
      default: return 'gray'
    }
  }

  const navItems = getNavItems()
  const roleColor = getRoleColor(profile?.role)

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
  )
}

export default Navigation