import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AuthForm from './components/Auth/AuthForm';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import DocumentManager from './components/Documents/DocumentManager';
import TaskManager from './components/Tasks/TaskManager';
import AppointmentCalendar from './components/Calendar/AppointmentCalendar';
import './App.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'documents':
        return <DocumentManager />;
      case 'tasks':
        return <TaskManager />;
      case 'appointments':
        return <AppointmentCalendar />;
      case 'patients':
        return <div className="text-center py-12"><p className="text-gray-500">Patients management coming soon...</p></div>;
      case 'team':
        return <div className="text-center py-12"><p className="text-gray-500">Team management coming soon...</p></div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50">
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
      </div>
    </DataProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;