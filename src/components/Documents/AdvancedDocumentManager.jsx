import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiFileText, FiUpload, FiDownload, FiEye, FiTrash2, FiPlus, FiTag, FiFile, 
  FiCamera, FiVideo, FiImage, FiFolder, FiFilter, FiSearch, FiEdit, FiX 
} = FiIcons;

const AdvancedDocumentManager = () => {
  const { profile } = useAuth();
  const { 
    documents, 
    patients, 
    documentTypes,
    addDocument, 
    deleteDocument, 
    updateDocument,
    getPatientDocuments,
    createDocumentTag,
    getDocumentTags,
    createDocumentType,
    updateDocumentType
  } = useData();

  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.id || '');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type_id: '',
    patient_id: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [documentTags, setDocumentTags] = useState({});
  const [captureMode, setCaptureMode] = useState(null);
  const [newDocumentType, setNewDocumentType] = useState({ name: '', description: '', color: '#3b82f6' });

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const getDocumentsToShow = () => {
    let documentsToShow = [];
    
    if (profile?.role === 'patient') {
      documentsToShow = documents.filter(doc => doc.patient_id === profile.id);
    } else if (selectedPatient) {
      documentsToShow = getPatientDocuments(selectedPatient);
    } else {
      documentsToShow = documents;
    }

    // Filter by type
    if (selectedType !== 'all') {
      documentsToShow = documentsToShow.filter(doc => doc.type_id === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      documentsToShow = documentsToShow.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      documentsToShow = documentsToShow.filter(doc => {
        const docTags = documentTags[doc.id] || [];
        return selectedTags.some(tag => docTags.includes(tag));
      });
    }

    return documentsToShow;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile && !captureMode) {
      alert('Please select a file or capture media');
      return;
    }

    const patientId = profile?.role === 'patient' ? profile.id : uploadData.patient_id;
    
    const result = await addDocument({
      ...uploadData,
      patient_id: patientId,
      file: selectedFile,
      uploaded_by: profile.id
    });

    if (result.success) {
      // Add tags if any
      if (newTag.trim()) {
        await createDocumentTag({
          document_id: result.document.id,
          tag: newTag.trim(),
          created_by: profile.id
        });
      }

      setShowUploadModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setUploadData({
      title: '',
      description: '',
      type_id: '',
      patient_id: ''
    });
    setSelectedFile(null);
    setNewTag('');
    setCaptureMode(null);
  };

  const handleFileSelect = (file) => {
    if (file && file.size <= 50 * 1024 * 1024) { // 50MB limit
      setSelectedFile(file);
      setCaptureMode(null);
    } else {
      alert('File size must be less than 50MB');
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCaptureMode('camera');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
        handleFileSelect(file);
        
        // Stop camera
        const stream = video.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setCaptureMode(null);
      }, 'image/jpeg', 0.8);
    }
  };

  const addDocumentTag = async (documentId, tag) => {
    if (!tag.trim()) return;
    
    await createDocumentTag({
      document_id: documentId,
      tag: tag.trim(),
      created_by: profile.id
    });
    
    // Refresh document tags
    const tags = await getDocumentTags(documentId);
    setDocumentTags(prev => ({
      ...prev,
      [documentId]: tags.map(t => t.tag)
    }));
  };

  const getTypeColor = (typeId) => {
    const type = documentTypes.find(t => t.id === typeId);
    return type?.color || '#6b7280';
  };

  const getFileIcon = (fileName, mimeType) => {
    if (!fileName && !mimeType) return FiFileText;
    
    const type = mimeType || fileName?.split('.').pop()?.toLowerCase();
    
    if (type?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) {
      return FiImage;
    } else if (type?.includes('video') || ['mp4', 'avi', 'mov', 'wmv'].includes(type)) {
      return FiVideo;
    } else if (type?.includes('pdf')) {
      return FiFileText;
    }
    
    return FiFile;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (doc) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.file_name || doc.title;
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

  const handleCreateDocumentType = async () => {
    if (!newDocumentType.name.trim()) return;
    
    const result = await createDocumentType({
      name: newDocumentType.name,
      description: newDocumentType.description,
      color: newDocumentType.color,
      is_active: true
    });
    
    if (result.success) {
      setShowTypeModal(false);
      setNewDocumentType({ name: '', description: '', color: '#3b82f6' });
    }
  };

  const documentsToShow = getDocumentsToShow();
  const allTags = [...new Set(Object.values(documentTags).flat())];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Document Management</h1>
          <p className="text-gray-600 mt-1">
            Organize, categorize, and manage medical documents with tags and folders
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {(profile?.role === 'admin' || profile?.role === 'office_manager') && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTypeModal(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <SafeIcon icon={FiFolder} className="w-4 h-4" />
              <span>Manage Types</span>
            </motion.button>
          )}
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
      </div>

      {/* Patient Selector for Doctors/Nurses/Office Managers */}
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

      {/* Advanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Document Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <select
              multiple
              value={selectedTags}
              onChange={(e) => setSelectedTags(Array.from(e.target.selectedOptions, option => option.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedTags([]);
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
            >
              <SafeIcon icon={FiX} className="w-4 h-4" />
              <span>Clear Filters</span>
            </motion.button>
          </div>
        </div>
      </div>

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
              <div className="flex items-center space-x-3">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${getTypeColor(doc.type_id)}20` }}
                >
                  <SafeIcon 
                    icon={getFileIcon(doc.file_name, doc.mime_type)} 
                    className="w-6 h-6"
                    style={{ color: getTypeColor(doc.type_id) }}
                  />
                </div>
                <div>
                  <span 
                    className="px-2 py-1 text-xs font-medium rounded-full text-white"
                    style={{ backgroundColor: getTypeColor(doc.type_id) }}
                  >
                    {doc.document_type?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
            
            {doc.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{doc.description}</p>
            )}

            {/* Tags */}
            {documentTags[doc.id] && documentTags[doc.id].length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {documentTags[doc.id].map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2 mb-4 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Uploaded:</span>
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
              {doc.file_name && (
                <div className="flex justify-between">
                  <span>File:</span>
                  <span className="truncate ml-2">{doc.file_name}</span>
                </div>
              )}
              {doc.file_size && (
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{formatFileSize(doc.file_size)}</span>
                </div>
              )}
              {doc.uploaded_by_user && (
                <div className="flex justify-between">
                  <span>By:</span>
                  <span>{doc.uploaded_by_user.full_name}</span>
                </div>
              )}
            </div>

            {/* Tag Input */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Add tag..."
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      addDocumentTag(doc.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                  <SafeIcon icon={FiTag} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
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
              
              {(profile?.role === 'admin' || profile?.role === 'office_manager' || doc.uploaded_by === profile?.id) && (
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
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || selectedType !== 'all' || selectedTags.length > 0
                ? 'Try adjusting your filters'
                : 'Upload your first document to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Document</h2>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title *
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
                  Document Type *
                </label>
                <select
                  required
                  value={uploadData.type_id}
                  onChange={(e) => setUploadData({ ...uploadData, type_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {profile?.role !== 'patient' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient *
                  </label>
                  <select
                    required
                    value={uploadData.patient_id}
                    onChange={(e) => setUploadData({ ...uploadData, patient_id: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              {/* File Upload/Capture Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Upload or Capture
                </label>
                
                {/* Upload Options */}
                <div className="flex space-x-2 mb-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <SafeIcon icon={FiUpload} className="w-4 h-4" />
                    <span>Choose File</span>
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startCamera}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <SafeIcon icon={FiCamera} className="w-4 h-4" />
                    <span>Take Photo</span>
                  </motion.button>
                </div>

                {/* Camera Capture */}
                {captureMode === 'camera' && (
                  <div className="mb-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg"
                    />
                    <div className="flex justify-center mt-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={capturePhoto}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Capture Photo
                      </motion.button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                )}

                {/* Drag and Drop Area */}
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
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    accept="*/*"
                  />
                  
                  {selectedFile ? (
                    <div className="space-y-2">
                      <SafeIcon 
                        icon={getFileIcon(selectedFile.name, selectedFile.type)} 
                        className="w-8 h-8 text-green-600 mx-auto" 
                      />
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
                        <span className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
                          Click to upload
                        </span>
                        <span className="text-sm text-gray-600"> or drag and drop</span>
                      </div>
                      <p className="text-xs text-gray-400">Any file type up to 50MB</p>
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

      {/* Document Type Management Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Document Types</h2>
            
            {/* Existing Types */}
            <div className="space-y-2 mb-6">
              {documentTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{type.name}</p>
                      {type.description && (
                        <p className="text-sm text-gray-600">{type.description}</p>
                      )}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-red-600 transition-colors">
                    <SafeIcon icon={FiEdit} className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Type */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Add New Document Type</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newDocumentType.name}
                  onChange={(e) => setNewDocumentType({ ...newDocumentType, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter type name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newDocumentType.description}
                  onChange={(e) => setNewDocumentType({ ...newDocumentType, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={newDocumentType.color}
                  onChange={(e) => setNewDocumentType({ ...newDocumentType, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateDocumentType}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Type
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTypeModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdvancedDocumentManager;