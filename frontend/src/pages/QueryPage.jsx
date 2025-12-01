import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Zap, Brain, Clock, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../utils/api';
import ReactMarkdown from 'react-markdown';

export default function QueryPage() {
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleQuery = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await apiClient.query({
        question,
        mode,
        include_provenance: true,
        include_reasoning: true
      });
      setResult(response.data);
    } catch (error) {
      setResult({
        error: true,
        message: error.response?.data?.detail || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Query Knowledge Base</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ask questions and get AI-powered answers from your documents
        </p>
      </div>

      {/* Query Input */}
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Your Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Ask anything about your documents..."
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Mode:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="speed">Speed Mode (&lt;1.5s)</option>
              <option value="deep">Deep Mode (&lt;5s)</option>
            </select>
          </div>

          <button
            onClick={handleQuery}
            disabled={loading || !question.trim()}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Ask Question</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && !result.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Answer Card */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold">Answer</h2>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  {result.mode_used === 'speed' ? (
                    <Zap className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Brain className="w-4 h-4 text-purple-500" />
                  )}
                  <span className="capitalize">{result.mode_used} Mode</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{result.processing_time_ms?.toFixed(0)}ms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{(result.confidence * 100).toFixed(0)}% confident</span>
                </div>
              </div>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{result.answer}</ReactMarkdown>
            </div>
          </div>

          {/* Provenance */}
          {result.provenance && result.provenance.chunks && result.provenance.chunks.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Sources ({result.provenance.total_sources})</h3>
              <div className="space-y-3">
                {result.provenance.chunks.slice(0, 5).map((chunk, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{chunk.doc_title}</span>
                      <span className="text-xs text-gray-500">
                        Score: {(chunk.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasoning Steps */}
          {result.reasoning_steps && result.reasoning_steps.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Reasoning Process</h3>
              <div className="space-y-2">
                {result.reasoning_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{step.agent}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{step.result}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Error */}
      {result && result.error && (
        <div className="card border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
          <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Query Failed</h3>
          <p className="text-sm">{result.message}</p>
        </div>
      )}

      {/* Examples */}
      {!result && (
        <div className="card bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold mb-3">Example Questions</h3>
          <div className="space-y-2">
            {[
              "What is MemoRAG ULTRA?",
              "Compare Speed Mode and Deep Mode",
              "How does the knowledge graph work?",
              "What are the key features?"
            ].map((example, idx) => (
              <button
                key={idx}
                onClick={() => setQuestion(example)}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors text-sm"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
