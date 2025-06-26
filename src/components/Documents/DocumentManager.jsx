import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFileText, FiUpload, FiDownload, FiEye, FiTrash2, FiPlus, FiTag, FiFile } = FiIcons;

const DocumentManager = () => {
  const { profile } = useAuth();
  const { documents, patients, addDocument, deleteDocument, getPatientDocuments } = useData();
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.id || '');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'lab_result',
    patientId: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const documentTypes = [
    { value: 'lab_result', label: 'Lab Result', color: 'blue' },
    { value: 'prescription', label: 'Prescription', color: 'green' },
    { value: 'scan', label: 'Medical Scan', color: 'purple' },
    { value: 'report', label: 'Medical Report', color: 'orange' },
    { value: 'insurance', label: 'Insurance', color: 'gray' },
    { value: 'other', label: 'Other', color: 'indigo' }
  ];

  const getDocumentsToShow = () => {
    if (profile?.role === 'patient') {
      return documents.filter(doc => doc.patientId === profile.id);
    } else if (selectedPatient) {
      return getPatientDocuments(selectedPatient);
    }
    return documents;
  };

  const handleUpload = (e) => {
    e.preventDefault();
    
    if (!selectedFile && uploadData.type !== 'other') {
      alert('Please select a file to upload');
      return;
    }

    const patientId = profile?.role === 'patient' ? profile.id : uploadData.patientId;
    
    const result = addDocument({
      ...uploadData,
      patientId,
      file: selectedFile
    });

    if (result.success) {
      setShowUploadModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setUploadData({
      title: '',
      description: '',
      type: 'lab_result',
      patientId: ''
    });
    setSelectedFile(null);
  };

  const handleFileSelect = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setSelectedFile(file);
    } else {
      alert('File size must be less than 10MB');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const getTypeColor = (type) => {
    const typeConfig = documentTypes.find(t => t.value === type);
    return typeConfig?.color || 'gray';
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return FiFileText;
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return FiFileText;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return FiFile;
      default:
        return FiFileText;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (doc) => {
    // Create a download link
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.fileName || doc.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (doc) => {
    window.open(doc.url, '_blank');
  };

  const handleDelete = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocument(docId);
    }
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
          onClick={() => {
            resetForm();
            setShowUploadModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Upload Document</span>
        </motion.button>
      </div>

      {/* Patient Selector for Doctors/Nurses */}
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
                <SafeIcon icon={getFileIcon(doc.fileName)} className={`w-6 h-6 text-${getTypeColor(doc.type)}-600`} />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getTypeColor(doc.type)}-100 text-${getTypeColor(doc.type)}-800`}>
                {documentTypes.find(t => t.value === doc.type)?.label || doc.type}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">{doc.title}</h3>
            
            {doc.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
            )}

            <div className="space-y-2 mb-4 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Uploaded:</span>
                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
              </div>
              {doc.fileName && (
                <div className="flex justify-between">
                  <span>File:</span>
                  <span className="truncate ml-2">{doc.fileName}</span>
                </div>
              )}
              {doc.fileSize && (
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleView(doc)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                <SafeIcon icon={FiEye} className="w-4 h-4" />
                <span>View</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDownload(doc)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                <span>Download</span>
              </motion.button>

              {(profile?.role === 'admin' || doc.uploadedBy === profile?.id) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDelete(doc.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  <span>Delete</span>
                </motion.button>
              )}
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
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
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

              {profile?.role !== 'patient' && (
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
                        {patient.full_name}
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

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Upload
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : selectedFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-2">
                      <SafeIcon icon={getFileIcon(selectedFile.name)} className="w-8 h-8 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-green-600">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
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
                      <div>
                        <label
                          htmlFor="file-upload"
                          className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
                        >
                          Click to upload
                        </label>
                        <span className="text-sm text-gray-600"> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </div>
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
                  onClick={() => {
                    setShowUploadModal(false);
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

export default DocumentManager;