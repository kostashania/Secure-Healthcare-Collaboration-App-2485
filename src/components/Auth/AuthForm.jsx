import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import SafeIcon from '../../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'

const { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiPhone, FiCalendar, FiFileText, FiCreditCard } = FiIcons

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'patient',
    phoneNumber: '',
    amka: '',
    dateOfBirth: '',
    specialization: '',
    licenseNumber: '',
    bio: '',
    customField1: '',
    customField2: '',
    customField3: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [amkaError, setAmkaError] = useState('')

  const { signIn, signUp, validateAMKA } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      if (isSignUp) {
        // Validate required fields for sign up
        if (!formData.phoneNumber) {
          setError('Phone number is required')
          return
        }
        if (!formData.amka) {
          setError('AMKA is required')
          return
        }
        
        result = await signUp(formData)
      } else {
        result = await signIn(formData.email, formData.password)
      }

      if (!result.success) {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAMKAChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11)
    setFormData({ ...formData, amka: value })
    
    if (value.length === 11) {
      if (validateAMKA(value)) {
        setAmkaError('')
      } else {
        setAmkaError('Invalid AMKA number')
      }
    } else if (value.length > 0) {
      setAmkaError('AMKA must be 11 digits')
    } else {
      setAmkaError('')
    }
  }

  const getRoleColor = (role) => {
    const colors = {
      patient: 'bg-blue-50 text-blue-700 border-blue-200',
      doctor: 'bg-green-50 text-green-700 border-green-200',
      nurse: 'bg-purple-50 text-purple-700 border-purple-200',
      admin: 'bg-red-50 text-red-700 border-red-200',
      sponsor: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      office_manager: 'bg-orange-50 text-orange-700 border-orange-200'
    }
    return colors[role] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const roleOptions = [
    { value: 'patient', label: 'Patient', description: 'Receive healthcare services' },
    { value: 'doctor', label: 'Doctor', description: 'Provide medical care' },
    { value: 'nurse', label: 'Nurse', description: 'Support patient care' },
    { value: 'office_manager', label: 'Office Manager', description: 'Assist clinic operations' },
    { value: 'sponsor', label: 'Sponsor', description: 'Advertise healthcare services' },
    { value: 'admin', label: 'Admin', description: 'System administration' }
  ]

  const getCustomFieldLabels = (role) => {
    switch (role) {
      case 'patient':
        return ['Insurance Provider', 'Emergency Contact', 'Blood Type']
      case 'doctor':
        return ['Department', 'Years of Experience', 'Speciality Focus']
      case 'nurse':
        return ['Unit Assignment', 'Shift Preference', 'Certifications']
      case 'admin':
        return ['Department', 'Access Level', 'Responsibilities']
      case 'sponsor':
        return ['Business Sector', 'Sponsor Type', 'Product Category']
      case 'office_manager':
        return ['Department', 'Experience Level', 'Primary Duties']
      default:
        return ['Custom Field 1', 'Custom Field 2', 'Custom Field 3']
    }
  }

  const customFieldLabels = getCustomFieldLabels(formData.role)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">HC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">HealthCare Collaboration</h1>
            <p className="text-gray-600 mt-2">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (Sign Up) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SafeIcon icon={FiUser} className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SafeIcon icon={FiLock} className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            {/* Required Fields for Sign Up */}
            {isSignUp && (
              <>
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SafeIcon icon={FiPhone} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+30 210 1234567"
                    />
                  </div>
                </div>

                {/* AMKA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AMKA (Social Security Number) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <SafeIcon icon={FiCreditCard} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.amka}
                      onChange={handleAMKAChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        amkaError ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter 11-digit AMKA"
                      maxLength={11}
                    />
                  </div>
                  {amkaError && (
                    <p className="mt-1 text-sm text-red-600">{amkaError}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Greek Social Security Number (11 digits)
                  </p>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Account Type *
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {roleOptions.map((role) => (
                      <motion.button
                        key={role.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, role: role.value })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.role === role.value ? getRoleColor(role.value) : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm opacity-75">{role.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Additional Fields for Healthcare Providers */}
                {(formData.role === 'doctor' || formData.role === 'nurse') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <SafeIcon icon={FiFileText} className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.specialization}
                          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Cardiology, Pediatrics"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Professional license number"
                      />
                    </div>
                  </>
                )}

                {/* Optional Fields */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SafeIcon icon={FiCalendar} className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Additional Information</h3>
                  {customFieldLabels.map((label, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={formData[`customField${index + 1}`]}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          [`customField${index + 1}`]: e.target.value 
                        })}
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>

                {formData.role === 'sponsor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about your company..."
                      rows={3}
                    />
                  </div>
                )}
              </>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || (isSignUp && amkaError)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-medium py-3 rounded-lg hover:from-blue-600 hover:to-green-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </motion.button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Demo Accounts */}
          {!isSignUp && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2 font-medium">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p><strong>Patient:</strong> patient@demo.com</p>
                <p><strong>Doctor:</strong> doctor@demo.com</p>
                <p><strong>Nurse:</strong> nurse@demo.com</p>
                <p><strong>Office Manager:</strong> office@demo.com</p>
                <p><strong>Admin:</strong> admin@demo.com</p>
                <p><strong>Sponsor:</strong> sponsor@demo.com</p>
                <p className="pt-1"><em>Password: demo123 (for all demo accounts)</em></p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default AuthForm