import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClipboard, FiPlus, FiEdit, FiTrash2, FiCalendar, FiClock, FiUser, FiMapPin } = FiIcons;

const RoomManager = () => {
  const { profile } = useAuth();
  const { examinationRooms, appointments, getUserAppointments } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState('');

  const getRoomSchedule = (roomId, date) => {
    const dateStr = date.toDateString();
    return appointments.filter(apt => 
      apt.room_id === roomId && 
      new Date(apt.appointment_date).toDateString() === dateStr
    ).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
  };

  const getAllRoomsSchedule = (date) => {
    const schedules = {};
    examinationRooms.forEach(room => {
      schedules[room.id] = getRoomSchedule(room.id, date);
    });
    return schedules;
  };

  const isRoomAvailable = (roomId, date, startTime, duration) => {
    const roomAppointments = getRoomSchedule(roomId, date);
    const requestedStart = new Date(`${date.toDateString()} ${startTime}`);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    return !roomAppointments.some(apt => {
      const aptStart = new Date(apt.appointment_date);
      const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
      
      return (requestedStart < aptEnd && requestedEnd > aptStart);
    });
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const roomSchedules = getAllRoomsSchedule(selectedDate);
  const timeSlots = getTimeSlots();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examination Room Management</h1>
          <p className="text-gray-600 mt-1">
            Manage room schedules and availability
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
          <SafeIcon icon={FiClipboard} className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {examinationRooms.filter(r => r.is_active).length} Active Rooms
          </span>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Room
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Rooms</option>
              {examinationRooms.filter(r => r.is_active).map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Room Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Room Schedule for {formatDate(selectedDate)}
          </h2>
        </div>

        {selectedRoom ? (
          // Single Room View
          <div className="p-6">
            {(() => {
              const room = examinationRooms.find(r => r.id === selectedRoom);
              const roomAppointments = roomSchedules[selectedRoom] || [];
              
              return (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{room?.name}</h3>
                    <p className="text-gray-600">{room?.description}</p>
                  </div>

                  {roomAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <SafeIcon icon={FiCalendar} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No appointments scheduled for this room</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {roomAppointments.map((appointment) => (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <SafeIcon icon={FiClock} className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-600">
                                  {formatTime(appointment.appointment_date)} - 
                                  {formatTime(new Date(new Date(appointment.appointment_date).getTime() + appointment.duration * 60000))}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              appointment.status === 'scheduled' 
                                ? 'bg-blue-100 text-blue-800'
                                : appointment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          
                          <div className="mt-3">
                            <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <SafeIcon icon={FiUser} className="w-4 h-4" />
                                <span>Patient: {appointment.patient?.full_name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <SafeIcon icon={FiUser} className="w-4 h-4" />
                                <span>Doctor: {appointment.provider?.full_name}</span>
                              </div>
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          // All Rooms View
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  {examinationRooms.filter(r => r.is_active).map((room) => (
                    <th key={room.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {room.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {timeSlot}
                    </td>
                    {examinationRooms.filter(r => r.is_active).map((room) => {
                      const roomAppts = roomSchedules[room.id] || [];
                      const timeSlotDate = new Date(`${selectedDate.toDateString()} ${timeSlot}`);
                      
                      const appointment = roomAppts.find(apt => {
                        const aptStart = new Date(apt.appointment_date);
                        const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
                        return timeSlotDate >= aptStart && timeSlotDate < aptEnd;
                      });

                      return (
                        <td key={room.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {appointment ? (
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              <div className="font-medium">{appointment.title}</div>
                              <div className="text-xs">{appointment.patient?.full_name}</div>
                            </div>
                          ) : (
                            <span className="text-green-600 text-xs">Available</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Room List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Examination Rooms</h2>
            {(profile?.role === 'admin' || profile?.role === 'office_manager') && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                <span>Add Room</span>
              </motion.button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examinationRooms.filter(r => r.is_active).map((room) => {
              const todayAppointments = getRoomSchedule(room.id, new Date());
              const selectedDateAppointments = getRoomSchedule(room.id, selectedDate);
              
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{room.name}</h3>
                    {(profile?.role === 'admin' || profile?.role === 'office_manager') && (
                      <div className="flex space-x-2">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{room.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Today:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {todayAppointments.length} appointment{todayAppointments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Selected Date:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRoom(room.id)}
                      className="w-full bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      View Schedule
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManager;