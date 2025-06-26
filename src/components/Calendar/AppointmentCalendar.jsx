import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiPlus, FiClock, FiUser, FiMapPin, FiVideo, FiEdit, FiTrash2 } = FiIcons;

const AppointmentCalendar = () => {
  const { profile } = useAuth();
  const { appointments, patients, addAppointment, updateAppointment, deleteAppointment, getPatientAppointments } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.id || '');
  const [appointmentData, setAppointmentData] = useState({
    title: '',
    patientId: '',
    date: '',
    time: '',
    duration: 30,
    type: 'consultation',
    location: '',
    notes: ''
  });

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toDateString();
    let appointmentsToShow = [];

    if (profile?.role === 'patient') {
      appointmentsToShow = appointments.filter(apt => apt.patientId === profile.id);
    } else if (selectedPatient) {
      appointmentsToShow = getPatientAppointments(selectedPatient);
    } else {
      appointmentsToShow = appointments;
    }

    return appointmentsToShow.filter(apt => 
      new Date(apt.date).toDateString() === dateStr
    );
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    
    if (editingAppointment) {
      const appointmentDateTime = new Date(`${appointmentData.date}T${appointmentData.time}`);
      updateAppointment(editingAppointment.id, {
        ...appointmentData,
        date: appointmentDateTime.toISOString(),
        patientId: profile?.role === 'patient' ? profile.id : appointmentData.patientId,
        providerId: profile?.role === 'doctor' ? profile.id : 'doctor-1'
      });
      setEditingAppointment(null);
    } else {
      addAppointment({
        ...appointmentData,
        patientId: profile?.role === 'patient' ? profile.id : appointmentData.patientId,
        providerId: profile?.role === 'doctor' ? profile.id : 'doctor-1'
      });
    }
    
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setAppointmentData({
      title: '',
      patientId: '',
      date: '',
      time: '',
      duration: 30,
      type: 'consultation',
      location: '',
      notes: ''
    });
  };

  const handleEditAppointment = (appointment) => {
    const appointmentDate = new Date(appointment.date);
    setAppointmentData({
      title: appointment.title,
      patientId: appointment.patientId,
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().slice(0, 5),
      duration: appointment.duration,
      type: appointment.type,
      location: appointment.location || '',
      notes: appointment.notes || ''
    });
    setEditingAppointment(appointment);
    setShowCreateModal(true);
  };

  const handleDeleteAppointment = (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointment(appointmentId);
    }
  };

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation', color: 'blue' },
    { value: 'follow_up', label: 'Follow-up', color: 'green' },
    { value: 'emergency', label: 'Emergency', color: 'red' },
    { value: 'routine', label: 'Routine Check', color: 'purple' },
    { value: 'lab', label: 'Lab Work', color: 'orange' }
  ];

  const getTypeColor = (type) => {
    const typeConfig = appointmentTypes.find(t => t.value === type);
    return typeConfig?.color || 'gray';
  };

  const calendarDays = generateCalendarDays();
  const todayAppointments = getAppointmentsForDate(new Date());
  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Calendar</h1>
          <p className="text-gray-600 mt-1">
            Manage appointments and schedule healthcare visits
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetForm();
            setEditingAppointment(null);
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Book Appointment</span>
        </motion.button>
      </div>

      {/* Patient Selector for non-patients */}
      {profile?.role !== 'patient' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Patient
          </label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All patients</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isToday = day && day.toDateString() === new Date().toDateString();
              const isSelected = day && day.toDateString() === selectedDate.toDateString();
              const dayAppointments = day ? getAppointmentsForDate(day) : [];

              return (
                <motion.button
                  key={index}
                  whileHover={day ? { scale: 1.05 } : {}}
                  whileTap={day ? { scale: 0.95 } : {}}
                  onClick={() => day && setSelectedDate(day)}
                  className={`aspect-square p-2 text-sm relative ${
                    !day
                      ? ''
                      : isSelected
                      ? 'bg-blue-600 text-white'
                      : isToday
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'hover:bg-gray-100'
                  } rounded-lg transition-colors`}
                  disabled={!day}
                >
                  {day && (
                    <>
                      <span>{day.getDate()}</span>
                      {dayAppointments.length > 0 && (
                        <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-blue-500'
                        }`} />
                      )}
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          {/* Today's Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Today's Appointments</h3>
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-${getTypeColor(apt.type)}-500`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{apt.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditAppointment(apt)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <SafeIcon icon={FiEdit} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(apt.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No appointments today</p>
              )}
            </div>
          </div>

          {/* Selected Date Appointments */}
          {selectedDate.toDateString() !== new Date().toDateString() && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Appointments
              </h3>
              <div className="space-y-3">
                {selectedDateAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{apt.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getTypeColor(apt.type)}-100 text-${getTypeColor(apt.type)}-800`}>
                          {appointmentTypes.find(t => t.value === apt.type)?.label}
                        </span>
                        <button
                          onClick={() => handleEditAppointment(apt)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <SafeIcon icon={FiClock} className="w-4 h-4" />
                        <span>
                          {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {apt.duration && ` (${apt.duration}min)`}
                        </span>
                      </div>
                      {apt.location && (
                        <div className="flex items-center space-x-1">
                          <SafeIcon icon={FiMapPin} className="w-4 h-4" />
                          <span>{apt.location}</span>
                        </div>
                      )}
                    </div>
                    {apt.notes && (
                      <p className="text-sm text-gray-600 mt-2">{apt.notes}</p>
                    )}
                  </div>
                ))}
                {selectedDateAppointments.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No appointments on this date</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Appointment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
            </h2>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Title
                </label>
                <input
                  type="text"
                  required
                  value={appointmentData.title}
                  onChange={(e) => setAppointmentData({ ...appointmentData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter appointment title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={appointmentData.type}
                  onChange={(e) => setAppointmentData({ ...appointmentData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {appointmentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {profile?.role !== 'patient' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient
                  </label>
                  <select
                    required
                    value={appointmentData.patientId}
                    onChange={(e) => setAppointmentData({ ...appointmentData, patientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentData.date}
                    onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={appointmentData.time}
                    onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={appointmentData.duration}
                  onChange={(e) => setAppointmentData({ ...appointmentData, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={appointmentData.location}
                  onChange={(e) => setAppointmentData({ ...appointmentData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Room 205, Video Call"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={appointmentData.notes}
                  onChange={(e) => setAppointmentData({ ...appointmentData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional notes"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingAppointment ? 'Update Appointment' : 'Book Appointment'}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAppointment(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;