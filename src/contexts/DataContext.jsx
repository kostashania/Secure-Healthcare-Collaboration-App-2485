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

// Enhanced demo data with all new features
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
    { id: 'dt-lab', name: 'Lab Results', description: 'Laboratory test results', color: '#3b82f6', is_active: true },
    { id: 'dt-prescription', name: 'Prescription', description: 'Medical prescriptions', color: '#22c55e', is_active: true },
    { id: 'dt-scan', name: 'Medical Scan', description: 'X-rays, MRI, CT scans', color: '#8b5cf6', is_active: true },
    { id: 'dt-report', name: 'Medical Report', description: 'Doctor reports', color: '#f59e0b', is_active: true },
    { id: 'dt-insurance', name: 'Insurance', description: 'Insurance documents', color: '#6366f1', is_active: true },
    { id: 'dt-other', name: 'Other', description: 'Other documents', color: '#6b7280', is_active: true }
  ],

  // Examination rooms
  examinationRooms: [
    { id: 'room-1', name: 'Room 101', description: 'General Consultation Room', is_active: true },
    { id: 'room-2', name: 'Room 102', description: 'Cardiology Room', is_active: true },
    { id: 'room-3', name: 'Room 103', description: 'Emergency Room', is_active: true },
    { id: 'room-4', name: 'Lab Room', description: 'Laboratory Testing', is_active: true },
    { id: 'room-5', name: 'Surgery Room A', description: 'Main Surgery Room', is_active: true },
    { id: 'room-6', name: 'Therapy Room', description: 'Physical Therapy Room', is_active: true }
  ],

  // Connection requests
  connectionRequests: [
    {
      id: 'req-1',
      requester_id: 'patient-2',
      recipient_id: 'doctor-1',
      requester_role: 'patient',
      recipient_role: 'doctor',
      status: 'pending',
      message: 'Would like to have you as my cardiologist',
      created_at: new Date().toISOString(),
      requester: { id: 'patient-2', full_name: 'Emma Wilson', role: 'patient', email: 'emma@demo.com' },
      recipient: { id: 'doctor-1', full_name: 'Dr. Sarah Johnson', role: 'doctor', email: 'doctor@demo.com' }
    }
  ],

  // User connections/relationships
  userConnections: [
    {
      id: 'conn-1',
      user1_id: 'patient-1',
      user2_id: 'doctor-1',
      connection_type: 'patient_doctor',
      is_active: true,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      user1: { id: 'patient-1', full_name: 'John Smith', role: 'patient', email: 'patient@demo.com' },
      user2: { id: 'doctor-1', full_name: 'Dr. Sarah Johnson', role: 'doctor', email: 'doctor@demo.com' }
    },
    {
      id: 'conn-2',
      user1_id: 'patient-1',
      user2_id: 'nurse-1',
      connection_type: 'patient_nurse',
      is_active: true,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      user1: { id: 'patient-1', full_name: 'John Smith', role: 'patient', email: 'patient@demo.com' },
      user2: { id: 'nurse-1', full_name: 'Maria Rodriguez', role: 'nurse', email: 'nurse@demo.com' }
    }
  ],

  // Enhanced documents with tags
  documents: [
    {
      id: 'doc-1',
      title: 'Blood Test Results - Complete Panel',
      description: 'Complete blood count and chemistry panel results',
      type_id: 'dt-lab',
      patient_id: 'patient-1',
      uploaded_by: 'doctor-1',
      file_url: 'https://example.com/bloodtest.pdf',
      file_name: 'blood_test_results.pdf',
      file_size: 245760,
      mime_type: 'application/pdf',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      document_type: { id: 'dt-lab', name: 'Lab Results', color: '#3b82f6' },
      uploaded_by_user: { full_name: 'Dr. Sarah Johnson' }
    },
    {
      id: 'doc-2',
      title: 'Lisinopril Prescription',
      description: 'Blood pressure medication prescription - 10mg daily',
      type_id: 'dt-prescription',
      patient_id: 'patient-1',
      uploaded_by: 'doctor-1',
      file_url: 'https://example.com/prescription.pdf',
      file_name: 'lisinopril_prescription.pdf',
      file_size: 156432,
      mime_type: 'application/pdf',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      document_type: { id: 'dt-prescription', name: 'Prescription', color: '#22c55e' },
      uploaded_by_user: { full_name: 'Dr. Sarah Johnson' }
    }
  ],

  // Document tags
  documentTags: {
    'doc-1': ['blood work', 'routine', 'annual checkup'],
    'doc-2': ['blood pressure', 'medication', 'daily']
  },

  // Enhanced tasks with document attachments
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
      created_at: new Date().toISOString(),
      patient: { id: 'patient-1', full_name: 'John Smith' },
      assigned_to_user: { id: 'nurse-1', full_name: 'Maria Rodriguez' },
      assigned_by_user: { id: 'doctor-1', full_name: 'Dr. Sarah Johnson' },
      attached_documents: []
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
      created_at: new Date(Date.now() - 86400000).toISOString(),
      patient: { id: 'patient-1', full_name: 'John Smith' },
      assigned_to_user: { id: 'nurse-1', full_name: 'Maria Rodriguez' },
      assigned_by_user: { id: 'doctor-1', full_name: 'Dr. Sarah Johnson' },
      attached_documents: []
    }
  ],

  // Enhanced appointments with QR codes and room assignments
  appointments: [
    {
      id: 'apt-1',
      title: 'Cardiology Consultation',
      patient_id: 'patient-1',
      provider_id: 'doctor-1',
      room_id: 'room-2',
      appointment_date: new Date(Date.now() + 172800000).toISOString(),
      duration: 30,
      type: 'consultation',
      status: 'scheduled',
      location: '',
      notes: '',
      memo: '',
      qr_code: 'QR-APT-1-' + Date.now(),
      created_at: new Date().toISOString(),
      patient: { id: 'patient-1', full_name: 'John Smith', role: 'patient' },
      provider: { id: 'doctor-1', full_name: 'Dr. Sarah Johnson', role: 'doctor' },
      examination_room: { id: 'room-2', name: 'Room 102', description: 'Cardiology Room' },
      attached_documents: []
    },
    {
      id: 'apt-2',
      title: 'Annual Physical Exam',
      patient_id: 'patient-2',
      provider_id: 'doctor-1',
      room_id: 'room-1',
      appointment_date: new Date(Date.now() + 604800000).toISOString(),
      duration: 45,
      type: 'routine',
      status: 'scheduled',
      location: '',
      notes: '',
      memo: '',
      qr_code: 'QR-APT-2-' + Date.now(),
      created_at: new Date().toISOString(),
      patient: { id: 'patient-2', full_name: 'Emma Wilson', role: 'patient' },
      provider: { id: 'doctor-1', full_name: 'Dr. Sarah Johnson', role: 'doctor' },
      examination_room: { id: 'room-1', name: 'Room 101', description: 'General Consultation Room' },
      attached_documents: []
    }
  ],

  // Advertisement packages
  adPackages: [
    {
      id: 'pkg-bronze',
      name: 'Bronze Package',
      description: 'Basic advertising for small practices',
      duration_months: 1,
      price_euros: 1500,
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
      price_euros: 4000,
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
      price_euros: 7500,
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
      price_euros: 12000,
      priority: 'platinum',
      display_probability: 5,
      max_ads: 20,
      sort_order: 4,
      is_active: true,
      features: { analytics: true, advanced_targeting: true, priority_display: true, featured_placement: true, dedicated_support: true }
    }
  ],

  // Advertisement system settings
  adSettings: {
    display_duration: 8,
    rotation_enabled: true,
    priority_weights: { platinum: 5, gold: 60, silver: 25, bronze: 10 }
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
      end_date: new Date(Date.now() + 15552000000).toISOString(),
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
  ],

  // Custom field labels
  customFieldLabels: {
    patient: { field_1: 'Insurance Information', field_2: 'Emergency Contact', field_3: 'Blood Type' },
    doctor: { field_1: 'Department', field_2: 'Years of Experience', field_3: 'Specialty Focus' },
    nurse: { field_1: 'Unit Assignment', field_2: 'Shift Preference', field_3: 'Certifications' },
    admin: { field_1: 'Department', field_2: 'Access Level', field_3: 'Responsibilities' },
    office_manager: { field_1: 'Department', field_2: 'Experience Level', field_3: 'Primary Duties' },
    sponsor: { field_1: 'Business Sector', field_2: 'Sponsor Type', field_3: 'Product Category' }
  },

  // Admin statistics
  adminStats: {
    totalUsers: 7,
    activeAds: 1,
    totalRevenue: 7500,
    pendingTasks: 1
  }
}

