import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../utils/api';

export default function DocumentsPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (!title && selectedFile) {
      setTitle(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', file.name.split('.').pop());
    formData.append('title', title || file.name);

    try {
      const response = await apiClient.ingestDocument(formData);
      setResult({ success: true, data: response.data });
      setFile(null);
      setTitle('');
    } catch (error) {
      setResult({ success: false, error: error.response?.data?.detail || error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Document Ingestion</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload documents to build your knowledge base
        </p>
      </div>

      {/* Upload Card */}
      <div className="card space-y-6">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.txt,.md,.docx"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center space-y-4"
          >
            <Upload className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-gray-500">
                PDF, TXT, MD, DOCX up to 50MB
              </p>
            </div>
          </label>
        </div>

        {file && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500"
                placeholder="Enter document title..."
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Ingest Document</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card ${
            result.success
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-red-500 bg-red-50 dark:bg-red-900/20'
          } border-2`}
        >
          <div className="flex items-start space-x-3">
            {result.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold mb-2">
                {result.success ? 'Document Ingested Successfully!' : 'Ingestion Failed'}
              </h3>
              {result.success ? (
                <div className="space-y-1 text-sm">
                  <p>Chunks created: {result.data.chunks_created}</p>
                  <p>Entities extracted: {result.data.entities_extracted}</p>
                  <p>Processing time: {result.data.processing_time_ms?.toFixed(0)}ms</p>
                </div>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Info */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2">What happens during ingestion?</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• Text extraction from your document</li>
          <li>• Smart chunking with overlap for context</li>
          <li>• Embedding generation (384-dim vectors)</li>
          <li>• Vector index update for fast search</li>
          <li>• Entity and relation extraction</li>
          <li>• Knowledge graph construction</li>
        </ul>
      </div>
    </div>
  );
}
