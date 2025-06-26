import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { toast } from 'react-toastify'

const DataContext = createContext({})

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

// Demo data
const DEMO_DATA = {
  users: [
    {
      id: 'admin-1',
      full_name: 'Admin User',
      email: 'admin@demo.com',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'doctor-1',
      full_name: 'Dr. Sarah Johnson',
      email: 'doctor@demo.com',
      role: 'doctor',
      specialization: 'Cardiology',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'nurse-1',
      full_name: 'Maria Rodriguez',
      email: 'nurse@demo.com',
      role: 'nurse',
      specialization: 'Emergency Care',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'patient-1',
      full_name: 'John Smith',
      email: 'patient@demo.com',
      role: 'patient',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'sponsor-1',
      full_name: 'MedTech Solutions',
      email: 'sponsor@demo.com',
      role: 'sponsor',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  documents: [
    {
      id: 'doc-1',
      title: 'Blood Test Results',
      description: 'Complete blood count and chemistry panel',
      type: 'lab_result',
      patient_id: 'patient-1',
      uploaded_by: 'doctor-1',
      url: '#',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'doc-2',
      title: 'Prescription - Medication',
      description: 'Blood pressure medication prescription',
      type: 'prescription',
      patient_id: 'patient-1',
      uploaded_by: 'doctor-1',
      url: '#',
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Take Blood Pressure',
      description: 'Monitor patient blood pressure twice daily',
      patient_id: 'patient-1',
      assigned_to: 'nurse-1',
      assigned_by: 'doctor-1',
      status: 'pending',
      priority: 'high',
      due_date: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'Follow-up Call',
      description: 'Check on patient recovery progress',
      patient_id: 'patient-1',
      assigned_to: 'nurse-1',
      assigned_by: 'doctor-1',
      status: 'completed',
      priority: 'medium',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  appointments: [
    {
      id: 'apt-1',
      title: 'Cardiology Consultation',
      patient_id: 'patient-1',
      provider_id: 'doctor-1',
      appointment_date: new Date(Date.now() + 172800000).toISOString(),
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      created_at: new Date().toISOString()
    },
    {
      id: 'apt-2',
      title: 'Follow-up Visit',
      patient_id: 'patient-1',
      provider_id: 'doctor-1',
      appointment_date: new Date(Date.now() + 604800000).toISOString(),
      duration: 15,
      type: 'follow_up',
      status: 'scheduled',
      created_at: new Date().toISOString()
    }
  ],
  adPackages: [
    {
      id: 'pkg-1',
      name: 'Monthly Basic',
      description: 'Basic advertising package for 1 month',
      duration_months: 1,
      price_euros: 2000, // €20.00
      sort_order: 1,
      is_active: true,
      features: {
        max_ads: 3,
        priority: 'normal',
        analytics: true
      }
    },
    {
      id: 'pkg-2',
      name: 'Quarterly Pro',
      description: 'Professional package for 3 months with better positioning',
      duration_months: 3,
      price_euros: 5000, // €50.00
      sort_order: 2,
      is_active: true,
      features: {
        max_ads: 10,
        priority: 'high',
        analytics: true,
        custom_targeting: true
      }
    },
    {
      id: 'pkg-3',
      name: 'Semi-Annual Premium',
      description: 'Premium package for 6 months with priority placement',
      duration_months: 6,
      price_euros: 8500, // €85.00
      sort_order: 3,
      is_active: true,
      features: {
        max_ads: 20,
        priority: 'premium',
        analytics: true,
        custom_targeting: true,
        dedicated_support: true
      }
    },
    {
      id: 'pkg-4',
      name: 'Annual Ultimate',
      description: 'Ultimate package for 12 months with maximum exposure',
      duration_months: 12,
      price_euros: 15000, // €150.00
      sort_order: 4,
      is_active: true,
      features: {
        max_ads: 'unlimited',
        priority: 'premium',
        analytics: true,
        custom_targeting: true,
        dedicated_support: true,
        featured_placement: true
      }
    }
  ],
  advertisements: [
    {
      id: 'ad-1',
      title: 'Advanced Heart Monitoring System',
      content: 'Revolutionary cardiac monitoring technology for better patient outcomes. FDA approved and hospital tested.',
      image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
      click_url: 'https://example.com/heart-monitor',
      sponsor_id: 'sponsor-1',
      package_id: 'pkg-2',
      status: 'active',
      start_date: new Date(Date.now() - 86400000).toISOString(),
      end_date: new Date(Date.now() + 7776000000).toISOString(), // 3 months
      total_impressions: 1250,
      total_clicks: 89,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      sponsor: {
        id: 'sponsor-1',
        full_name: 'MedTech Solutions'
      }
    },
    {
      id: 'ad-2',
      title: 'Digital Health Platform',
      content: 'Streamline your practice with our comprehensive digital health management platform.',
      image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop',
      click_url: 'https://example.com/health-platform',
      sponsor_id: 'sponsor-1',
      package_id: 'pkg-1',
      status: 'pending',
      created_at: new Date().toISOString(),
      sponsor: {
        id: 'sponsor-1',
        full_name: 'MedTech Solutions'
      }
    }
  ],
  payments: [
    {
      id: 'pay-1',
      user_id: 'sponsor-1',
      package_id: 'pkg-2',
      amount_euros: 5000,
      currency: 'EUR',
      status: 'succeeded',
      stripe_payment_intent_id: 'pi_demo_123456',
      description: 'Payment for Quarterly Pro package',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      package: {
        name: 'Quarterly Pro',
        duration_months: 3
      }
    }
  ]
}

export const DataProvider = ({ children }) => {
  const { profile, isAdmin, isSponsor } = useAuth()
  
  // Core data states
  const [users, setUsers] = useState(DEMO_DATA.users)
  const [patients, setPatients] = useState(DEMO_DATA.users.filter(u => u.role === 'patient'))
  const [documents, setDocuments] = useState(DEMO_DATA.documents)
  const [tasks, setTasks] = useState(DEMO_DATA.tasks)
  const [appointments, setAppointments] = useState(DEMO_DATA.appointments)
  const [advertisements, setAdvertisements] = useState(DEMO_DATA.advertisements)
  const [adPackages, setAdPackages] = useState(DEMO_DATA.adPackages)
  const [payments, setPayments] = useState(DEMO_DATA.payments)
  const [adminStats, setAdminStats] = useState({
    totalUsers: DEMO_DATA.users.length,
    activeAds: DEMO_DATA.advertisements.filter(ad => ad.status === 'active').length,
    totalRevenue: 5000,
    pendingTasks: DEMO_DATA.tasks.filter(t => t.status === 'pending').length
  })
  
  const [loading, setLoading] = useState(false)

  // Helper functions to get user-specific data
  const getUserTasks = () => {
    if (!profile) return []
    return tasks.filter(task => task.assigned_to === profile.id)
  }

  const getPatientTasks = (patientId) => {
    return tasks.filter(task => task.patient_id === patientId)
  }

  const getPatientDocuments = (patientId) => {
    return documents.filter(doc => doc.patient_id === patientId)
  }

  const getUserAppointments = (userId, role) => {
    if (role === 'patient') {
      return appointments.filter(apt => apt.patient_id === userId)
    } else {
      return appointments.filter(apt => apt.provider_id === userId)
    }
  }

  // User Management Functions
  const createUser = async (userData) => {
    try {
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
        created_at: new Date().toISOString(),
        is_active: true
      }
      setUsers(prev => [newUser, ...prev])
      if (newUser.role === 'patient') {
        setPatients(prev => [newUser, ...prev])
      }
      toast.success('User created successfully!')
      return { success: true, user: newUser }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Error creating user')
      return { success: false, error: error.message }
    }
  }

  const updateUser = async (userId, updates) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ))
      if (updates.role === 'patient') {
        setPatients(prev => prev.map(patient => 
          patient.id === userId ? { ...patient, ...updates } : patient
        ))
      }
      toast.success('User updated successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Error updating user')
      return { success: false, error: error.message }
    }
  }

  const deleteUser = async (userId) => {
    try {
      setUsers(prev => prev.filter(user => user.id !== userId))
      setPatients(prev => prev.filter(patient => patient.id !== userId))
      toast.success('User deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error deleting user')
      return { success: false, error: error.message }
    }
  }

  // Document Management
  const addDocument = ({ title, description, type, patientId }) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      title,
      description,
      type,
      patient_id: patientId || profile?.id,
      uploaded_by: profile?.id,
      url: '#',
      uploadedAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    setDocuments(prev => [newDoc, ...prev])
    toast.success('Document uploaded successfully!')
  }

  // Task Management
  const addTask = ({ title, description, patientId, assignedTo, dueDate, priority }) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      patient_id: patientId,
      assigned_to: assignedTo || profile?.id,
      assigned_by: profile?.id,
      status: 'pending',
      priority: priority || 'medium',
      due_date: dueDate,
      created_at: new Date().toISOString()
    }
    setTasks(prev => [newTask, ...prev])
    toast.success('Task created successfully!')
  }

  const updateTask = async (taskId, updates) => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ))
      toast.success('Task updated successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Error updating task')
      return { success: false, error: error.message }
    }
  }

  // Appointment Management
  const addAppointment = ({ title, patientId, date, time, duration, type, location, notes }) => {
    const appointmentDateTime = new Date(`${date}T${time}`)
    const newAppointment = {
      id: `apt-${Date.now()}`,
      title,
      patient_id: patientId,
      provider_id: profile?.role === 'doctor' ? profile.id : 'doctor-1',
      appointment_date: appointmentDateTime.toISOString(),
      duration: duration || 30,
      type: type || 'consultation',
      location,
      notes,
      status: 'scheduled',
      created_at: new Date().toISOString()
    }
    setAppointments(prev => [newAppointment, ...prev])
    toast.success('Appointment created successfully!')
  }

  // Advertisement Management
  const createAdvertisement = async (adData) => {
    try {
      const newAd = {
        id: `ad-${Date.now()}`,
        ...adData,
        sponsor_id: profile?.id,
        status: 'pending',
        total_impressions: 0,
        total_clicks: 0,
        created_at: new Date().toISOString(),
        sponsor: {
          id: profile?.id,
          full_name: profile?.full_name
        }
      }
      setAdvertisements(prev => [newAd, ...prev])
      toast.success('Advertisement created successfully!')
      return { success: true, advertisement: newAd }
    } catch (error) {
      console.error('Error creating advertisement:', error)
      toast.error('Error creating advertisement')
      return { success: false, error: error.message }
    }
  }

  const updateAdvertisement = async (adId, updates) => {
    try {
      setAdvertisements(prev => prev.map(ad => 
        ad.id === adId ? { ...ad, ...updates } : ad
      ))
      if (updates.status) {
        toast.success(`Advertisement ${updates.status} successfully!`)
      }
      return { success: true }
    } catch (error) {
      console.error('Error updating advertisement:', error)
      toast.error('Error updating advertisement')
      return { success: false, error: error.message }
    }
  }

  const deleteAdvertisement = async (adId) => {
    try {
      setAdvertisements(prev => prev.filter(ad => ad.id !== adId))
      toast.success('Advertisement deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting advertisement:', error)
      toast.error('Error deleting advertisement')
      return { success: false, error: error.message }
    }
  }

  // Package Management
  const createAdPackage = async (packageData) => {
    try {
      const newPackage = {
        id: `pkg-${Date.now()}`,
        ...packageData,
        created_at: new Date().toISOString()
      }
      setAdPackages(prev => [...prev, newPackage])
      toast.success('Package created successfully!')
      return { success: true, package: newPackage }
    } catch (error) {
      console.error('Error creating package:', error)
      toast.error('Error creating package')
      return { success: false, error: error.message }
    }
  }

  const updateAdPackage = async (packageId, updates) => {
    try {
      setAdPackages(prev => prev.map(pkg => 
        pkg.id === packageId ? { ...pkg, ...updates } : pkg
      ))
      toast.success('Package updated successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error updating package:', error)
      toast.error('Error updating package')
      return { success: false, error: error.message }
    }
  }

  // Payment Management
  const createPayment = async (paymentData) => {
    try {
      const newPayment = {
        id: `pay-${Date.now()}`,
        ...paymentData,
        user_id: profile?.id,
        created_at: new Date().toISOString()
      }
      setPayments(prev => [newPayment, ...prev])
      toast.success('Payment processed successfully!')
      return { success: true, payment: newPayment }
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error('Error processing payment')
      return { success: false, error: error.message }
    }
  }

  // Analytics
  const trackAdImpression = async (adId) => {
    setAdvertisements(prev => prev.map(ad => 
      ad.id === adId 
        ? { ...ad, total_impressions: (ad.total_impressions || 0) + 1 }
        : ad
    ))
  }

  const trackAdClick = async (adId) => {
    setAdvertisements(prev => prev.map(ad => 
      ad.id === adId 
        ? { ...ad, total_clicks: (ad.total_clicks || 0) + 1 }
        : ad
    ))
  }

  const value = {
    // Data
    users,
    patients,
    documents,
    tasks,
    appointments,
    advertisements,
    adPackages,
    payments,
    adminStats,
    loading,
    
    // Helper functions
    getUserTasks,
    getPatientTasks,
    getPatientDocuments,
    getUserAppointments,
    
    // User Management
    createUser,
    updateUser,
    deleteUser,
    
    // Document Management
    addDocument,
    
    // Task Management
    addTask,
    updateTask,
    
    // Appointment Management
    addAppointment,
    
    // Advertisement Management
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    
    // Package Management
    createAdPackage,
    updateAdPackage,
    
    // Payment Management
    createPayment,
    
    // Analytics
    trackAdImpression,
    trackAdClick
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}