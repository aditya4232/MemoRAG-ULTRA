import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, Shield, TrendingUp, Database, Sparkles } from 'lucide-react';
import { apiClient } from '../utils/api';

export default function HomePage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await apiClient.health();
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to load status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          MemoRAG ULTRA
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Production-grade AI knowledge engine running 100% locally on your laptop.
          Hybrid retrieval, knowledge graphs, and continual learning.
        </p>
        
        {!loading && (
          <div className="flex items-center justify-center space-x-4">
            <div className={`px-4 py-2 rounded-full ${
              status?.lm_studio ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {status?.lm_studio ? '● LM Studio Connected' : '● LM Studio Offline'}
            </div>
            <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              ● Database Ready
            </div>
          </div>
        )}
      </motion.div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Zap className="w-8 h-8" />}
          title="Hybrid RAG"
          description="Speed Mode (<1.5s) for quick answers, Deep Mode (<5s) for complex reasoning"
          color="text-yellow-500"
        />
        <FeatureCard
          icon={<Brain className="w-8 h-8" />}
          title="Knowledge Graph"
          description="Entity extraction and multi-hop reasoning across your documents"
          color="text-purple-500"
        />
        <FeatureCard
          icon={<Shield className="w-8 h-8" />}
          title="100% Local"
          description="No cloud, no costs, complete privacy. Runs on 8-16 GB RAM"
          color="text-green-500"
        />
        <FeatureCard
          icon={<TrendingUp className="w-8 h-8" />}
          title="Continual Learning"
          description="Anti-forgetting memory with importance scoring and consolidation"
          color="text-blue-500"
        />
        <FeatureCard
          icon={<Database className="w-8 h-8" />}
          title="Multi-Format"
          description="Process PDF, DOCX, TXT, MD, and URLs with smart chunking"
          color="text-pink-500"
        />
        <FeatureCard
          icon={<Sparkles className="w-8 h-8" />}
          title="Provenance"
          description="Full source tracking with confidence scores and reasoning paths"
          color="text-orange-500"
        />
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">System Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Features" value="130+" />
          <StatCard label="API Endpoints" value="12" />
          <StatCard label="Modes" value="2" />
          <StatCard label="Local" value="100%" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card space-y-3"
    >
      <div className={`${color}`}>{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="text-3xl font-bold text-primary-600">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}
