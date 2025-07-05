import { useState, useRef } from "react";
import { Upload, File, Image, FileText, Download, Trash2, Eye } from "lucide-react";

export default function FileUpload({ files = [], onFileUpload, onFileDelete, onFileDownload }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      for (const file of files) {
        // Simulate file upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedBy: "You",
          uploadedAt: new Date(),
          url: URL.createObjectURL(file) // In real app, this would be the uploaded file URL
        };
        
        // Only emit once per file
        onFileUpload(fileData);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-blue-400" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-400" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">Shared Files</h3>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-indigo-400 bg-indigo-400/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-white font-medium mb-1">
          {uploading ? 'Uploading...' : 'Upload Study Materials'}
        </p>
        <p className="text-gray-400 text-sm mb-3">
          Drag & drop files here or click to browse
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-lg text-white text-sm transition-colors"
        >
          {uploading ? 'Uploading...' : 'Choose Files'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-white font-medium mb-3">Uploaded Files ({files.length})</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.uploadedBy}</span>
                      <span>•</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onFileDownload(file)}
                    className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  
                  {file.type.startsWith('image/') && (
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onFileDelete(file.id)}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && !uploading && (
        <div className="text-center py-8">
          <File className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No files uploaded yet</p>
          <p className="text-gray-500 text-sm">Upload study materials to share with your room</p>
        </div>
      )}
    </div>
  );
} 