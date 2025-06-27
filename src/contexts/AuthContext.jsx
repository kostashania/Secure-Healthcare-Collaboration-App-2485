import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Enhanced demo users with AMKA and phone numbers
const DEMO_USERS = [
  {
    id: 'admin-1',
    email: 'admin@demo.com',
    password: 'demo123',
    profile: {
      id: 'admin-1',
      auth_user_id: 'admin-1',
      email: 'admin@demo.com',
      full_name: 'Admin User',
      role: 'admin',
      phone_number: '+30 210 1234567',
      amka: '12345678901',
      custom_field_1: 'Admin Department',
      custom_field_2: 'Senior Level',
      custom_field_3: 'Full Access',
      is_active: true,
      created_at: new Date().toISOString(),
      profilePicture: 'https://ui-avatars.com/api/?name=Admin+User&background=ef4444&color=fff'
    }
  },
  {
    id: 'doctor-1',
    email: 'doctor@demo.com',
    password: 'demo123',
    profile: {
      id: 'doctor-1',
      auth_user_id: 'doctor-1',
      email: 'doctor@demo.com',
      full_name: 'Dr. Sarah Johnson',
      role: 'doctor',
      phone_number: '+30 210 2345678',
      amka: '23456789012',
      specialization: 'Cardiology',
      license_number: 'MD123456',
      custom_field_1: 'Cardiology Department',
      custom_field_2: '15 years experience',
      custom_field_3: 'Heart Specialist',
      is_active: true,
      created_at: new Date().toISOString(),
      profilePicture: 'https://ui-avatars.com/api/?name=Dr+Sarah+Johnson&background=22c55e&color=fff'
    }
  },
  {
    id: 'nurse-1',
    email: 'nurse@demo.com',
    password: 'demo123',
    profile: {
      id: 'nurse-1',
      auth_user_id: 'nurse-1',
      email: 'nurse@demo.com',
      full_name: 'Maria Rodriguez',
      role: 'nurse',
      phone_number: '+30 210 3456789',
      amka: '34567890123',
      specialization: 'Emergency Care',
      license_number: 'RN789012',
      custom_field_1: 'Emergency Unit',
      custom_field_2: '8 years experience',
      custom_field_3: 'Night Shift',
      is_active: true,
      created_at: new Date().toISOString(),
      profilePicture: 'https://ui-avatars.com/api/?name=Maria+Rodriguez&background=8b5cf6&color=fff'
    }
  },
  {
    id: 'patient-1',
    email: 'patient@demo.com',
    password: 'demo123',
    profile: {
      id: 'patient-1',
      auth_user_id: 'patient-1',
      email: 'patient@demo.com',
      full_name: 'John Smith',
      role: 'patient',
      phone_number: '+30 210 4567890',
      amka: '45678901234',
      date_of_birth: '1985-03-15',
      custom_field_1: 'Insurance: IKA',
      custom_field_2: 'Emergency Contact: +30 210 5678901',
      custom_field_3: 'Blood Type: A+',
      is_active: true,
      created_at: new Date().toISOString(),
      profilePicture: 'https://ui-avatars.com/api/?name=John+Smith&background=3b82f6&color=fff'
    }
  },
  {
    id: 'sponsor-1',
    email: 'sponsor@demo.com',
    password: 'demo123',
    profile: {
      id: 'sponsor-1',
      auth_user_id: 'sponsor-1',
      email: 'sponsor@demo.com',
      full_name: 'MedTech Solutions',
      role: 'sponsor',
      phone_number: '+30 210 5678901',
      amka: '56789012345',
      bio: 'Leading healthcare technology provider',
      custom_field_1: 'Technology Sector',
      custom_field_2: 'Premium Sponsor',
      custom_field_3: 'Medical Equipment',
      is_active: true,
      created_at: new Date().toISOString(),
      profilePicture: 'https://ui-avatars.com/api/?name=MedTech+Solutions&background=eab308&color=fff'
    }
  },
  {
    id: 'office-manager-1',
    email: 'office@demo.com',
    password: 'demo123',
    profile: {
      id: 'office-manager-1',
      auth_user_id: 'office-manager-1',
      email: 'office@demo.com',
      full_name: 'Elena Papadopoulos',
      role: 'office_manager',
      phone_number: '+30 210 6789012',
      amka: '67890123456',
      custom_field_1: 'Office Administration',
      custom_field_2: '10 years experience',
      custom_field_3: 'Patient Coordinator',
      is_active: true,
      created_at: new Date().toISOString(),
      profilePicture: 'https://ui-avatars.com/api/?name=Elena+Papadopoulos&background=f59e0b&color=fff'
    }
  }
]

