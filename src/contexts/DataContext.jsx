import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [relationships, setRelationships] = useState([]);

  useEffect(() => {
    if (user) {
      loadMockData();
    }
  }, [user]);

  const loadMockData = () => {
    // Mock data - in real app, this would fetch from your backend
    const mockPatients = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john@example.com',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1985-06-15',
        phone: '+1234567890'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b332c3f7?w=150&h=150&fit=crop&crop=face',
        dateOfBirth: '1990-03-22',
        phone: '+1234567891'
      }
    ];

    const mockDocuments = [
      {
        id: '1',
        patientId: '1',
        title: 'Blood Test Results',
        type: 'lab_result',
        url: 'https://example.com/doc1.pdf',
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString(),
        description: 'Routine blood work - all values normal'
      }
    ];

    const mockTasks = [
      {
        id: '1',
        patientId: '1',
        title: 'Schedule MRI scan',
        description: 'Book MRI scan for knee injury follow-up',
        assignedTo: user.id,
        assignedBy: user.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'high'
      }
    ];

    const mockAppointments = [
      {
        id: '1',
        patientId: '1',
        doctorId: user.role === 'doctor' ? user.id : '1',
        title: 'Follow-up Consultation',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        type: 'consultation'
      }
    ];

    setPatients(mockPatients);
    setDocuments(mockDocuments);
    setTasks(mockTasks);
    setAppointments(mockAppointments);
  };

  const addDocument = (document) => {
    const newDoc = {
      ...document,
      id: Date.now().toString(),
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString()
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const addTask = (task) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      assignedBy: user.id,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const addAppointment = (appointment) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const getPatientDocuments = (patientId) => {
    return documents.filter(doc => doc.patientId === patientId);
  };

  const getPatientTasks = (patientId) => {
    return tasks.filter(task => task.patientId === patientId);
  };

  const getPatientAppointments = (patientId) => {
    return appointments.filter(apt => apt.patientId === patientId);
  };

  const getUserTasks = () => {
    return tasks.filter(task => task.assignedTo === user.id);
  };

  const value = {
    patients,
    documents,
    tasks,
    appointments,
    relationships,
    addDocument,
    addTask,
    updateTask,
    addAppointment,
    getPatientDocuments,
    getPatientTasks,
    getPatientAppointments,
    getUserTasks
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};