import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import AuthForm from './components/Auth/AuthForm'
import Header from './components/Layout/Header'
import Navigation from './components/Layout/Navigation'
import AdvertisementBanner from './components/Layout/AdvertisementBanner'
import Dashboard from './components/Dashboard/Dashboard'
import DocumentManager from './components/Documents/DocumentManager'
import TaskManager from './components/Tasks/TaskManager'
import AppointmentCalendar from './components/Calendar/AppointmentCalendar'
import AdminDashboard from './components/Admin/AdminDashboard'
import SponsorDashboard from './components/Sponsor/SponsorDashboard'
import './App.css'

const AppContent = () => {
  const { user, profile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState(() => {
    // Set default tab based on user role
    if (profile?.role === 'admin') return 'admin'
    if (profile?.role === 'sponsor') return 'sponsor'
    return 'dashboard'
  })

  // Update active tab when profile changes
  React.useEffect(() => {
    if (profile?.role === 'admin' && activeTab === 'dashboard') {
      setActiveTab('admin')
    } else if (profile?.role === 'sponsor' && activeTab === 'dashboard') {
      setActiveTab('sponsor')
    }
  }, [profile?.role])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">HC</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <AuthForm />
  }

  const renderContent = () => {
    // Admin routes
    if (profile.role === 'admin') {
      switch (activeTab) {
        case 'admin':
        case 'users':
        case 'advertisements':
        case 'analytics':
        case 'settings':
          return <AdminDashboard />
        default:
          return <AdminDashboard />
      }
    }

    // Sponsor routes
    if (profile.role === 'sponsor') {
      switch (activeTab) {
        case 'sponsor':
        case 'advertisements':
        case 'packages':
        case 'analytics':
          return <SponsorDashboard />
        default:
          return <SponsorDashboard />
      }
    }

    // Regular user routes
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'documents':
        return <DocumentManager />
      case 'tasks':
        return <TaskManager />
      case 'appointments':
        return <AppointmentCalendar />
      case 'patients':
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Patients management coming soon...</p>
          </div>
        )
      case 'team':
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Team management coming soon...</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
        <Header />
        
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-64 sm:min-h-screen">
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          <main className="flex-1 p-4 sm:p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </main>
        </div>

        {/* Advertisement Banner - only show for non-admin/sponsor users */}
        {profile.role !== 'admin' && profile.role !== 'sponsor' && (
          <AdvertisementBanner />
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </DataProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App