// AMKA validation function
const validateAMKA = (amka) => {
  if (!amka || amka.length !== 11) return false
  if (!/^\d{11}$/.test(amka)) return false
  
  // AMKA checksum validation
  const digits = amka.split('').map(Number)
  let sum = 0
  
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * Math.pow(2, 10 - i)
  }
  
  const remainder = sum % 11
  const checkDigit = remainder < 2 ? remainder : 11 - remainder
  
  return digits[10] === checkDigit
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('healthcare_auth_user')
    const savedProfile = localStorage.getItem('healthcare_auth_profile')
    
    if (savedUser && savedProfile) {
      try {
        setUser(JSON.parse(savedUser))
        setProfile(JSON.parse(savedProfile))
      } catch (error) {
        console.error('Error parsing saved auth data:', error)
        localStorage.removeItem('healthcare_auth_user')
        localStorage.removeItem('healthcare_auth_profile')
      }
    }
    
    setLoading(false)
  }, [])

  const signUp = async (formData) => {
    try {
      setLoading(true)
      
      // Validate AMKA
      if (!validateAMKA(formData.amka)) {
        throw new Error('Invalid AMKA number. Please enter a valid 11-digit AMKA.')
      }
      
      // Check if email already exists
      const existingUser = DEMO_USERS.find(u => u.email === formData.email)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }
      
      // Check if AMKA already exists
      const existingAMKA = DEMO_USERS.find(u => u.profile.amka === formData.amka)
      if (existingAMKA) {
        throw new Error('User with this AMKA already exists')
      }
      
      // Create new user
      const newUserId = `${formData.role}-${Date.now()}`
      const newUser = {
        id: newUserId,
        email: formData.email
      }
      
      const newProfile = {
        id: newUserId,
        auth_user_id: newUserId,
        email: formData.email,
        full_name: formData.fullName,
        role: formData.role,
        phone_number: formData.phoneNumber,
        amka: formData.amka,
        date_of_birth: formData.dateOfBirth || null,
        specialization: formData.specialization || null,
        license_number: formData.licenseNumber || null,
        bio: formData.bio || null,
        custom_field_1: formData.customField1 || '',
        custom_field_2: formData.customField2 || '',
        custom_field_3: formData.customField3 || '',
        is_active: true,
        created_at: new Date().toISOString(),
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=random&color=fff`
      }
      
      // Save to localStorage
      localStorage.setItem('healthcare_auth_user', JSON.stringify(newUser))
      localStorage.setItem('healthcare_auth_profile', JSON.stringify(newProfile))
      
      setUser(newUser)
      setProfile(newProfile)
      
      toast.success('Account created successfully!')
      return { success: true, user: newUser, profile: newProfile }
      
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      
      // Find demo user
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password)
      if (!demoUser) {
        throw new Error('Invalid email or password')
      }
      
      // Save to localStorage
      localStorage.setItem('healthcare_auth_user', JSON.stringify({ id: demoUser.id, email: demoUser.email }))
      localStorage.setItem('healthcare_auth_profile', JSON.stringify(demoUser.profile))
      
      setUser({ id: demoUser.id, email: demoUser.email })
      setProfile(demoUser.profile)
      
      toast.success('Signed in successfully!')
      return { success: true, user: { id: demoUser.id, email: demoUser.email } }
      
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('healthcare_auth_user')
      localStorage.removeItem('healthcare_auth_profile')
      setUser(null)
      setProfile(null)
      toast.success('Signed out successfully!')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out')
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!profile) throw new Error('No profile found')
      
      // Validate AMKA if it's being updated
      if (updates.amka && !validateAMKA(updates.amka)) {
        throw new Error('Invalid AMKA number. Please enter a valid 11-digit AMKA.')
      }
      
      const updatedProfile = { ...profile, ...updates }
      localStorage.setItem('healthcare_auth_profile', JSON.stringify(updatedProfile))
      setProfile(updatedProfile)
      
      toast.success('Profile updated successfully!')
      return { success: true, profile: updatedProfile }
      
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  const deleteUser = async (userId) => {
    try {
      if (!profile || (profile.role !== 'admin' && profile.role !== 'office_manager')) {
        throw new Error('Unauthorized')
      }
      
      // In demo mode, just show success message
      toast.success('User deleted successfully!')
      return { success: true }
      
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error('Error deleting user')
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    deleteUser,
    validateAMKA,
    
    // Role checks
    isAdmin: profile?.role === 'admin',
    isSponsor: profile?.role === 'sponsor',
    isDoctor: profile?.role === 'doctor',
    isNurse: profile?.role === 'nurse',
    isPatient: profile?.role === 'patient',
    isOfficeManager: profile?.role === 'office_manager',
    isHealthcareProvider: profile?.role === 'doctor' || profile?.role === 'nurse',
    canManageConnections: profile?.role === 'admin' || profile?.role === 'office_manager',
    canViewAllData: profile?.role === 'admin' || profile?.role === 'office_manager'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}