// Load data from localStorage or use initial data
const loadDataFromStorage = () => {
  try {
    const saved = localStorage.getItem('healthcare_app_data_v3')
    if (saved) {
      const parsedData = JSON.parse(saved)
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
    localStorage.setItem('healthcare_app_data_v3', JSON.stringify(data))
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

  // Helper functions for user connections
  const getUserConnections = (userId) => {
    return data.userConnections.filter(conn =>
      (conn.user1_id === userId || conn.user2_id === userId) && conn.is_active
    )
  }

  const getPatientProviders = (patientId) => {
    const connections = data.userConnections.filter(conn =>
      conn.user1_id === patientId && conn.is_active
    )
    return connections.map(conn => {
      const provider = data.users.find(u => u.id === conn.user2_id)
      return { ...conn, provider }
    })
  }

  const getProviderPatients = (providerId) => {
    const connections = data.userConnections.filter(conn =>
      conn.user2_id === providerId && conn.is_active
    )
    return connections.map(conn => {
      const patient = data.users.find(u => u.id === conn.user1_id)
      return { ...conn, patient }
    })
  }

  // Connection request management
  const createConnectionRequest = async (requestData) => {
    try {
      if (!profile) throw new Error('Not authenticated')

      const requester = data.users.find(u => u.id === requestData.requester_id)
      const recipient = data.users.find(u => u.id === requestData.recipient_id)

      const newRequest = {
        id: `req-${Date.now()}`,
        ...requestData,
        created_at: new Date().toISOString(),
        requester,
        recipient
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
        user1_id: request.requester_role === 'patient' ? request.requester_id : request.recipient_id,
        user2_id: request.requester_role === 'patient' ? request.recipient_id : request.requester_id,
        connection_type: `${request.requester_role}_${request.recipient_role}`,
        is_active: true,
        created_at: new Date().toISOString(),
        user1: request.requester_role === 'patient' ? request.requester : request.recipient,
        user2: request.requester_role === 'patient' ? request.recipient : request.requester
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

  const removeUserConnection = async (connectionId) => {
    try {
      setData(prev => ({
        ...prev,
        userConnections: prev.userConnections.map(conn =>
          conn.id === connectionId ? { ...conn, is_active: false } : conn
        )
      }))

      toast.success('Connection removed')
      return { success: true }
    } catch (error) {
      console.error('Error removing connection:', error)
      toast.error('Error removing connection')
      return { success: false, error: error.message }
    }
  }

  // Document management with tags
  const addDocument = async ({ title, description, type_id, patient_id, file, uploaded_by, tags = [] }) => {
    try {
      const newDoc = {
        id: `doc-${Date.now()}`,
        title,
        description,
        type_id,
        patient_id: patient_id || profile?.id,
        uploaded_by: uploaded_by || profile?.id,
        file_url: file ? URL.createObjectURL(file) : 'https://example.com/document.pdf',
        file_name: file ? file.name : 'document.pdf',
        file_size: file ? file.size : 0,
        mime_type: file ? file.type : 'application/pdf',
        created_at: new Date().toISOString(),
        document_type: data.documentTypes.find(t => t.id === type_id),
        uploaded_by_user: data.users.find(u => u.id === (uploaded_by || profile?.id))
      }

      setData(prev => ({
        ...prev,
        documents: [newDoc, ...prev.documents],
        documentTags: {
          ...prev.documentTags,
          [newDoc.id]: Array.isArray(tags) ? tags : []
        }
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
        documents: prev.documents.filter(doc => doc.id !== documentId),
        documentTags: Object.fromEntries(
          Object.entries(prev.documentTags).filter(([id]) => id !== documentId)
        )
      }))

      toast.success('Document deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Error deleting document')
      return { success: false, error: error.message }
    }
  }

  const createDocumentTag = async ({ document_id, tag, created_by }) => {
    try {
      setData(prev => ({
        ...prev,
        documentTags: {
          ...prev.documentTags,
          [document_id]: [...(prev.documentTags[document_id] || []), tag]
        }
      }))

      return { success: true }
    } catch (error) {
      console.error('Error creating document tag:', error)
      return { success: false, error: error.message }
    }
  }

  const getDocumentTags = async (documentId) => {
    return (data.documentTags[documentId] || []).map(tag => ({ tag }))
  }

  // Enhanced appointment management
  const addAppointment = async (appointmentData) => {
    try {
      const patient = data.users.find(u => u.id === appointmentData.patient_id)
      const provider = data.users.find(u => u.id === appointmentData.provider_id)
      const room = data.examinationRooms.find(r => r.id === appointmentData.room_id)

      const newAppointment = {
        id: `apt-${Date.now()}`,
        ...appointmentData,
        qr_code: `QR-APT-${Date.now()}`,
        created_at: new Date().toISOString(),
        patient,
        provider,
        examination_room: room,
        attached_documents: []
      }

      setData(prev => ({
        ...prev,
        appointments: [newAppointment, ...prev.appointments]
      }))

      toast.success('Appointment scheduled successfully!')
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

  // Task management with document attachments
  const addTask = async (taskData) => {
    try {
      const patient = data.users.find(u => u.id === taskData.patient_id)
      const assignedTo = data.users.find(u => u.id === taskData.assigned_to)
      const assignedBy = data.users.find(u => u.id === taskData.assigned_by)

      const newTask = {
        id: `task-${Date.now()}`,
        ...taskData,
        created_at: new Date().toISOString(),
        patient,
        assigned_to_user: assignedTo,
        assigned_by_user: assignedBy,
        attached_documents: []
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

  const attachDocumentToTask = async (taskId, documentId) => {
    try {
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                attached_documents: [
                  ...task.attached_documents,
                  data.documents.find(doc => doc.id === documentId)
                ]
              }
            : task
        )
      }))

      toast.success('Document attached to task!')
      return { success: true }
    } catch (error) {
      console.error('Error attaching document to task:', error)
      toast.error('Error attaching document')
      return { success: false, error: error.message }
    }
  }

  // Admin functions
  const createUser = async (userData) => {
    try {
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
        is_active: true,
        created_at: new Date().toISOString()
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

  // Advertisement management
  const createAdvertisement = async (adData) => {
    try {
      const sponsor = data.users.find(u => u.id === adData.sponsor_id)
      const adPackage = data.adPackages.find(p => p.id === adData.package_id)

      const newAd = {
        id: `ad-${Date.now()}`,
        ...adData,
        status: 'pending',
        total_impressions: 0,
        total_clicks: 0,
        created_at: new Date().toISOString(),
        sponsor,
        package: adPackage
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

      toast.success('Advertisement updated successfully!')
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

  // Payment management
  const createPayment = async (paymentData) => {
    try {
      const newPayment = {
        id: `pay-${Date.now()}`,
        ...paymentData,
        created_at: new Date().toISOString()
      }

      setData(prev => ({
        ...prev,
        payments: [newPayment, ...prev.payments]
      }))

      toast.success('Payment recorded successfully!')
      return { success: true, payment: newPayment }
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error('Error recording payment')
      return { success: false, error: error.message }
    }
  }

  // QR Code management
  const createQRCode = async (type, entityId, qrData) => {
    try {
      const qrCode = {
        id: `qr-${Date.now()}`,
        type,
        entity_id: entityId,
        data: qrData,
        created_at: new Date().toISOString()
      }

      console.log('QR Code created:', qrCode)
      return { success: true, qrCode }
    } catch (error) {
      console.error('Error creating QR code:', error)
      return { success: false, error: error.message }
    }
  }

  // Helper functions for getting filtered data
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
    } else if (role === 'doctor' || role === 'nurse') {
      return data.appointments.filter(apt => apt.provider_id === userId)
    } else if (role === 'office_manager' || role === 'admin') {
      return data.appointments
    }
    return []
  }

  const getPatientAppointments = (patientId) => {
    return data.appointments.filter(apt => apt.patient_id === patientId)
  }

  const getPatientTeam = (patientId) => {
    const connections = data.userConnections.filter(
      conn => conn.user1_id === patientId && conn.is_active
    )
    return connections.map(conn => {
      const provider = data.users.find(user => user.id === conn.user2_id)
      return { ...conn, provider }
    })
  }

  const trackAdImpression = async (adId) => {
    setData(prev => ({
      ...prev,
      advertisements: prev.advertisements.map(ad =>
        ad.id === adId ? { ...ad, total_impressions: (ad.total_impressions || 0) + 1 } : ad
      )
    }))
  }

  const trackAdClick = async (adId) => {
    setData(prev => ({
      ...prev,
      advertisements: prev.advertisements.map(ad =>
        ad.id === adId ? { ...ad, total_clicks: (ad.total_clicks || 0) + 1 } : ad
      )
    }))
  }

  const value = {
    // Data
    users: data.users,
    patients: data.users.filter(u => u.role === 'patient'),
    documents: data.documents,
    documentTypes: data.documentTypes,
    documentTags: data.documentTags,
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
    adminStats: data.adminStats,
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

    // Connection management
    createConnectionRequest,
    approveConnectionRequest,
    rejectConnectionRequest,
    removeUserConnection,

    // Document Management
    addDocument,
    deleteDocument,
    createDocumentTag,
    getDocumentTags,

    // Task Management
    addTask,
    updateTask,
    attachDocumentToTask,

    // Appointment Management
    addAppointment,
    updateAppointment,
    deleteAppointment,

    // User Management
    createUser,
    updateUser,
    deleteUser,

    // Advertisement Management
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,

    // Payment Management
    createPayment,

    // QR Code Management
    createQRCode,

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