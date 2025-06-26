import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiFileText, FiCalendar, FiCheckSquare, FiClock, FiTrendingUp, FiPlus } = FiIcons;

const Dashboard = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { 
    patients, 
    documents, 
    tasks, 
    appointments, 
    getUserTasks, 
    getPatientDocuments,
    getUserAppointments,
    getPatientTeam
  } = useData();

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient':
        return 'blue';
      case 'doctor':
        return 'green';
      case 'nurse':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const roleColor = getRoleColor(profile?.role);
  const userTasks = getUserTasks();
  const pendingTasks = userTasks.filter(task => task.status === 'pending');
  const userAppointments = getUserAppointments(profile?.id, profile?.role);
  const upcomingAppointments = userAppointments.filter(apt => 
    new Date(apt.date) > new Date() && 
    new Date(apt.date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  const getStatsForRole = () => {
    switch (profile?.role) {
      case 'patient':
        const patientDocs = getPatientDocuments(profile.id);
        const patientTeam = getPatientTeam(profile.id);
        return [
          { label: 'My Documents', value: patientDocs.length, icon: FiFileText, color: 'blue' },
          { label: 'Pending Tasks', value: pendingTasks.length, icon: FiCheckSquare, color: 'orange' },
          { label: 'Upcoming Appointments', value: upcomingAppointments.length, icon: FiCalendar, color: 'green' },
          { label: 'Care Team Members', value: patientTeam.length, icon: FiUsers, color: 'purple' }
        ];
      case 'doctor':
        return [
          { label: 'Active Patients', value: patients.length, icon: FiUsers, color: 'blue' },
          { label: 'Tasks Assigned', value: userTasks.length, icon: FiCheckSquare, color: 'orange' },
          { label: 'Appointments Today', value: userAppointments.filter(apt => 
            new Date(apt.date).toDateString() === new Date().toDateString()
          ).length, icon: FiCalendar, color: 'green' },
          { label: 'Documents Reviewed', value: documents.length, icon: FiFileText, color: 'purple' }
        ];
      case 'nurse':
        return [
          { label: 'Assigned Patients', value: patients.length, icon: FiUsers, color: 'blue' },
          { label: 'Tasks Completed', value: userTasks.filter(t => t.status === 'completed').length, icon: FiCheckSquare, color: 'green' },
          { label: 'Pending Tasks', value: pendingTasks.length, icon: FiClock, color: 'orange' },
          { label: 'Documents Added', value: documents.filter(d => d.uploadedBy === profile.id).length, icon: FiFileText, color: 'purple' }
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  const getRecentActivities = () => {
    const activities = [];
    
    // Recent tasks
    userTasks.slice(0, 3).forEach(task => {
      activities.push({
        id: task.id,
        type: 'task',
        title: task.title,
        description: `${task.status} - ${task.priority} priority`,
        time: new Date(task.created_at),
        color: task.status === 'completed' ? 'green' : task.priority === 'high' ? 'red' : 'orange'
      });
    });

    // Recent appointments
    upcomingAppointments.slice(0, 2).forEach(apt => {
      activities.push({
        id: apt.id,
        type: 'appointment',
        title: apt.title,
        description: `${new Date(apt.date).toLocaleDateString()} at ${new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        time: new Date(apt.date),
        color: 'blue'
      });
    });

    // Recent documents (for patients)
    if (profile?.role === 'patient') {
      const patientDocs = getPatientDocuments(profile.id);
      patientDocs.slice(0, 2).forEach(doc => {
        activities.push({
          id: doc.id,
          type: 'document',
          title: doc.title,
          description: `New ${doc.type.replace('_', ' ')} uploaded`,
          time: new Date(doc.uploadedAt),
          color: 'purple'
        });
      });
    }

    return activities.sort((a, b) => b.time - a.time).slice(0, 5);
  };

  const recentActivities = getRecentActivities();

  // Quick action handlers
  const handleQuickAction = (action) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your {profile?.role === 'patient' ? 'health' : 'patients'} today.
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
                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : task.priority === 'medium' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
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
                  {appointment.location && (
                    <p className="text-xs text-gray-500 mt-1">{appointment.location}</p>
                  )}
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

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full bg-${activity.color}-500 mt-2`}></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.time.toLocaleDateString()} at {activity.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {profile?.role === 'patient' && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('documents')}
                className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiFileText} className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-700">Upload Document</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('appointments')}
                className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiCalendar} className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-700">Book Appointment</span>
              </motion.button>
            </>
          )}
          
          {profile?.role === 'doctor' && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('patients')}
                className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiUsers} className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-700">View Patients</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('tasks')}
                className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiCheckSquare} className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-700">Assign Task</span>
              </motion.button>
            </>
          )}
          
          {profile?.role === 'nurse' && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('tasks')}
                className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiCheckSquare} className="w-6 h-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-700">Complete Task</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickAction('documents')}
                className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiFileText} className="w-6 h-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-700">Add Notes</span>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;