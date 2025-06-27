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

// Enhanced demo data with new features
const INITIAL_DEMO_DATA = {
  users: [
    {
      id: 'admin-1',
      full_name: 'Admin User',
      email: 'admin@demo.com',
      role: 'admin',
      phone_number: '+306912345678',
      amka: '12345678901',
      custom_field_1: 'Department Head',
      custom_field_2: 'System Administrator',
      custom_field_3: 'Senior Level',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'doctor-1',
      full_name: 'Dr. Sarah Johnson',
      email: 'doctor@demo.com',
      role: 'doctor',
      specialization: 'Cardiology',
      phone_number: '+306987654321',
      amka: '98765432109',
      custom_field_1: 'Consultant Cardiologist',
      custom_field_2: '15 years experience',
      custom_field_3: 'Heart Surgery Specialist',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'nurse-1',
      full_name: 'Maria Rodriguez',
      email: 'nurse@demo.com',
      role: 'nurse',
      specialization: 'Emergency Care',
      phone_number: '+306911223344',
      amka: '11223344556',
      custom_field_1: 'Senior Nurse',
      custom_field_2: 'ICU Specialist',
      custom_field_3: '10 years experience',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'patient-1',
      full_name: 'John Smith',
      email: 'patient@demo.com',
      role: 'patient',
      phone_number: '+306955667788',
      amka: '55667788990',
      custom_field_1: 'Insurance: EOPYY',
      custom_field_2: 'Emergency Contact: Jane Smith',
      custom_field_3: 'Blood Type: A+',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'office-manager-1',
      full_name: 'Anna Papadopoulos',
      email: 'office@demo.com',
      role: 'office_manager',
      phone_number: '+306944556677',
      amka: '44556677889',
      custom_field_1: 'Office Coordinator',
      custom_field_2: 'Patient Relations',
      custom_field_3: '5 years experience',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'patient-2',
      full_name: 'Emma Wilson',
      email: 'emma@demo.com',
      role: 'patient',
      phone_number: '+306933445566',
      amka: '33445566778',
      custom_field_1: 'Insurance: IKA',
      custom_field_2: 'Emergency Contact: Mike Wilson',
      custom_field_3: 'Blood Type: O-',
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'sponsor-1',
      full_name: 'MedTech Solutions',
      email: 'sponsor@demo.com',
      role: 'sponsor',
      phone_number: '+302101234567',
      amka: '01234567890',
      custom_field_1: 'Medical Equipment',
      custom_field_2: 'B2B Healthcare',
      custom_field_3: 'Premium Partner',
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],

  // Document types (manageable by admin)
  documentTypes: [
    { id: 'lab-results', name: 'Lab Results', icon: 'FiActivity', color: 'blue' },
    { id: 'prescription', name: 'Prescription', icon: 'FiFileText', color: 'green' },
    { id: 'medical-scan', name: 'Medical Scan', icon: 'FiCamera', color: 'purple' },
    { id: 'medical-report', name: 'Medical Report', icon: 'FiFile', color: 'orange' },
    { id: 'insurance', name: 'Insurance', icon: 'FiShield', color: 'indigo' },
    { id: 'other', name: 'Other', icon: 'FiFolder', color: 'gray' }
  ],

  // Examination rooms
  examinationRooms: [
    { id: 'room-1', name: 'Room 101', description: 'General Consultation Room', is_active: true },
    { id: 'room-2', name: 'Room 102', description: 'Cardiology Room', is_active: true },
    { id: 'room-3', name: 'Room 103', description: 'Emergency Room', is_active: true },
    { id: 'room-4', name: 'Lab Room', description: 'Laboratory Testing', is_active: true }
  ],

  // Custom field labels per role
  customFieldLabels: {
    patient: {
      field_1: 'Insurance Information',
      field_2: 'Emergency Contact',
      field_3: 'Blood Type'
    },
    doctor: {
      field_1: 'Position',
      field_2: 'Years of Experience',
      field_3: 'Specialty Area'
    },
    nurse: {
      field_1: 'Certification Level',
      field_2: 'Department',
      field_3: 'Years of Experience'
    },
    admin: {
      field_1: 'Department',
      field_2: 'Access Level',
      field_3: 'Position Level'
    },
    office_manager: {
      field_1: 'Department',
      field_2: 'Responsibilities',
      field_3: 'Experience Level'
    },
    sponsor: {
      field_1: 'Business Type',
      field_2: 'Market Focus',
      field_3: 'Partnership Level'
    }
  },

  // Connection requests
  connectionRequests: [
    {
      id: 'req-1',
      requester_id: 'patient-1',
      target_id: 'doctor-1',
      requester_type: 'patient',
      target_type: 'doctor',
      status: 'pending',
      requested_at: new Date().toISOString(),
      message: 'Would like to have you as my cardiologist'
    }
  ],

  // User connections/relationships
  userConnections: [
    {
      id: 'conn-1',
      patient_id: 'patient-1',
      provider_id: 'doctor-1',
      provider_type: 'doctor',
      role: 'primary_doctor',
      connected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    },
    {
      id: 'conn-2',
      patient_id: 'patient-1',
      provider_id: 'nurse-1',
      provider_type: 'nurse',
      role: 'assigned_nurse',
      connected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    }
  ],

  // Enhanced documents with tags
  documents: [
    {
      id: 'doc-1',
      title: 'Blood Test Results - Complete Panel',
      description: 'Complete blood count and chemistry panel results',
      type: 'lab-results',
      patient_id: 'patient-1',
      uploaded_by: 'doctor-1',
      url: 'https://example.com/bloodtest.pdf',
      file_name: 'blood_test_results.pdf',
      file_size: 245760,
      tags: ['blood work', 'routine', 'annual checkup'],
      uploaded_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'doc-2',
      title: 'Lisinopril Prescription',
      description: 'Blood pressure medication prescription - 10mg daily',
      type: 'prescription',
      patient_id: 'patient-1',
      uploaded_by: 'doctor-1',
      url: 'https://example.com/prescription.pdf',
      file_name: 'lisinopril_prescription.pdf',
      file_size: 156432,
      tags: ['blood pressure', 'medication', 'daily'],
      uploaded_at: new Date(Date.now() - 172800000).toISOString(),
      created_at: new Date(Date.now() - 172800000).toISOString()
    }
  ],

  // Enhanced tasks
  tasks: [
    {
      id: 'task-1',
      title: 'Blood Pressure Monitoring',
      description: 'Monitor patient blood pressure twice daily for one week and record readings',
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
      title: 'Post-Surgery Follow-up Call',
      description: 'Check on patient recovery progress and pain levels',
      patient_id: 'patient-1',
      assigned_to: 'nurse-1',
      assigned_by: 'doctor-1',
      status: 'completed',
      priority: 'medium',
      due_date: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date(Date.now() - 43200000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ],

  // Enhanced appointments with memo and QR codes
  appointments: [
    {
      id: 'apt-1',
      title: 'Cardiology Consultation',
      patient_id: 'patient-1',
      provider_id: 'doctor-1',
      room_id: 'room-2',
      date: new Date(Date.now() + 172800000).toISOString(),
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      memo: '',
      attached_documents: [],
      qr_code: 'QR-APT-1-' + Date.now(),
      created_at: new Date().toISOString()
    },
    {
      id: 'apt-2',
      title: 'Annual Physical Exam',
      patient_id: 'patient-2',
      provider_id: 'doctor-1',
      room_id: 'room-1',
      date: new Date(Date.now() + 604800000).toISOString(),
      duration: 45,
      type: 'routine',
      status: 'scheduled',
      memo: '',
      attached_documents: [],
      qr_code: 'QR-APT-2-' + Date.now(),
      created_at: new Date().toISOString()
    }
  ],

  // Enhanced advertisement packages with priority levels
  adPackages: [
    {
      id: 'pkg-bronze',
      name: 'Bronze Package',
      description: 'Basic advertising for small practices',
      duration_months: 1,
      price_euros: 1500, // €15.00
      priority: 'bronze',
      display_probability: 10,
      max_ads: 2,
      sort_order: 1,
      is_active: true,
      features: { analytics: true, basic_targeting: true }
    },
    {
      id: 'pkg-silver',
      name: 'Silver Package',
      description: 'Enhanced visibility for growing practices',
      duration_months: 3,
      price_euros: 4000, // €40.00
      priority: 'silver',
      display_probability: 25,
      max_ads: 5,
      sort_order: 2,
      is_active: true,
      features: { analytics: true, advanced_targeting: true, priority_display: true }
    },
    {
      id: 'pkg-gold',
      name: 'Gold Package',
      description: 'Premium advertising with high visibility',
      duration_months: 6,
      price_euros: 7500, // €75.00
      priority: 'gold',
      display_probability: 60,
      max_ads: 10,
      sort_order: 3,
      is_active: true,
      features: { analytics: true, advanced_targeting: true, priority_display: true, featured_placement: true }
    },
    {
      id: 'pkg-platinum',
      name: 'Platinum Package',
      description: 'Ultimate exposure for large medical centers',
      duration_months: 12,
      price_euros: 12000, // €120.00
      priority: 'platinum',
      display_probability: 5,
      max_ads: 20,
      sort_order: 4,
      is_active: true,
      features: { analytics: true, advanced_targeting: true, priority_display: true, featured_placement: true, dedicated_support: true }
    }
  ],

  // Advertisement display settings
  adSettings: {
    display_duration: 8, // seconds
    rotation_enabled: true,
    priority_weights: {
      platinum: 5,
      gold: 60,
      silver: 25,
      bronze: 10
    }
  },

  // Enhanced advertisements
  advertisements: [
    {
      id: 'ad-1',
      title: 'Advanced Cardiac Monitoring System',
      content: 'Revolutionary ECG monitoring technology for better patient outcomes. FDA approved and clinically tested.',
      image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
      click_url: 'https://example.com/cardiac-monitor',
      sponsor_id: 'sponsor-1',
      package_id: 'pkg-gold',
      priority: 'gold',
      status: 'active',
      start_date: new Date(Date.now() - 86400000).toISOString(),
      end_date: new Date(Date.now() + 15552000000).toISOString(), // 6 months
      total_impressions: 2340,
      total_clicks: 156,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      sponsor: { id: 'sponsor-1', full_name: 'MedTech Solutions' }
    }
  ],

  // Payment records
  payments: [
    {
      id: 'pay-1',
      user_id: 'sponsor-1',
      package_id: 'pkg-gold',
      amount_euros: 7500,
      currency: 'EUR',
      status: 'succeeded',
      stripe_payment_intent_id: 'pi_demo_123456',
      description: 'Payment for Gold Package - 6 months',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      package: { name: 'Gold Package', duration_months: 6 }
    }
  ]
}

// Load data from localStorage or use initial data
const loadDataFromStorage = () => {
  try {
    const saved = localStorage.getItem('healthcare_app_data_v2')
    if (saved) {
      const parsedData = JSON.parse(saved)
      // Merge with initial data to ensure new features are available
      return { ...INITIAL_DEMO_DATA, ...parsedData }
    }
  } catch (error) {
    console.error('Error loading data from storage:', error)
  }
  return INITIAL_DEMO_DATA
}

// Save data to localStorage
const saveDataToStorage = (data) => {
  try {
    localStorage.setItem('healthcare_app_data_v2', JSON.stringify(data))
  } catch (error) {
    console.error('Error saving data to storage:', error)
  }
}

export const DataProvider = ({ children }) => {
  const { profile } = useAuth()
  const [data, setData] = useState(loadDataFromStorage)
  const [loading, setLoading] = useState(false)

  // Save data whenever it changes
  useEffect(() => {
    saveDataToStorage(data)
  }, [data])

  // Generate QR code for appointments
  const generateQRCode = (appointmentId) => {
    return `QR-APT-${appointmentId}-${Date.now()}`
  }

  // Helper functions for user connections
  const getUserConnections = (userId) => {
    return data.userConnections.filter(conn => 
      (conn.patient_id === userId || conn.provider_id === userId) && conn.is_active
    )
  }

  const getPatientProviders = (patientId) => {
    const connections = data.userConnections.filter(conn => 
      conn.patient_id === patientId && conn.is_active
    )
    return connections.map(conn => {
      const provider = data.users.find(u => u.id === conn.provider_id)
      return { ...conn, provider }
    })
  }

  const getProviderPatients = (providerId) => {
    const connections = data.userConnections.filter(conn => 
      conn.provider_id === providerId && conn.is_active
    )
    return connections.map(conn => {
      const patient = data.users.find(u => u.id === conn.patient_id)
      return { ...conn, patient }
    })
  }

  // Connection request management
  const createConnectionRequest = async (targetId, targetType, message = '') => {
    try {
      if (!profile) throw new Error('Not authenticated')

      const newRequest = {
        id: `req-${Date.now()}`,
        requester_id: profile.id,
        target_id: targetId,
        requester_type: profile.role,
        target_type: targetType,
        status: 'pending',
        requested_at: new Date().toISOString(),
        message
      }

      setData(prev => ({
        ...prev,
        connectionRequests: [newRequest, ...prev.connectionRequests]
      }))

      toast.success('Connection request sent!')
      return { success: true, request: newRequest }
    } catch (error) {
      console.error('Error creating connection request:', error)
      toast.error('Error sending connection request')
      return { success: false, error: error.message }
    }
  }

  const approveConnectionRequest = async (requestId) => {
    try {
      const request = data.connectionRequests.find(r => r.id === requestId)
      if (!request) throw new Error('Request not found')

      // Create connection
      const newConnection = {
        id: `conn-${Date.now()}`,
        patient_id: request.requester_type === 'patient' ? request.requester_id : request.target_id,
        provider_id: request.requester_type === 'patient' ? request.target_id : request.requester_id,
        provider_type: request.requester_type === 'patient' ? request.target_type : request.requester_type,
        role: request.target_type === 'doctor' ? 'assigned_doctor' : 'assigned_nurse',
        connected_at: new Date().toISOString(),
        is_active: true
      }

      setData(prev => ({
        ...prev,
        userConnections: [newConnection, ...prev.userConnections],
        connectionRequests: prev.connectionRequests.map(req =>
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      }))

      toast.success('Connection request approved!')
      return { success: true }
    } catch (error) {
      console.error('Error approving connection request:', error)
      toast.error('Error approving connection request')
      return { success: false, error: error.message }
    }
  }

  const rejectConnectionRequest = async (requestId) => {
    try {
      setData(prev => ({
        ...prev,
        connectionRequests: prev.connectionRequests.map(req =>
          req.id === requestId ? { ...req, status: 'rejected' } : req
        )
      }))

      toast.success('Connection request rejected')
      return { success: true }
    } catch (error) {
      console.error('Error rejecting connection request:', error)
      toast.error('Error rejecting connection request')
      return { success: false, error: error.message }
    }
  }

  // Document management with tags
  const addDocument = ({ title, description, type, patientId, file, tags = [] }) => {
    try {
      const newDoc = {
        id: `doc-${Date.now()}`,
        title,
        description,
        type,
        patient_id: patientId || profile?.id,
        uploaded_by: profile?.id,
        url: file ? URL.createObjectURL(file) : 'https://example.com/document.pdf',
        file_name: file ? file.name : 'document.pdf',
        file_size: file ? file.size : 0,
        tags: Array.isArray(tags) ? tags : [],
        uploaded_at: new Date().toISOString(),
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

  // Enhanced appointment management
  const addAppointment = ({ title, patientId, date, time, duration, type, roomId, memo = '' }) => {
    try {
      const appointmentDateTime = new Date(`${date}T${time}`)
      
      // Check room availability if room is specified
      if (roomId) {
        const conflictingAppointment = data.appointments.find(apt => 
          apt.room_id === roomId && 
          apt.status === 'scheduled' &&
          new Date(apt.date).toDateString() === appointmentDateTime.toDateString() &&
          Math.abs(new Date(apt.date).getTime() - appointmentDateTime.getTime()) < (duration || 30) * 60000
        )
        
        if (conflictingAppointment) {
          throw new Error('Room is already booked for this time slot')
        }
      }

      const newAppointment = {
        id: `apt-${Date.now()}`,
        title,
        patient_id: patientId,
        provider_id: profile?.role === 'doctor' ? profile.id : 'doctor-1',
        room_id: roomId,
        date: appointmentDateTime.toISOString(),
        duration: duration || 30,
        type: type || 'consultation',
        status: 'scheduled',
        memo,
        attached_documents: [],
        qr_code: generateQRCode(`apt-${Date.now()}`),
        created_at: new Date().toISOString()
      }

      setData(prev => ({
        ...prev,
        appointments: [newAppointment, ...prev.appointments]
      }))

      toast.success('Appointment scheduled successfully!')
      return { success: true, appointment: newAppointment }
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  // Update appointment with memo and documents
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

  // Room management
  const getRoomSchedule = (roomId, date) => {
    const targetDate = new Date(date).toDateString()
    return data.appointments.filter(apt => 
      apt.room_id === roomId && 
      apt.status === 'scheduled' &&
      new Date(apt.date).toDateString() === targetDate
    )
  }

  // Admin functions for managing document types
  const addDocumentType = async (typeData) => {
    try {
      const newType = {
        id: `type-${Date.now()}`,
        ...typeData,
        created_at: new Date().toISOString()
      }

      setData(prev => ({
        ...prev,
        documentTypes: [...prev.documentTypes, newType]
      }))

      toast.success('Document type added successfully!')
      return { success: true, type: newType }
    } catch (error) {
      console.error('Error adding document type:', error)
      toast.error('Error adding document type')
      return { success: false, error: error.message }
    }
  }

  const updateDocumentType = async (typeId, updates) => {
    try {
      setData(prev => ({
        ...prev,
        documentTypes: prev.documentTypes.map(type =>
          type.id === typeId ? { ...type, ...updates } : type
        )
      }))

      toast.success('Document type updated successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error updating document type:', error)
      toast.error('Error updating document type')
      return { success: false, error: error.message }
    }
  }

  const deleteDocumentType = async (typeId) => {
    try {
      setData(prev => ({
        ...prev,
        documentTypes: prev.documentTypes.filter(type => type.id !== typeId)
      }))

      toast.success('Document type deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting document type:', error)
      toast.error('Error deleting document type')
      return { success: false, error: error.message }
    }
  }

  // Update custom field labels
  const updateCustomFieldLabels = async (role, labels) => {
    try {
      setData(prev => ({
        ...prev,
        customFieldLabels: {
          ...prev.customFieldLabels,
          [role]: labels
        }
      }))

      toast.success('Custom field labels updated successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error updating custom field labels:', error)
      toast.error('Error updating custom field labels')
      return { success: false, error: error.message }
    }
  }

  // Advertisement settings management
  const updateAdSettings = async (settings) => {
    try {
      setData(prev => ({
        ...prev,
        adSettings: { ...prev.adSettings, ...settings }
      }))

      toast.success('Advertisement settings updated successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error updating ad settings:', error)
      toast.error('Error updating ad settings')
      return { success: false, error: error.message }
    }
  }

  // Get all existing helper functions (keeping them for backward compatibility)
  const getUserTasks = () => {
    if (!profile) return []
    return data.tasks.filter(task => task.assigned_to === profile.id)
  }

  const getPatientTasks = (patientId) => {
    return data.tasks.filter(task => task.patient_id === patientId)
  }

  const getPatientDocuments = (patientId) => {
    return data.documents.filter(doc => doc.patient_id === patientId)
  }

  const getUserAppointments = (userId, role) => {
    if (role === 'patient') {
      return data.appointments.filter(apt => apt.patient_id === userId)
    } else {
      return data.appointments.filter(apt => apt.provider_id === userId)
    }
  }

  const getPatientAppointments = (patientId) => {
    return data.appointments.filter(apt => apt.patient_id === patientId)
  }

  const getPatientTeam = (patientId) => {
    const connections = data.userConnections.filter(
      conn => conn.patient_id === patientId && conn.is_active
    )
    return connections.map(conn => {
      const provider = data.users.find(user => user.id === conn.provider_id)
      return { ...conn, provider }
    })
  }

  // Continue with other existing functions...
  const addTask = ({ title, description, patientId, assignedTo, dueDate, priority }) => {
    try {
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

  const value = {
    // Data
    users: data.users,
    patients: data.users.filter(u => u.role === 'patient'),
    documents: data.documents,
    documentTypes: data.documentTypes,
    tasks: data.tasks,
    appointments: data.appointments,
    advertisements: data.advertisements,
    adPackages: data.adPackages,
    adSettings: data.adSettings,
    payments: data.payments,
    examinationRooms: data.examinationRooms,
    customFieldLabels: data.customFieldLabels,
    connectionRequests: data.connectionRequests,
    userConnections: data.userConnections,
    loading,

    // Helper functions
    getUserTasks,
    getPatientTasks,
    getPatientDocuments,
    getUserAppointments,
    getPatientAppointments,
    getPatientTeam,
    getUserConnections,
    getPatientProviders,
    getProviderPatients,
    getRoomSchedule,

    // Connection management
    createConnectionRequest,
    approveConnectionRequest,
    rejectConnectionRequest,

    // Document Management
    addDocument,

    // Task Management  
    addTask,
    updateTask,

    // Appointment Management
    addAppointment,
    updateAppointment,

    // Room Management
    getRoomSchedule,

    // Admin Functions
    addDocumentType,
    updateDocumentType,
    deleteDocumentType,
    updateCustomFieldLabels,
    updateAdSettings,

    // Analytics
    trackAdImpression: async (adId) => {
      setData(prev => ({
        ...prev,
        advertisements: prev.advertisements.map(ad =>
          ad.id === adId ? { ...ad, total_impressions: (ad.total_impressions || 0) + 1 } : ad
        )
      }))
    },

    trackAdClick: async (adId) => {
      setData(prev => ({
        ...prev,
        advertisements: prev.advertisements.map(ad =>
          ad.id === adId ? { ...ad, total_clicks: (ad.total_clicks || 0) + 1 } : ad
        )
      }))
    }
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}