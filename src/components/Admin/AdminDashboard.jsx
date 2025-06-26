import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiUsers, FiDollarSign, FiEye, FiSettings, FiBarChart3, FiPackage, FiPlus, FiEdit, FiTrash2, FiCheck, FiX } = FiIcons

const AdminDashboard = () => {
  const { profile } = useAuth()
  const { 
    users, 
    advertisements, 
    adPackages, 
    adminStats,
    createUser,
    updateUser,
    deleteUser,
    createAdPackage,
    updateAdPackage,
    updateAdvertisement,
    deleteAdvertisement
  } = useData()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const stats = [
    { label: 'Total Users', value: adminStats.totalUsers || 0, icon: FiUsers, color: 'blue' },
    { label: 'Active Ads', value: adminStats.activeAds || 0, icon: FiEye, color: 'green' },
    { label: 'Total Revenue', value: `€${((adminStats.totalRevenue || 0) / 100).toFixed(2)}`, icon: FiDollarSign, color: 'orange' },
    { label: 'Pending Tasks', value: adminStats.pendingTasks || 0, icon: FiPackage, color: 'purple' }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview stats={stats} />
      case 'users':
        return <UserManagement />
      case 'advertisements':
        return <AdvertisementManagement />
      case 'packages':
        return <PackageManagement />
      case 'analytics':
        return <AdminAnalytics />
      default:
        return <AdminOverview stats={stats} />
    }
  }

  const AdminOverview = ({ stats }) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New user registered: Dr. Sarah Johnson</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Advertisement approved: MedTech Solutions</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Package purchased: Annual Premium</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System backup completed successfully</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">System Health</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Status</span>
              <span className="text-sm font-medium text-green-600 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Healthy
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-sm font-medium text-green-600">Fast (&lt;100ms)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Storage Usage</span>
              <span className="text-sm font-medium text-yellow-600">75% Used</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm font-medium text-blue-600">{users.filter(u => u.is_active).length} online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const UserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'doctor' ? 'bg-green-100 text-green-800' :
                      user.role === 'nurse' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'sponsor' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setEditingItem(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                      </button>
                      {user.id !== profile.id && (
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const AdvertisementManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Advertisement Management</h3>
        <div className="text-sm text-gray-500">
          {advertisements.filter(ad => ad.status === 'pending').length} pending approval
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advertisements.map((ad) => (
          <motion.div 
            key={ad.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">{ad.title}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                ad.status === 'active' ? 'bg-green-100 text-green-800' :
                ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                ad.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {ad.status}
              </span>
            </div>
            
            {ad.image_url && (
              <img src={ad.image_url} alt={ad.title} className="w-full h-32 object-cover rounded-lg mb-4" />
            )}
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{ad.content}</p>
            
            <div className="space-y-2 mb-4 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Sponsor:</span>
                <span className="font-medium">{ad.sponsor?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Impressions:</span>
                <span className="font-medium">{ad.total_impressions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Clicks:</span>
                <span className="font-medium">{ad.total_clicks || 0}</span>
              </div>
            </div>
            
            {ad.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => updateAdvertisement(ad.id, { 
                    status: 'approved', 
                    approved_by: profile.id, 
                    approved_at: new Date().toISOString(),
                    start_date: new Date().toISOString()
                  })}
                  className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => updateAdvertisement(ad.id, { 
                    status: 'rejected',
                    approved_by: profile.id,
                    approved_at: new Date().toISOString()
                  })}
                  className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
            
            {ad.status !== 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingItem(ad)}
                  className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAdvertisement(ad.id)}
                  className="bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            )}
          </motion.div>
        ))}
        
        {advertisements.length === 0 && (
          <div className="col-span-full text-center py-12">
            <SafeIcon icon={FiEye} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No advertisements found</p>
          </div>
        )}
      </div>
    </div>
  )

  const PackageManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Package Management</h3>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adPackages.map((pkg) => (
          <motion.div 
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {pkg.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">{pkg.duration_months} months</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Price:</span>
                <span className="font-medium">€{(pkg.price_euros / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sort Order:</span>
                <span className="font-medium">{pkg.sort_order}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingItem(pkg)}
                className="flex-1 text-sm bg-gray-50 text-gray-600 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => updateAdPackage(pkg.id, { is_active: !pkg.is_active })}
                className={`flex-1 text-sm py-2 rounded transition-colors ${
                  pkg.is_active 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {pkg.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const AdminAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Analytics & Reports</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">User Growth</h4>
          <div className="text-center py-12 text-gray-500">
            <SafeIcon icon={FiBarChart3} className="w-12 h-12 mx-auto mb-4" />
            <p>User registration trends chart</p>
            <p className="text-sm text-gray-400 mt-2">Coming soon...</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Revenue Analytics</h4>
          <div className="text-center py-12 text-gray-500">
            <SafeIcon icon={FiDollarSign} className="w-12 h-12 mx-auto mb-4" />
            <p>Revenue breakdown chart</p>
            <p className="text-sm text-gray-400 mt-2">Coming soon...</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Quick Stats</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'patient').length}</div>
            <div className="text-sm text-gray-500">Patients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'doctor').length}</div>
            <div className="text-sm text-gray-500">Doctors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'nurse').length}</div>
            <div className="text-sm text-gray-500">Nurses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.role === 'sponsor').length}</div>
            <div className="text-sm text-gray-500">Sponsors</div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage users, advertisements, and system settings
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-sm font-medium text-red-700">Admin Access</span>
        </div>
      </div>

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

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: FiBarChart3 },
              { id: 'users', name: 'Users', icon: FiUsers },
              { id: 'advertisements', name: 'Advertisements', icon: FiEye },
              { id: 'packages', name: 'Packages', icon: FiPackage },
              { id: 'analytics', name: 'Analytics', icon: FiBarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard