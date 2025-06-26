import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Elements } from '@stripe/react-stripe-js'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { getStripe, stripeHelpers } from '../../lib/stripe'
import { dbHelpers } from '../../lib/supabase'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiEye, FiDollarSign, FiCalendar, FiTrendingUp, FiPlus, FiEdit, FiBarChart, FiCreditCard, FiExternalLink } = FiIcons

const SponsorDashboard = () => {
  const { profile } = useAuth()
  const { 
    advertisements, 
    adPackages, 
    payments,
    createAdvertisement,
    updateAdvertisement,
    createPayment,
    updatePayment 
  } = useData()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateAdModal, setShowCreateAdModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const sponsorAds = advertisements.filter(ad => ad.sponsor_id === profile?.id) || []
  const activeAds = sponsorAds.filter(ad => ad.status === 'active')
  const totalImpressions = sponsorAds.reduce((sum, ad) => sum + (ad.total_impressions || 0), 0)
  const totalClicks = sponsorAds.reduce((sum, ad) => sum + (ad.total_clicks || 0), 0)
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00'

  const stats = [
    { label: 'Active Ads', value: activeAds.length, icon: FiEye, color: 'green' },
    { label: 'Total Impressions', value: totalImpressions.toLocaleString(), icon: FiBarChart, color: 'blue' },
    { label: 'Total Clicks', value: totalClicks.toLocaleString(), icon: FiTrendingUp, color: 'purple' },
    { label: 'Click Rate', value: `${ctr}%`, icon: FiDollarSign, color: 'orange' }
  ]

  const handlePackageSelection = async (packageData) => {
    setSelectedPackage(packageData)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Create payment record
      const payment = await createPayment({
        package_id: selectedPackage.id,
        amount_euros: selectedPackage.price_euros,
        currency: 'EUR',
        status: 'succeeded',
        stripe_payment_intent_id: paymentData.paymentIntent.id,
        description: `Payment for ${selectedPackage.name}`,
        metadata: {
          package_name: selectedPackage.name,
          duration_months: selectedPackage.duration_months
        }
      })

      if (payment.success) {
        // Enable user to create advertisements
        setShowPaymentModal(false)
        setSelectedPackage(null)
        setShowCreateAdModal(true)
      }
    } catch (error) {
      console.error('Error handling payment success:', error)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SponsorOverview ads={sponsorAds} stats={stats} />
      case 'ads':
        return <AdManagement ads={sponsorAds} onCreateAd={() => setShowCreateAdModal(true)} />
      case 'packages':
        return <PackageSelection packages={adPackages} onSelectPackage={handlePackageSelection} />
      case 'analytics':
        return <SponsorAnalytics ads={sponsorAds} />
      default:
        return <SponsorOverview ads={sponsorAds} stats={stats} />
    }
  }

  const SponsorOverview = ({ ads, stats }) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Campaign Overview</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {ads.slice(0, 5).map((ad) => (
              <div key={ad.id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  ad.status === 'active' ? 'bg-green-500' :
                  ad.status === 'pending' ? 'bg-yellow-500' :
                  ad.status === 'approved' ? 'bg-blue-500' :
                  'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {ad.title} - {ad.status}
                </span>
              </div>
            ))}
            {ads.length === 0 && (
              <p className="text-sm text-gray-500">No advertisements yet. Create your first ad to get started!</p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Performance Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Best Performing Ad</span>
              <span className="text-sm font-medium text-gray-900">
                {ads.length > 0 ? ads.sort((a, b) => (b.total_clicks || 0) - (a.total_clicks || 0))[0]?.title || 'N/A' : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month Spend</span>
              <span className="text-sm font-medium text-green-600">
                €{payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + (p.amount_euros || 0), 0) / 100}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average CTR</span>
              <span className="text-sm font-medium text-blue-600">{ctr}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Campaigns</span>
              <span className="text-sm font-medium text-purple-600">{activeAds.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const AdManagement = ({ ads, onCreateAd }) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">My Advertisements</h3>
        <button 
          onClick={onCreateAd}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Create Ad</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <motion.div 
            key={ad.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-medium text-gray-900">{ad.title}</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                ad.status === 'active' ? 'bg-green-100 text-green-800' :
                ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                ad.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                ad.status === 'paused' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {ad.status}
              </span>
            </div>
            
            {ad.image_url && (
              <img src={ad.image_url} alt={ad.title} className="w-full h-32 object-cover rounded-lg mb-4" />
            )}
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{ad.content}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="text-center">
                <p className="text-gray-500">Impressions</p>
                <p className="font-semibold text-lg">{ad.total_impressions || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500">Clicks</p>
                <p className="font-semibold text-lg">{ad.total_clicks || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Created: {new Date(ad.created_at).toLocaleDateString()}</span>
              {ad.end_date && (
                <span>Expires: {new Date(ad.end_date).toLocaleDateString()}</span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 text-sm bg-gray-50 text-gray-600 py-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center space-x-1">
                <SafeIcon icon={FiEdit} className="w-3 h-3" />
                <span>Edit</span>
              </button>
              {ad.status === 'active' ? (
                <button 
                  onClick={() => updateAdvertisement(ad.id, { status: 'paused' })}
                  className="flex-1 text-sm bg-yellow-50 text-yellow-600 py-2 rounded hover:bg-yellow-100 transition-colors"
                >
                  Pause
                </button>
              ) : ad.status === 'paused' ? (
                <button 
                  onClick={() => updateAdvertisement(ad.id, { status: 'active' })}
                  className="flex-1 text-sm bg-green-50 text-green-600 py-2 rounded hover:bg-green-100 transition-colors"
                >
                  Resume
                </button>
              ) : null}
            </div>
          </motion.div>
        ))}
        
        {ads.length === 0 && (
          <div className="col-span-full text-center py-12">
            <SafeIcon icon={FiEye} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No advertisements yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first advertisement to get started</p>
          </div>
        )}
      </div>
    </div>
  )

  const PackageSelection = ({ packages, onSelectPackage }) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Advertisement Packages</h3>
      <p className="text-gray-600">Choose a package to start advertising your healthcare services</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <motion.div 
            key={pkg.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-gray-200 rounded-lg p-6 relative overflow-hidden hover:shadow-lg transition-shadow"
          >
            {pkg.name.toLowerCase().includes('annual') && (
              <div className="absolute top-0 right-0 bg-yellow-500 text-white px-2 py-1 text-xs font-medium rounded-bl-lg">
                Best Value
              </div>
            )}
            
            <div className="text-center mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">{pkg.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">€{(pkg.price_euros / 100).toFixed(0)}</span>
                <span className="text-gray-500 ml-1">
                  /{pkg.duration_months === 1 ? 'month' : `${pkg.duration_months} months`}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {pkg.features && Object.entries(pkg.features).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">
                    {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
                  </span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => onSelectPackage(pkg)}
              className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
              <span>Select Package</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const SponsorAnalytics = ({ ads }) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Click-Through Rate Trend</h4>
          <div className="text-center py-12 text-gray-500">
            <SafeIcon icon={FiTrendingUp} className="w-12 h-12 mx-auto mb-4" />
            <p>CTR performance over time</p>
            <p className="text-sm text-gray-400 mt-2">Chart visualization coming soon...</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Impression Distribution</h4>
          <div className="text-center py-12 text-gray-500">
            <SafeIcon icon={FiBarChart} className="w-12 h-12 mx-auto mb-4" />
            <p>Impressions by advertisement</p>
            <p className="text-sm text-gray-400 mt-2">Chart visualization coming soon...</p>
          </div>
        </div>
      </div>
      
      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Advertisement Performance</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Advertisement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impressions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ads.map((ad) => {
                const adCtr = ad.total_impressions > 0 ? ((ad.total_clicks / ad.total_impressions) * 100).toFixed(2) : '0.00'
                return (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                        <div className="text-sm text-gray-500">{ad.content?.substring(0, 50)}...</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ad.total_impressions || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ad.total_clicks || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {adCtr}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ad.status === 'active' ? 'bg-green-100 text-green-800' :
                        ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {ad.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsor Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your advertisements and track performance
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-sm font-medium text-yellow-700">Sponsor Account</span>
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
              { id: 'overview', name: 'Overview', icon: FiBarChart },
              { id: 'ads', name: 'My Ads', icon: FiEye },
              { id: 'packages', name: 'Packages', icon: FiDollarSign },
              { id: 'analytics', name: 'Analytics', icon: FiTrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600'
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

      {/* Create Ad Modal */}
      {showCreateAdModal && (
        <CreateAdModal 
          onClose={() => setShowCreateAdModal(false)}
          packages={adPackages}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <Elements stripe={getStripe()}>
          <PaymentModal 
            package={selectedPackage}
            onClose={() => {
              setShowPaymentModal(false)
              setSelectedPackage(null)
            }}
            onSuccess={handlePaymentSuccess}
          />
        </Elements>
      )}
    </div>
  )
}

const CreateAdModal = ({ onClose, packages }) => {
  const { createAdvertisement } = useData()
  const [adData, setAdData] = useState({
    title: '',
    content: '',
    image_url: '',
    click_url: '',
    package_id: packages[0]?.id || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Calculate end date based on package duration
      const selectedPackage = packages.find(p => p.id === adData.package_id)
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + selectedPackage.duration_months)

      const result = await createAdvertisement({
        ...adData,
        end_date: endDate.toISOString()
      })

      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Error creating advertisement:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Advertisement</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Advertisement Title
            </label>
            <input
              type="text"
              required
              value={adData.title}
              onChange={(e) => setAdData({ ...adData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter advertisement title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              required
              value={adData.content}
              onChange={(e) => setAdData({ ...adData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter advertisement content"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={adData.image_url}
              onChange={(e) => setAdData({ ...adData, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Click URL (Optional)
            </label>
            <input
              type="url"
              value={adData.click_url}
              onChange={(e) => setAdData({ ...adData, click_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="https://your-website.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package
            </label>
            <select
              required
              value={adData.package_id}
              onChange={(e) => setAdData({ ...adData, package_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} - €{(pkg.price_euros / 100).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Advertisement'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const PaymentModal = ({ package: pkg, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // For demo purposes, simulate successful payment
      // In production, integrate with actual Stripe
      const mockPaymentResult = await stripeHelpers.handlePaymentSuccess(
        'mock_session_id', 
        pkg.id, 
        'user_id'
      )
      
      if (mockPaymentResult.success) {
        onSuccess(mockPaymentResult)
      }
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Payment</h2>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900">{pkg.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
          <p className="text-2xl font-bold text-gray-900 mt-3">
            €{(pkg.price_euros / 100).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            Duration: {pkg.duration_months} month{pkg.duration_months > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiCreditCard} className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Demo Payment</h4>
              <p className="text-sm text-blue-700 mt-1">
                This is a demonstration. In production, you would integrate with Stripe for secure payment processing.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
            <span>{loading ? 'Processing...' : `Pay €${(pkg.price_euros / 100).toFixed(2)}`}</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center mt-4">
          <p>Secure payment processing powered by Stripe</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </motion.div>
    </div>
  )
}

export default SponsorDashboard