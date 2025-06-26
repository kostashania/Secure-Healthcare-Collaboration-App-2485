import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiFileText, FiCalendar, FiCheckSquare, FiClock, FiTrendingUp } = FiIcons;

const Dashboard = () => {
  const { user } = useAuth();
  const { patients, documents, tasks, appointments, getUserTasks } = useData();

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient': return 'patient';
      case 'doctor': return 'doctor';
      case 'nurse': return 'nurse';
      default: return 'gray';
    }
  };

  const roleColor = getRoleColor(user?.role);
  const userTasks = getUserTasks();
  const pendingTasks = userTasks.filter(task => task.status === 'pending');
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) > new Date() && 
    new Date(apt.date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const getStatsForRole = () => {
    switch (user?.role) {
      case 'patient':
        return [
          { label: 'My Documents', value: documents.length, icon: FiFileText, color: 'blue' },
          { label: 'Pending Tasks', value: pendingTasks.length, icon: FiCheckSquare, color: 'orange' },
          { label: 'Upcoming Appointments', value: upcomingAppointments.length, icon: FiCalendar, color: 'green' },
          { label: 'Care Team Members', value: 3, icon: FiUsers, color: 'purple' }
        ];
      case 'doctor':
        return [
          { label: 'Active Patients', value: patients.length, icon: FiUsers, color: 'blue' },
          { label: 'Tasks Assigned', value: userTasks.length, icon: FiCheckSquare, color: 'orange' },
          { label: 'Appointments Today', value: 2, icon: FiCalendar, color: 'green' },
          { label: 'Documents Reviewed', value: documents.length, icon: FiFileText, color: 'purple' }
        ];
      case 'nurse':
        return [
          { label: 'Assigned Patients', value: patients.length, icon: FiUsers, color: 'blue' },
          { label: 'Tasks Completed', value: userTasks.filter(t => t.status === 'completed').length, icon: FiCheckSquare, color: 'green' },
          { label: 'Pending Tasks', value: pendingTasks.length, icon: FiClock, color: 'orange' },
          { label: 'Documents Added', value: documents.length, icon: FiFileText, color: 'purple' }
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your {user?.role === 'patient' ? 'health' : 'patients'} today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                <SafeIcon icon={stat.icon} className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <SafeIcon icon={FiCheckSquare} className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {pendingTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
            
            {pendingTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">No pending tasks</p>
            )}
          </div>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
            <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{appointment.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.date).toLocaleDateString()} at{' '}
                    {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {appointment.duration}min
                </span>
              </div>
            ))}
            
            {upcomingAppointments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user?.role === 'patient' && (
            <>
              <button className="flex flex-col items-center p-4 bg-patient-50 hover:bg-patient-100 rounded-lg transition-colors">
                <SafeIcon icon={FiFileText} className="w-6 h-6 text-patient-600 mb-2" />
                <span className="text-sm font-medium text-patient-700">Upload Document</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-patient-50 hover:bg-patient-100 rounded-lg transition-colors">
                <SafeIcon icon={FiCalendar} className="w-6 h-6 text-patient-600 mb-2" />
                <span className="text-sm font-medium text-patient-700">Book Appointment</span>
              </button>
            </>
          )}
          
          {user?.role === 'doctor' && (
            <>
              <button className="flex flex-col items-center p-4 bg-doctor-50 hover:bg-doctor-100 rounded-lg transition-colors">
                <SafeIcon icon={FiUsers} className="w-6 h-6 text-doctor-600 mb-2" />
                <span className="text-sm font-medium text-doctor-700">View Patients</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-doctor-50 hover:bg-doctor-100 rounded-lg transition-colors">
                <SafeIcon icon={FiCheckSquare} className="w-6 h-6 text-doctor-600 mb-2" />
                <span className="text-sm font-medium text-doctor-700">Assign Task</span>
              </button>
            </>
          )}
          
          {user?.role === 'nurse' && (
            <>
              <button className="flex flex-col items-center p-4 bg-nurse-50 hover:bg-nurse-100 rounded-lg transition-colors">
                <SafeIcon icon={FiCheckSquare} className="w-6 h-6 text-nurse-600 mb-2" />
                <span className="text-sm font-medium text-nurse-700">Complete Task</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-nurse-50 hover:bg-nurse-100 rounded-lg transition-colors">
                <SafeIcon icon={FiFileText} className="w-6 h-6 text-nurse-600 mb-2" />
                <span className="text-sm font-medium text-nurse-700">Add Notes</span>
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;