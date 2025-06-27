import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiCheckSquare, FiPlus, FiClock, FiUser, FiCalendar, FiAlertCircle, 
  FiFileText, FiPaperclip, FiUpload, FiX, FiEdit, FiTrash2 
} = FiIcons;

const EnhancedTaskManager = () => {
  const { profile } = useAuth();
  const { 
    tasks, 
    patients, 
    documents,
    users,
    addTask, 
    updateTask, 
    getUserTasks, 
    getPatientTasks,
    addDocument,
    attachDocumentToTask
  } = useData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    patient_id: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium'
  });
  const [attachmentType, setAttachmentType] = useState('existing'); // 'existing' or 'new'
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [newDocumentData, setNewDocumentData] = useState({
    title: '',
    description: '',
    type_id: 'dt-other'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  const getTasksToShow = () => {
    let tasksToShow = [];
    
    if (profile?.role === 'patient') {
      tasksToShow = getUserTasks();
    } else if (selectedPatient) {
      tasksToShow = getPatientTasks(selectedPatient);
    } else {
      tasksToShow = tasks;
    }

    if (filterStatus !== 'all') {
      tasksToShow = tasksToShow.filter(task => task.status === filterStatus);
    }

    return tasksToShow;
  };

  const getAvailableAssignees = () => {
    return users.filter(user => 
      user.role === 'nurse' || user.role === 'doctor' || user.role === 'office_manager'
    );
  };

  const getPatientDocuments = (patientId) => {
    return documents.filter(doc => doc.patient_id === patientId);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    const result = await addTask({
      ...taskData,
      patient_id: profile?.role === 'patient' ? profile.id : taskData.patient_id,
      assigned_by: profile?.id
    });

    if (result.success) {
      setShowCreateModal(false);
      resetForm();
    }
  };

  const handleAttachDocuments = async () => {
    if (!selectedTask) return;

    if (attachmentType === 'existing') {
      // Attach existing documents
      for (const docId of selectedDocuments) {
        await attachDocumentToTask(selectedTask.id, docId);
      }
    } else if (attachmentType === 'new' && selectedFile) {
      // Create new document and attach it
      const docResult = await addDocument({
        title: newDocumentData.title,
        description: newDocumentData.description,
        type_id: newDocumentData.type_id,
        patient_id: selectedTask.patient_id,
        file: selectedFile,
        uploaded_by: profile?.id
      });

      if (docResult.success) {
        await attachDocumentToTask(selectedTask.id, docResult.document.id);
      }
    }

    setShowAttachModal(false);
    resetAttachmentForm();
  };

  const resetForm = () => {
    setTaskData({
      title: '',
      description: '',
      patient_id: '',
      assigned_to: '',
      due_date: '',
      priority: 'medium'
    });
  };

  const resetAttachmentForm = () => {
    setSelectedDocuments([]);
    setNewDocumentData({
      title: '',
      description: '',
      type_id: 'dt-other'
    });
    setSelectedFile(null);
    setAttachmentType('existing');
    setSelectedTask(null);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    await updateTask(taskId, updates);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'yellow';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const tasksToShow = getTasksToShow();
  const availableAssignees = getAvailableAssignees();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Task Management</h1>
          <p className="text-gray-600 mt-1">
            Manage healthcare tasks with document attachments and collaboration
          </p>
        </div>
        {(profile?.role !== 'patient') && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Create Task</span>
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {profile?.role !== 'patient' && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient
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
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasksToShow.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-800`}>
                    {task.priority} priority
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(task.status)}-100 text-${getStatusColor(task.status)}-800`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                {task.description && (
                  <p className="text-gray-600 mb-3">{task.description}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  {task.due_date && (
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                      <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiUser} className="w-4 h-4" />
                    <span>Patient: {task.patient?.full_name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiUser} className="w-4 h-4" />
                    <span>Assigned to: {task.assigned_to_user?.full_name}</span>
                  </div>
                </div>

                {/* Attached Documents */}
                {task.attached_documents && task.attached_documents.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Documents:</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.attached_documents.map((doc) => (
                        <span
                          key={doc.id}
                          className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          <SafeIcon icon={FiFileText} className="w-3 h-3" />
                          <span>{doc.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {/* Attach Document Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedTask(task);
                    setShowAttachModal(true);
                  }}
                  className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm flex items-center space-x-1"
                >
                  <SafeIcon icon={FiPaperclip} className="w-4 h-4" />
                  <span>Attach</span>
                </motion.button>

                {/* Status Change Buttons */}
                {task.status !== 'completed' && task.assigned_to === profile?.id && (
                  <>
                    {task.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusChange(task.id, 'in_progress')}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        Start
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                    >
                      Complete
                    </motion.button>
                  </>
                )}

                {task.status === 'completed' && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <SafeIcon icon={FiCheckSquare} className="w-4 h-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {tasksToShow.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiCheckSquare} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tasks found</p>
            <p className="text-sm text-gray-400 mt-1">
              {profile?.role === 'patient' 
                ? 'No tasks assigned to you' 
                : 'Create your first task to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Task</h2>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskData.title}
                  onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient *
                </label>
                <select
                  required
                  value={taskData.patient_id}
                  onChange={(e) => setTaskData({ ...taskData, patient_id: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To *
                </label>
                <select
                  required
                  value={taskData.assigned_to}
                  onChange={(e) => setTaskData({ ...taskData, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select assignee</option>
                  {availableAssignees.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskData.due_date}
                    onChange={(e) => setTaskData({ ...taskData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Task
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Attach Document Modal */}
      {showAttachModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Attach Documents to Task: {selectedTask.title}
            </h2>

            {/* Attachment Type Selector */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="existing"
                    checked={attachmentType === 'existing'}
                    onChange={(e) => setAttachmentType(e.target.value)}
                    className="mr-2"
                  />
                  <span>Attach Existing Documents</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="new"
                    checked={attachmentType === 'new'}
                    onChange={(e) => setAttachmentType(e.target.value)}
                    className="mr-2"
                  />
                  <span>Upload New Document</span>
                </label>
              </div>
            </div>

            {attachmentType === 'existing' ? (
              // Existing Documents
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Select Documents to Attach:</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {getPatientDocuments(selectedTask.patient_id).map((doc) => (
                    <label
                      key={doc.id}
                      className="flex items-center space-x-3 p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocuments([...selectedDocuments, doc.id]);
                          } else {
                            setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                          }
                        }}
                      />
                      <SafeIcon icon={FiFileText} className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500">{doc.document_type?.name}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              // New Document Upload
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Upload New Document:</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDocumentData.title}
                    onChange={(e) => setNewDocumentData({ ...newDocumentData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter document title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newDocumentData.description}
                    onChange={(e) => setNewDocumentData({ ...newDocumentData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    {selectedFile ? (
                      <div className="space-y-2">
                        <SafeIcon icon={FiFileText} className="w-8 h-8 text-green-600 mx-auto" />
                        <p className="text-sm font-medium text-green-600">{selectedFile.name}</p>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <SafeIcon icon={FiUpload} className="w-8 h-8 text-gray-400 mx-auto" />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Click to upload file
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAttachDocuments}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Attach Documents
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowAttachModal(false);
                  resetAttachmentForm();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTaskManager;