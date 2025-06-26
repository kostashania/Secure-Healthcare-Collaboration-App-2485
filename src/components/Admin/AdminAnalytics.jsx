import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBarChart, FiTrendingUp, FiUsers, FiEye, FiDollarSign, FiCalendar } = FiIcons;

const AdminAnalytics = () => {
  const { users, advertisements, payments, tasks, appointments, documents } = useData();

  // Calculate analytics data
  const analytics = {
    userGrowth: {
      thisMonth: users.filter(u => 
        new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      lastMonth: users.filter(u => {
        const date = new Date(u.created_at);
        const lastMonth = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return date > lastMonth && date <= thisMonth;
      }).length
    },
    adPerformance: {
      totalImpressions: advertisements.reduce((sum, ad) => sum + (ad.total_impressions || 0), 0),
      totalClicks: advertisements.reduce((sum, ad) => sum + (ad.total_clicks || 0), 0),
      activeAds: advertisements.filter(ad => ad.status === 'active').length,
      pendingAds: advertisements.filter(ad => ad.status === 'pending').length
    },
    revenue: {
      thisMonth: payments
        .filter(p => p.status === 'succeeded' && 
          new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        )
        .reduce((sum, p) => sum + p.amount_euros, 0),
      total: payments
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + p.amount_euros, 0)
    },
    activity: {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      totalAppointments: appointments.length,
      totalDocuments: documents.length
    }
  };

  const growthRate = analytics.userGrowth.lastMonth > 0 
    ? ((analytics.userGrowth.thisMonth - analytics.userGrowth.lastMonth) / analytics.userGrowth.lastMonth * 100).toFixed(1)
    : 100;

  const ctr = analytics.adPerformance.totalImpressions > 0
    ? (analytics.adPerformance.totalClicks / analytics.adPerformance.totalImpressions * 100).toFixed(2)
    : 0;

  const completionRate = analytics.activity.totalTasks > 0
    ? (analytics.activity.completedTasks / analytics.activity.totalTasks * 100).toFixed(1)
    : 0;

  // Role distribution
  const roleDistribution = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  // Recent activity timeline
  const recentActivity = [
    ...tasks.slice(0, 3).map(task => ({
      type: 'task',
      title: `Task: ${task.title}`,
      time: new Date(task.created_at),
      color: 'blue'
    })),
    ...appointments.slice(0, 3).map(apt => ({
      type: 'appointment',
      title: `Appointment: ${apt.title}`,
      time: new Date(apt.created_at),
      color: 'green'
    })),
    ...documents.slice(0, 3).map(doc => ({
      type: 'document',
      title: `Document: ${doc.title}`,
      time: new Date(doc.created_at),
      color: 'purple'
    }))
  ].sort((a, b) => b.time - a.time).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">
          System performance and usage analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Growth</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.userGrowth.thisMonth}</p>
              <p className="text-xs text-green-600 mt-1">+{growthRate}% this month</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <SafeIcon icon={FiUsers} className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ad Performance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{ctr}%</p>
              <p className="text-xs text-gray-500 mt-1">Click-through rate</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <SafeIcon icon={FiEye} className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">€{(analytics.revenue.thisMonth / 100).toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <SafeIcon icon={FiDollarSign} className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Task Completion</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{completionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">{analytics.activity.completedTasks}/{analytics.activity.totalTasks} completed</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Role Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">User Distribution by Role</h3>
          <div className="space-y-4">
            {Object.entries(roleDistribution).map(([role, count]) => {
              const percentage = ((count / users.length) * 100).toFixed(1);
              const colors = {
                patient: 'bg-blue-500',
                doctor: 'bg-green-500',
                nurse: 'bg-purple-500',
                admin: 'bg-red-500',
                sponsor: 'bg-yellow-500'
              };
              
              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colors[role] || 'bg-gray-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{role}s</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{count}</span>
                    <span className="text-xs text-gray-400">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Advertisement Statistics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Advertisement Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Impressions</span>
              <span className="text-lg font-bold text-blue-600">{analytics.adPerformance.totalImpressions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Clicks</span>
              <span className="text-lg font-bold text-green-600">{analytics.adPerformance.totalClicks.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Active Ads</span>
              <span className="text-lg font-bold text-purple-600">{analytics.adPerformance.activeAds}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Pending Approval</span>
              <span className="text-lg font-bold text-orange-600">{analytics.adPerformance.pendingAds}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent System Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Recent System Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full bg-${activity.color}-500 mt-2`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">
                  {activity.time.toLocaleDateString()} at {activity.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </motion.div>

      {/* Revenue Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Revenue Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">€{(analytics.revenue.total / 100).toFixed(0)}</p>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">€{(analytics.revenue.thisMonth / 100).toFixed(0)}</p>
            <p className="text-sm text-gray-500">This Month</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{payments.filter(p => p.status === 'succeeded').length}</p>
            <p className="text-sm text-gray-500">Successful Payments</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;