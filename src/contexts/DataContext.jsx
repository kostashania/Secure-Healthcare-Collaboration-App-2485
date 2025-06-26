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

// Demo data with proper structure
const INITIAL_DEMO_DATA = {
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
      id: 'patient-2',
      full_name: 'Emma Wilson',
      email: 'emma@demo.com',
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
      patientId: 'patient-1',
      uploadedBy: 'doctor-1',
      url: 'https://example.com/bloodtest.pdf',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'doc-2',
      title: 'Prescription - Blood Pressure Medication',
      description: 'Lisinopril 10mg daily prescription',
      type: 'prescription',
      patientId: 'patient-1',
      uploadedBy: 'doctor-1',
      url: 'https://example.com/prescription.pdf',
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Take Blood Pressure Reading',
      description: 'Monitor patient blood pressure twice daily for the next week',
      patientId: 'patient-1',
      assignedTo: 'nurse-1',
      assignedBy: 'doctor-1',
      status: 'pending',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'Follow-up Phone Call',
      description: 'Check on patient recovery progress after surgery',
      patientId: 'patient-1',
      assignedTo: 'nurse-1',
      assignedBy: 'doctor-1',
      status: 'completed',
      priority: 'medium',
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'task-3',
      title: 'Schedule Follow-up Appointment',
      description: 'Book 2-week follow-up for Emma Wilson',
      patientId: 'patient-2',
      assignedTo: 'patient-2',
      assignedBy: 'doctor-1',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      created_at: new Date().toISOString()
    }
  ],
  appointments: [
    {
      id: 'apt-1',
      title: 'Cardiology Consultation',
      patientId: 'patient-1',
      providerId: 'doctor-1',
      date: new Date(Date.now() + 172800000).toISOString(),
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      location: 'Room 205',
      notes: 'Follow-up for blood pressure medication',
      created_at: new Date().toISOString()
    },
    {
      id: 'apt-2',
      title: 'Routine Check-up',
      patientId: 'patient-2',
      providerId: 'doctor-1',
      date: new Date(Date.now() + 604800000).toISOString(),
      duration: 15,
      type: 'routine',
      status: 'scheduled',
      location: 'Room 101',
      notes: 'Annual physical examination',
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
  ],
  teamAssignments: [
    {
      id: 'team-1',
      patientId: 'patient-1',
      providerId: 'doctor-1',
      role: 'primary_doctor',
      assignedBy: 'admin-1',
      assignedAt: new Date(Date.now() - 604800000).toISOString(),
      isActive: true
    },
    {
      id: 'team-2',
      patientId: 'patient-1',
      providerId: 'nurse-1',
      role: 'primary_nurse',
      assignedBy: 'doctor-1',
      assignedAt: new Date(Date.now() - 604800000).toISOString(),
      isActive: true
    },
    {
      id: 'team-3',
      patientId: 'patient-2',
      providerId: 'doctor-1',
      role: 'primary_doctor',
      assignedBy: 'admin-1',
      assignedAt: new Date(Date.now() - 432000000).toISOString(),
      isActive: true
    }
  ]
}

// Load data from localStorage or use initial data
const loadDataFromStorage = () => {
  try {
    const saved = localStorage.getItem('healthcare_app_data')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error loading data from storage:', error)
  }
  return INITIAL_DEMO_DATA
}

// Save data to localStorage
const saveDataToStorage = (data) => {
  try {
    localStorage.setItem('healthcare_app_data', JSON.stringify(data))
  } catch (error) {
    console.error('Error saving data to storage:', error)
  }
}

