import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, dbHelpers } from '../lib/supabase'
import { toast } from 'react-toastify'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserSession(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await handleUserSession(session.user)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleUserSession = async (authUser) => {
    try {
      setUser(authUser)
      
      // Get user profile
      const userProfile = await dbHelpers.getUserProfile(authUser.id)
      setProfile(userProfile)
      
      if (!userProfile) {
        console.warn('User profile not found for:', authUser.email)
      }
    } catch (error) {
      console.error('Error handling user session:', error)
      toast.error('Error loading user profile')
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (formData) => {
    try {
      setLoading(true)
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const profileData = {
          auth_user_id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          role: formData.role,
          phone_number: formData.phoneNumber || null,
          date_of_birth: formData.dateOfBirth || null,
          specialization: formData.specialization || null,
          license_number: formData.licenseNumber || null,
          bio: formData.bio || null
        }

        const userProfile = await dbHelpers.createUserProfile(profileData)
        setProfile(userProfile)

        toast.success('Account created successfully!')
        return { success: true, user: authData.user, profile: userProfile }
      }

      return { success: false, error: 'User creation failed' }
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Signed in successfully!')
      return { success: true, user: data.user }
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
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
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
      
      const updatedProfile = await dbHelpers.updateUserProfile(profile.id, updates)
      setProfile(updatedProfile)
      
      toast.success('Profile updated successfully!')
      return { success: true, profile: updatedProfile }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Error updating profile')
      return { success: false, error: error.message }
    }
  }

  const deleteUser = async (userId) => {
    try {
      if (!profile || profile.role !== 'admin') {
        throw new Error('Unauthorized')
      }

      await dbHelpers.deleteUserProfile(userId)
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
    // Role checks
    isAdmin: profile?.role === 'admin',
    isSponsor: profile?.role === 'sponsor',
    isDoctor: profile?.role === 'doctor',
    isNurse: profile?.role === 'nurse',
    isPatient: profile?.role === 'patient',
    isHealthcareProvider: profile?.role === 'doctor' || profile?.role === 'nurse',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}