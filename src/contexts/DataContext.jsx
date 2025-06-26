import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { dbHelpers } from '../lib/supabase'
import { toast } from 'react-toastify'

const DataContext = createContext({})

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const { profile, isAdmin, isSponsor } = useAuth()
  
  // Core data states
  const [users, setUsers] = useState([])
  const [patients, setPatients] = useState([])
  const [documents, setDocuments] = useState([])
  const [tasks, setTasks] = useState([])
  const [appointments, setAppointments] = useState([])
  const [advertisements, setAdvertisements] = useState([])
  const [adPackages, setAdPackages] = useState([])
  const [payments, setPayments] = useState([])
  const [adminStats, setAdminStats] = useState({})
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) {
      loadData()
    }
  }, [profile])

  const loadData = async () => {
    try {
      setLoading(true)
      
      if (isAdmin) {
        await loadAdminData()
      } else if (isSponsor) {
        await loadSponsorData()
      } else {
        await loadUserData()
      }
      
      // Load ad packages for all users
      await loadAdPackages()
      
      // Load active advertisements for display
      if (!isSponsor && !isAdmin) {
        await loadActiveAdvertisements()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const loadAdminData = async () => {
    try {
      const [allUsers, allAds, stats] = await Promise.all([
        dbHelpers.getAllUsers(),
        dbHelpers.getAllAdvertisements(),
        dbHelpers.getAdminStats()
      ])

      setUsers(allUsers)
      setAdvertisements(allAds)
      setAdminStats(stats)
      setPatients(allUsers.filter(u => u.role === 'patient'))
    } catch (error) {
      console.error('Error loading admin data:', error)
    }
  }

  const loadSponsorData = async () => {
    try {
      const [sponsorAds, userPayments] = await Promise.all([
        dbHelpers.getSponsorAdvertisements(profile.id),
        dbHelpers.getUserPayments(profile.id)
      ])

      setAdvertisements(sponsorAds)
      setPayments(userPayments)
    } catch (error) {
      console.error('Error loading sponsor data:', error)
    }
  }

  const loadUserData = async () => {
    try {
      const loadPromises = []

      if (profile.role === 'patient') {
        loadPromises.push(
          dbHelpers.getPatientDocuments(profile.id).then(setDocuments),
          dbHelpers.getPatientTasks(profile.id).then(setTasks),
          dbHelpers.getUserAppointments(profile.id, 'patient').then(setAppointments)
        )
      } else if (profile.role === 'doctor' || profile.role === 'nurse') {
        loadPromises.push(
          dbHelpers.getProviderPatients(profile.id).then(setPatients),
          dbHelpers.getUserTasks(profile.id).then(setTasks),
          dbHelpers.getUserAppointments(profile.id, profile.role).then(setAppointments)
        )
      }

      await Promise.all(loadPromises)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadAdPackages = async () => {
    try {
      const packages = await dbHelpers.getAdPackages()
      setAdPackages(packages)
    } catch (error) {
      console.error('Error loading ad packages:', error)
    }
  }

  const loadActiveAdvertisements = async () => {
    try {
      const activeAds = await dbHelpers.getActiveAdvertisements()
      setAdvertisements(activeAds)
    } catch (error) {
      console.error('Error loading active advertisements:', error)
    }
  }

  // User Management Functions
  const createUser = async (userData) => {
    try {
      const newUser = await dbHelpers.createUserProfile(userData)
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
      const updatedUser = await dbHelpers.updateUserProfile(userId, updates)
      setUsers(prev => prev.map(user => user.id === userId ? updatedUser : user))
      if (updatedUser.role === 'patient') {
        setPatients(prev => prev.map(patient => patient.id === userId ? updatedUser : patient))
      }
      toast.success('User updated successfully!')
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Error updating user')
      return { success: false, error: error.message }
    }
  }

  const deleteUser = async (userId) => {
    try {
      await dbHelpers.deleteUserProfile(userId)
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
  const createDocument = async (documentData) => {
    try {
      const newDoc = await dbHelpers.createDocument({
        ...documentData,
        uploaded_by: profile.id
      })
      setDocuments(prev => [newDoc, ...prev])
      toast.success('Document uploaded successfully!')
      return { success: true, document: newDoc }
    } catch (error) {
      console.error('Error creating document:', error)
      toast.error('Error uploading document')
      return { success: false, error: error.message }
    }
  }

  const deleteDocument = async (documentId) => {
    try {
      await dbHelpers.deleteDocument(documentId)
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      toast.success('Document deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Error deleting document')
      return { success: false, error: error.message }
    }
  }

  // Task Management
  const createTask = async (taskData) => {
    try {
      const newTask = await dbHelpers.createTask({
        ...taskData,
        assigned_by: profile.id
      })
      setTasks(prev => [newTask, ...prev])
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
      const updatedTask = await dbHelpers.updateTask(taskId, updates)
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task))
      toast.success('Task updated successfully!')
      return { success: true, task: updatedTask }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Error updating task')
      return { success: false, error: error.message }
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await dbHelpers.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      toast.success('Task deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Error deleting task')
      return { success: false, error: error.message }
    }
  }

  // Appointment Management
  const createAppointment = async (appointmentData) => {
    try {
      const newAppointment = await dbHelpers.createAppointment({
        ...appointmentData,
        created_by: profile.id
      })
      setAppointments(prev => [newAppointment, ...prev])
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
      const updatedAppointment = await dbHelpers.updateAppointment(appointmentId, updates)
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? updatedAppointment : apt))
      toast.success('Appointment updated successfully!')
      return { success: true, appointment: updatedAppointment }
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Error updating appointment')
      return { success: false, error: error.message }
    }
  }

  const deleteAppointment = async (appointmentId) => {
    try {
      await dbHelpers.deleteAppointment(appointmentId)
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      toast.success('Appointment deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast.error('Error deleting appointment')
      return { success: false, error: error.message }
    }
  }

  // Advertisement Management
  const createAdvertisement = async (adData) => {
    try {
      const newAd = await dbHelpers.createAdvertisement({
        ...adData,
        sponsor_id: profile.id,
        status: 'pending'
      })
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
      const updatedAd = await dbHelpers.updateAdvertisement(adId, updates)
      setAdvertisements(prev => prev.map(ad => ad.id === adId ? updatedAd : ad))
      if (updates.status) {
        toast.success(`Advertisement ${updates.status} successfully!`)
      }
      return { success: true, advertisement: updatedAd }
    } catch (error) {
      console.error('Error updating advertisement:', error)
      toast.error('Error updating advertisement')
      return { success: false, error: error.message }
    }
  }

  const deleteAdvertisement = async (adId) => {
    try {
      await dbHelpers.deleteAdvertisement(adId)
      setAdvertisements(prev => prev.filter(ad => ad.id !== adId))
      toast.success('Advertisement deleted successfully!')
      return { success: true }
    } catch (error) {
      console.error('Error deleting advertisement:', error)
      toast.error('Error deleting advertisement')
      return { success: false, error: error.message }
    }
  }

  // Package Management (Admin only)
  const createAdPackage = async (packageData) => {
    try {
      const newPackage = await dbHelpers.createAdPackage(packageData)
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
      const updatedPackage = await dbHelpers.updateAdPackage(packageId, updates)
      setAdPackages(prev => prev.map(pkg => pkg.id === packageId ? updatedPackage : pkg))
      toast.success('Package updated successfully!')
      return { success: true, package: updatedPackage }
    } catch (error) {
      console.error('Error updating package:', error)
      toast.error('Error updating package')
      return { success: false, error: error.message }
    }
  }

  // Payment Management
  const createPayment = async (paymentData) => {
    try {
      const newPayment = await dbHelpers.createPayment({
        ...paymentData,
        user_id: profile.id
      })
      setPayments(prev => [newPayment, ...prev])
      return { success: true, payment: newPayment }
    } catch (error) {
      console.error('Error creating payment:', error)
      toast.error('Error processing payment')
      return { success: false, error: error.message }
    }
  }

  const updatePayment = async (paymentId, updates) => {
    try {
      const updatedPayment = await dbHelpers.updatePayment(paymentId, updates)
      setPayments(prev => prev.map(payment => payment.id === paymentId ? updatedPayment : payment))
      return { success: true, payment: updatedPayment }
    } catch (error) {
      console.error('Error updating payment:', error)
      return { success: false, error: error.message }
    }
  }

  // Analytics
  const trackAdImpression = async (adId) => {
    try {
      await dbHelpers.trackAdImpression(adId, profile?.id)
    } catch (error) {
      console.error('Error tracking impression:', error)
    }
  }

  const trackAdClick = async (adId) => {
    try {
      await dbHelpers.trackAdClick(adId, profile?.id)
    } catch (error) {
      console.error('Error tracking click:', error)
    }
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
    
    // User Management
    createUser,
    updateUser,
    deleteUser,
    
    // Document Management
    createDocument,
    deleteDocument,
    
    // Task Management
    createTask,
    updateTask,
    deleteTask,
    
    // Appointment Management
    createAppointment,
    updateAppointment,
    deleteAppointment,
    
    // Advertisement Management
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    
    // Package Management
    createAdPackage,
    updateAdPackage,
    
    // Payment Management
    createPayment,
    updatePayment,
    
    // Analytics
    trackAdImpression,
    trackAdClick,
    
    // Refresh
    refreshData: loadData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}