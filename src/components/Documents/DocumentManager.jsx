import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFileText, FiUpload, FiDownload, FiEye, FiTrash2, FiPlus, FiTag } = FiIcons;

const DocumentManager = () => {
  const { user } = useAuth();
  const { documents, patients, addDocument, getPatientDocuments } = useData();
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.id || '');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'lab_result',
    patientId: ''
  });

  const documentTypes = [
    { value: 'lab_result', label: 'Lab Result', color: 'blue' },
    { value: 'prescription', label: 'Prescription', color: 'green' },
    { value: 'scan', label: 'Medical Scan', color: 'purple' },
    { value: 'report', label: 'Medical Report', color: 'orange' },
    { value: 'insurance', label: 'Insurance', color: 'gray' },
    { value: 'other', label: 'Other', color: 'indigo' }
  ];

  const getDocumentsToShow = () => {
    if (user?.role === 'patient') {
      return documents.filter(doc => doc.patientId === user.id);
    } else if (selectedPatient) {
      return getPatientDocuments(selectedPatient);
    }
    return documents;
  };

  const handleUpload = (e) => {
    e.preventDefault();
    const patientId = user?.role === 'patient' ? user.id : uploadData.patientId;
    
    addDocument({
      ...uploadData,
      patientId,
      url: 'https://example.com/document.pdf' // Mock URL
    });
    
    setShowUploadModal(false);
    setUploadData({ title: '', description: '', type: 'lab_result', patientId: '' });
  };

  const getTypeColor = (type) => {
    const typeConfig = documentTypes.find(t => t.value === type);
    return typeConfig?.color || 'gray';
  };

  const documentsToShow = getDocumentsToShow();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize medical documents securely
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Upload Document</span>
        </motion.button>
      </div>

      {/* Patient Selector for Doctors/Nurses */}
      {user?.role !== 'patient' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Patient
          </label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentsToShow.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${getTypeColor(doc.type)}-50`}>
                <SafeIcon icon={FiFileText} className={`w-6 h-6 text-${getTypeColor(doc.type)}-600`} />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getTypeColor(doc.type)}-100 text-${getTypeColor(doc.type)}-800`}>
                {documentTypes.find(t => t.value === doc.type)?.label || doc.type}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">{doc.title}</h3>
            
            {doc.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                <SafeIcon icon={FiEye} className="w-4 h-4" />
                <span>View</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                <span>Download</span>
              </motion.button>
            </div>
          </motion.div>
        ))}

        {documentsToShow.length === 0 && (
          <div className="col-span-full text-center py-12">
            <SafeIcon icon={FiFileText} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No documents found</p>
            <p className="text-sm text-gray-400 mt-1">Upload your first document to get started</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Document</h2>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {user?.role !== 'patient' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient
                  </label>
                  <select
                    required
                    value={uploadData.patientId}
                    onChange={(e) => setUploadData({ ...uploadData, patientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add description or notes"
                  rows={3}
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <SafeIcon icon={FiUpload} className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG up to 10MB</p>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Document
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUploadModal(false)}
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

export default DocumentManager;