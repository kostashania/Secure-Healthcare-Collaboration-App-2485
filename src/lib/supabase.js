import { createClient } from '@supabase/supabase-js'

// Replace with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

if (supabaseUrl === 'https://your-project-id.supabase.co' || supabaseKey === 'your-anon-key') {
  console.warn('⚠️  Please update your Supabase credentials in .env file')
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
  // User Profile Management
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

  async deleteUserProfile(profileId) {
    const { error } = await supabase
      .from('user_profiles_hc2024')
      .delete()
      .eq('id', profileId)
    
    if (error) throw error
  },

  // Admin Functions
  async getAllUsers() {
    const { data, error } = await supabase
      .from('user_profiles_hc2024')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getAllUsersByRole(role) {
    const { data, error } = await supabase
      .from('user_profiles_hc2024')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('full_name')
    
    if (error) throw error
    return data
  },

  // Patient Assignments
  async getPatientAssignments(patientId) {
    const { data, error } = await supabase
      .from('patient_assignments_hc2024')
      .select(`
        *,
        provider:provider_id(id, full_name, role, specialization),
        assigned_by_user:assigned_by(full_name)
      `)
      .eq('patient_id', patientId)
      .eq('is_active', true)
    
    if (error) throw error
    return data
  },

  async createPatientAssignment(assignmentData) {
    const { data, error } = await supabase
      .from('patient_assignments_hc2024')
      .insert([assignmentData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getProviderPatients(providerId) {
    const { data, error } = await supabase
      .from('patient_assignments_hc2024')
      .select(`
        *,
        patient:patient_id(*)
      `)
      .eq('provider_id', providerId)
      .eq('is_active', true)
    
    if (error) throw error
    return data?.map(assignment => assignment.patient) || []
  },

  // Documents
  async getPatientDocuments(patientId) {
    const { data, error } = await supabase
      .from('documents_hc2024')
      .select(`
        *,
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

  async deleteDocument(documentId) {
    const { error } = await supabase
      .from('documents_hc2024')
      .delete()
      .eq('id', documentId)
    
    if (error) throw error
  },

  // Tasks
  async getUserTasks(userId) {
    const { data, error } = await supabase
      .from('tasks_hc2024')
      .select(`
        *,
        patient:patient_id(full_name),
        assigned_by_user:assigned_by(full_name)
      `)
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getPatientTasks(patientId) {
    const { data, error } = await supabase
      .from('tasks_hc2024')
      .select(`
        *,
        assigned_to_user:assigned_to(full_name),
        assigned_by_user:assigned_by(full_name)
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

  async updateTask(taskId, updates) {
    const { data, error } = await supabase
      .from('tasks_hc2024')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteTask(taskId) {
    const { error } = await supabase
      .from('tasks_hc2024')
      .delete()
      .eq('id', taskId)
    
    if (error) throw error
  },

  // Appointments
  async getUserAppointments(userId, role) {
    let query = supabase
      .from('appointments_hc2024')
      .select(`
        *,
        patient:patient_id(full_name),
        provider:provider_id(full_name, specialization)
      `)
      .order('appointment_date', { ascending: true })

    if (role === 'patient') {
      query = query.eq('patient_id', userId)
    } else if (role === 'doctor' || role === 'nurse') {
      query = query.eq('provider_id', userId)
    }
    
    const { data, error } = await query
    
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

  async deleteAppointment(appointmentId) {
    const { error } = await supabase
      .from('appointments_hc2024')
      .delete()
      .eq('id', appointmentId)
    
    if (error) throw error
  },

  // Advertisement Packages
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

  async updateAdPackage(packageId, updates) {
    const { data, error } = await supabase
      .from('ad_packages_hc2024')
      .update(updates)
      .eq('id', packageId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Advertisements
  async getActiveAdvertisements() {
    const { data, error } = await supabase
      .from('advertisements_hc2024')
      .select(`
        *,
        sponsor:sponsor_id(full_name)
      `)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getSponsorAdvertisements(sponsorId) {
    const { data, error } = await supabase
      .from('advertisements_hc2024')
      .select(`
        *,
        package:package_id(name, duration_months, price_euros)
      `)
      .eq('sponsor_id', sponsorId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getAllAdvertisements() {
    const { data, error } = await supabase
      .from('advertisements_hc2024')
      .select(`
        *,
        sponsor:sponsor_id(full_name, email),
        package:package_id(name, duration_months)
      `)
      .order('created_at', { ascending: false })
    
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

  async updateAdvertisement(adId, updates) {
    const { data, error } = await supabase
      .from('advertisements_hc2024')
      .update(updates)
      .eq('id', adId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteAdvertisement(adId) {
    const { error } = await supabase
      .from('advertisements_hc2024')
      .delete()
      .eq('id', adId)
    
    if (error) throw error
  },

  // Payments
  async createPayment(paymentData) {
    const { data, error } = await supabase
      .from('payments_hc2024')
      .insert([paymentData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updatePayment(paymentId, updates) {
    const { data, error } = await supabase
      .from('payments_hc2024')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserPayments(userId) {
    const { data, error } = await supabase
      .from('payments_hc2024')
      .select(`
        *,
        package:package_id(name, duration_months)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Analytics
  async trackAdImpression(adId, userId = null) {
    const { error } = await supabase
      .from('advertisement_impressions_hc2024')
      .insert([{
        advertisement_id: adId,
        user_id: userId
      }])
    
    if (error) console.error('Error tracking impression:', error)
  },

  async trackAdClick(adId, userId = null) {
    const { error } = await supabase
      .from('advertisement_clicks_hc2024')
      .insert([{
        advertisement_id: adId,
        user_id: userId
      }])
    
    if (error) console.error('Error tracking click:', error)
    
    // Also increment the click counter
    await this.updateAdvertisement(adId, {
      total_clicks: supabase.rpc('increment', { field: 'total_clicks' })
    })
  },

  // Admin Dashboard Stats
  async getAdminStats() {
    const [users, activeAds, totalRevenue, pendingTasks] = await Promise.all([
      supabase.from('user_profiles_hc2024').select('id', { count: 'exact' }),
      supabase.from('advertisements_hc2024').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('payments_hc2024').select('amount_euros').eq('status', 'succeeded'),
      supabase.from('tasks_hc2024').select('id', { count: 'exact' }).eq('status', 'pending')
    ])

    const revenue = totalRevenue.data?.reduce((sum, payment) => sum + payment.amount_euros, 0) || 0

    return {
      totalUsers: users.count || 0,
      activeAds: activeAds.count || 0,
      totalRevenue: revenue,
      pendingTasks: pendingTasks.count || 0
    }
  }
}

export default supabase