export const DataProvider = ({ children }) => {
  const { profile } = useAuth()
  
  // Load initial data
  const [data, setData] = useState(loadDataFromStorage)
  const [loading, setLoading] = useState(false)

  // Save data whenever it changes
  useEffect(() => {
    saveDataToStorage(data)
  }, [data])

  // Helper functions to get user-specific data
  const getUserTasks = () => {
    if (!profile) return []
    return data.tasks.filter(task => task.assignedTo === profile.id)
  }

  const getPatientTasks = (patientId) => {
    return data.tasks.filter(task => task.patientId === patientId)
  }

  const getPatientDocuments = (patientId) => {
    return data.documents.filter(doc => doc.patientId === patientId)
  }

  const getUserAppointments = (userId, role) => {
    if (role === 'patient') {
      return data.appointments.filter(apt => apt.patientId === userId)
    } else {
      return data.appointments.filter(apt => apt.providerId === userId)
    }
  }

  const getPatientAppointments = (patientId) => {
    return data.appointments.filter(apt => apt.patientId === patientId)
  }

  const getPatientTeam = (patientId) => {
    const assignments = data.teamAssignments.filter(
      assignment => assignment.patientId === patientId && assignment.isActive
    )
    return assignments.map(assignment => {
      const provider = data.users.find(user => user.id === assignment.providerId)
      return {
        ...assignment,
        provider
      }
    })
  }

  const getProviderPatients = (providerId) => {
    const assignments = data.teamAssignments.filter(
      assignment => assignment.providerId === providerId && assignment.isActive
    )
    return assignments.map(assignment => {
      const patient = data.users.find(user => user.id === assignment.patientId)
      return {
        ...assignment,
        patient
      }
    })
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
      
      setData(prev => ({
        ...prev,
        users: [newUser, ...prev.users]
      }))
      
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
      setData(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === userId ? { ...user, ...updates } : user
        )
      }))
      
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
      setData(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== userId)
      }))
      
      toast.success('User deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error deleting user')
      return { success: false, error: error.message }
    }
  }

  // Document Management
  const addDocument = ({ title, description, type, patientId, file }) => {
    try {
      const newDoc = {
        id: `doc-${Date.now()}`,
        title,
        description,
        type,
        patientId: patientId || profile?.id,
        uploadedBy: profile?.id,
        url: file ? URL.createObjectURL(file) : 'https://example.com/document.pdf',
        fileName: file ? file.name : 'document.pdf',
        fileSize: file ? file.size : 0,
        uploadedAt: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      
      setData(prev => ({
        ...prev,
        documents: [newDoc, ...prev.documents]
      }))
      
      toast.success('Document uploaded successfully!')
      return { success: true, document: newDoc }
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Error uploading document')
      return { success: false, error: error.message }
    }
  }

  const deleteDocument = async (documentId) => {
    try {
      setData(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== documentId)
      }))
      
      toast.success('Document deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Error deleting document')
      return { success: false, error: error.message }
    }
  }

  // Task Management
  const addTask = ({ title, description, patientId, assignedTo, dueDate, priority }) => {
    try {
      const newTask = {
        id: `task-${Date.now()}`,
        title,
        description,
        patientId,
        assignedTo: assignedTo || profile?.id,
        assignedBy: profile?.id,
        status: 'pending',
        priority: priority || 'medium',
        dueDate,
        created_at: new Date().toISOString()
      }
      
      setData(prev => ({
        ...prev,
        tasks: [newTask, ...prev.tasks]
      }))
      
      toast.success('Task created successfully!')
      return { success: true, task: newTask }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Error creating task')
      return { success: false, error: error.message }
    }
  }

  const updateTask = async (taskId, updates) => {
    try {
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      }))
      
      toast.success('Task updated successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Error updating task')
      return { success: false, error: error.message }
    }
  }

  const deleteTask = async (taskId) => {
    try {
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.filter(task => task.id !== taskId)
      }))
      
      toast.success('Task deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Error deleting task')
      return { success: false, error: error.message }
    }
  }

  // Appointment Management
  const addAppointment = ({ title, patientId, date, time, duration, type, location, notes }) => {
    try {
      const appointmentDateTime = new Date(`${date}T${time}`)
      const newAppointment = {
        id: `apt-${Date.now()}`,
        title,
        patientId,
        providerId: profile?.role === 'doctor' ? profile.id : 'doctor-1',
        date: appointmentDateTime.toISOString(),
        duration: duration || 30,
        type: type || 'consultation',
        location,
        notes,
        status: 'scheduled',
        created_at: new Date().toISOString()
      }
      
      setData(prev => ({
        ...prev,
        appointments: [newAppointment, ...prev.appointments]
      }))
      
      toast.success('Appointment created successfully!')
      return { success: true, appointment: newAppointment }
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Error creating appointment')
      return { success: false, error: error.message }
    }
  }

  const updateAppointment = async (appointmentId, updates) => {
    try {
      setData(prev => ({
        ...prev,
        appointments: prev.appointments.map(apt => 
          apt.id === appointmentId ? { ...apt, ...updates } : apt
        )
      }))
      
      toast.success('Appointment updated successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Error updating appointment')
      return { success: false, error: error.message }
    }
  }

  const deleteAppointment = async (appointmentId) => {
    try {
      setData(prev => ({
        ...prev,
        appointments: prev.appointments.filter(apt => apt.id !== appointmentId)
      }))
      
      toast.success('Appointment deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Error deleting appointment')
      return { success: false, error: error.message }
    }
  }

  // Team Management
  const assignProviderToPatient = ({ patientId, providerId, role }) => {
    try {
      const newAssignment = {
        id: `team-${Date.now()}`,
        patientId,
        providerId,
        role,
        assignedBy: profile?.id,
        assignedAt: new Date().toISOString(),
        isActive: true
      }
      
      setData(prev => ({
        ...prev,
        teamAssignments: [newAssignment, ...prev.teamAssignments]
      }))
      
      toast.success('Provider assigned successfully!')
      return { success: true, assignment: newAssignment }
    } catch (error) {
      console.error('Error assigning provider:', error)
      toast.error('Error assigning provider')
      return { success: false, error: error.message }
    }
  }

  const removeProviderFromPatient = (assignmentId) => {
    try {
      setData(prev => ({
        ...prev,
        teamAssignments: prev.teamAssignments.map(assignment =>
          assignment.id === assignmentId 
            ? { ...assignment, isActive: false }
            : assignment
        )
      }))
      
      toast.success('Provider removed from team!')
      return { success: true }
    } catch (error) {
      console.error('Error removing provider:', error)
      toast.error('Error removing provider')
      return { success: false, error: error.message }
    }
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
      
      setData(prev => ({
        ...prev,
        advertisements: [newAd, ...prev.advertisements]
      }))
      
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
      setData(prev => ({
        ...prev,
        advertisements: prev.advertisements.map(ad => 
          ad.id === adId ? { ...ad, ...updates } : ad
        )
      }))
      
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
      setData(prev => ({
        ...prev,
        advertisements: prev.advertisements.filter(ad => ad.id !== adId)
      }))
      
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
      
      setData(prev => ({
        ...prev,
        adPackages: [...prev.adPackages, newPackage]
      }))
      
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
      setData(prev => ({
        ...prev,
        adPackages: prev.adPackages.map(pkg => 
          pkg.id === packageId ? { ...pkg, ...updates } : pkg
        )
      }))
      
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
      
      setData(prev => ({
        ...prev,
        payments: [newPayment, ...prev.payments]
      }))
      
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
    setData(prev => ({
      ...prev,
      advertisements: prev.advertisements.map(ad => 
        ad.id === adId 
          ? { ...ad, total_impressions: (ad.total_impressions || 0) + 1 }
          : ad
      )
    }))
  }

  const trackAdClick = async (adId) => {
    setData(prev => ({
      ...prev,
      advertisements: prev.advertisements.map(ad => 
        ad.id === adId 
          ? { ...ad, total_clicks: (ad.total_clicks || 0) + 1 }
          : ad
      )
    }))
  }

  // Admin Stats
  const adminStats = {
    totalUsers: data.users.length,
    activeAds: data.advertisements.filter(ad => ad.status === 'active').length,
    totalRevenue: data.payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount_euros, 0),
    pendingTasks: data.tasks.filter(t => t.status === 'pending').length
  }

  const value = {
    // Data
    users: data.users,
    patients: data.users.filter(u => u.role === 'patient'),
    documents: data.documents,
    tasks: data.tasks,
    appointments: data.appointments,
    advertisements: data.advertisements,
    adPackages: data.adPackages,
    payments: data.payments,
    teamAssignments: data.teamAssignments,
    adminStats,
    loading,
    
    // Helper functions
    getUserTasks,
    getPatientTasks,
    getPatientDocuments,
    getUserAppointments,
    getPatientAppointments,
    getPatientTeam,
    getProviderPatients,
    
    // User Management
    createUser,
    updateUser,
    deleteUser,
    
    // Document Management
    addDocument,
    deleteDocument,
    
    // Task Management
    addTask,
    updateTask,
    deleteTask,
    
    // Appointment Management
    addAppointment,
    updateAppointment,
    deleteAppointment,
    
    // Team Management
    assignProviderToPatient,
    removeProviderFromPatient,
    
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