import { createClient } from '@supabase/supabase-js'

// Replace with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseKey === 'your-anon-key') {
  console.warn('⚠️ Please update your Supabase credentials in .env file')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Database helper functions
export const dbHelpers = {
  // User Profile Management with AMKA validation
  async getUserProfile(authUserId) {
    const { data, error } = await supabase
      .from('user_profiles_hc2024')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createUserProfile(userData) {
    const { data, error } = await supabase
      .from('user_profiles_hc2024')
      .insert([userData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateUserProfile(profileId, updates) {
    const { data, error } = await supabase
      .from('user_profiles_hc2024')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Connection Requests Management
  async createConnectionRequest(requestData) {
    const { data, error } = await supabase
      .from('connection_requests_hc2024')
      .insert([requestData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getConnectionRequests(userId, role) {
    let query = supabase
      .from('connection_requests_hc2024')
      .select(`
        *,
        requester:requester_id(*),
        recipient:recipient_id(*)
      `)
    
    if (role === 'patient') {
      query = query.or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    } else if (role === 'doctor') {
      query = query.or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    } else if (role === 'nurse') {
      query = query.or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    } else if (role === 'admin' || role === 'office_manager') {
      // Admin and office manager can see all requests
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async updateConnectionRequest(requestId, updates) {
    const { data, error } = await supabase
      .from('connection_requests_hc2024')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // User Connections Management
  async createUserConnection(connectionData) {
    const { data, error } = await supabase
      .from('user_connections_hc2024')
      .insert([connectionData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserConnections(userId, role) {
    const { data, error } = await supabase
      .from('user_connections_hc2024')
      .select(`
        *,
        user1:user1_id(*),
        user2:user2_id(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('is_active', true)
    
    if (error) throw error
    return data
  },

  async removeUserConnection(connectionId) {
    const { error } = await supabase
      .from('user_connections_hc2024')
      .update({ is_active: false })
      .eq('id', connectionId)
    
    if (error) throw error
  },

  // Document Types Management
  async getDocumentTypes() {
    const { data, error } = await supabase
      .from('document_types_hc2024')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  async createDocumentType(typeData) {
    const { data, error } = await supabase
      .from('document_types_hc2024')
      .insert([typeData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateDocumentType(typeId, updates) {
    const { data, error } = await supabase
      .from('document_types_hc2024')
      .update(updates)
      .eq('id', typeId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Document Tags Management
  async getDocumentTags(documentId) {
    const { data, error } = await supabase
      .from('document_tags_hc2024')
      .select('*')
      .eq('document_id', documentId)
    
    if (error) throw error
    return data
  },

  async createDocumentTag(tagData) {
    const { data, error } = await supabase
      .from('document_tags_hc2024')
      .insert([tagData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Enhanced Documents with Tags and Categories
  async getPatientDocuments(patientId) {
    const { data, error } = await supabase
      .from('documents_hc2024')
      .select(`
        *,
        document_type:type_id(*),
        tags:document_tags_hc2024(*),
        uploaded_by_user:uploaded_by(full_name)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createDocument(documentData) {
    const { data, error } = await supabase
      .from('documents_hc2024')
      .insert([documentData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Examination Rooms Management
  async getExaminationRooms() {
    const { data, error } = await supabase
      .from('examination_rooms_hc2024')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  async createExaminationRoom(roomData) {
    const { data, error } = await supabase
      .from('examination_rooms_hc2024')
      .insert([roomData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateExaminationRoom(roomId, updates) {
    const { data, error } = await supabase
      .from('examination_rooms_hc2024')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Enhanced Appointments with QR codes, memos, and room assignments
  async getAppointments(userId, role, filters = {}) {
    let query = supabase
      .from('appointments_hc2024')
      .select(`
        *,
        patient:patient_id(*),
        provider:provider_id(*),
        examination_room:room_id(*),
        attached_documents:appointment_documents_hc2024(
          document:document_id(*)
        )
      `)
    
    if (role === 'patient') {
      query = query.eq('patient_id', userId)
    } else if (role === 'doctor' || role === 'nurse') {
      query = query.eq('provider_id', userId)
    }
    
    if (filters.room_id) {
      query = query.eq('room_id', filters.room_id)
    }
    
    if (filters.date_from && filters.date_to) {
      query = query
        .gte('appointment_date', filters.date_from)
        .lte('appointment_date', filters.date_to)
    }
    
    const { data, error } = await query.order('appointment_date', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createAppointment(appointmentData) {
    const { data, error } = await supabase
      .from('appointments_hc2024')
      .insert([appointmentData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateAppointment(appointmentId, updates) {
    const { data, error } = await supabase
      .from('appointments_hc2024')
      .update(updates)
      .eq('id', appointmentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Patient Timeline and Logs
  async getPatientTimeline(patientId) {
    const [appointments, documents, tasks] = await Promise.all([
      this.getAppointments(patientId, 'patient'),
      this.getPatientDocuments(patientId),
      this.getPatientTasks(patientId)
    ])
    
    const timeline = [
      ...appointments.map(apt => ({
        ...apt,
        type: 'appointment',
        timestamp: apt.appointment_date,
        title: `Appointment: ${apt.title}`
      })),
      ...documents.map(doc => ({
        ...doc,
        type: 'document',
        timestamp: doc.created_at,
        title: `Document: ${doc.title}`
      })),
      ...tasks.map(task => ({
        ...task,
        type: 'task',
        timestamp: task.created_at,
        title: `Task: ${task.title}`
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    return timeline
  },

  // Enhanced Tasks with Patient linking
  async getPatientTasks(patientId) {
    const { data, error } = await supabase
      .from('tasks_hc2024')
      .select(`
        *,
        patient:patient_id(*),
        assigned_to_user:assigned_to(*),
        assigned_by_user:assigned_by(*)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks_hc2024')
      .insert([taskData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Advertisement Packages with Stripe integration
  async getAdPackages() {
    const { data, error } = await supabase
      .from('ad_packages_hc2024')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) throw error
    return data
  },

  async createAdPackage(packageData) {
    const { data, error } = await supabase
      .from('ad_packages_hc2024')
      .insert([packageData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Advertisement Management with Priority System
  async getActiveAdvertisements() {
    const { data, error } = await supabase
      .from('advertisements_hc2024')
      .select(`
        *,
        sponsor:sponsor_id(full_name),
        package:package_id(*)
      `)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .order('priority_level', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createAdvertisement(adData) {
    const { data, error } = await supabase
      .from('advertisements_hc2024')
      .insert([adData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // System Settings Management
  async getSystemSettings() {
    const { data, error } = await supabase
      .from('system_settings_hc2024')
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  async updateSystemSettings(settings) {
    const { data, error } = await supabase
      .from('system_settings_hc2024')
      .upsert([settings])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Custom Fields Management
  async getCustomFields() {
    const { data, error } = await supabase
      .from('custom_fields_hc2024')
      .select('*')
      .order('role', 'field_order')
    
    if (error) throw error
    return data
  },

  async updateCustomField(fieldId, updates) {
    const { data, error } = await supabase
      .from('custom_fields_hc2024')
      .update(updates)
      .eq('id', fieldId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Doctor Specializations Management
  async getSpecializations() {
    const { data, error } = await supabase
      .from('specializations_hc2024')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  async createSpecialization(specializationData) {
    const { data, error } = await supabase
      .from('specializations_hc2024')
      .insert([specializationData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // QR Code Management
  async generateQRCode(type, entityId, data) {
    const qrData = {
      type,
      entity_id: entityId,
      data: JSON.stringify(data),
      created_at: new Date().toISOString()
    }
    
    const { data: result, error } = await supabase
      .from('qr_codes_hc2024')
      .insert([qrData])
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  async getQRCodeData(qrId) {
    const { data, error } = await supabase
      .from('qr_codes_hc2024')
      .select('*')
      .eq('id', qrId)
      .single()
    
    if (error) throw error
    return data
  }
}

export default supabase