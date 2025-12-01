import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Cpu, HardDrive, Clock, TrendingUp } from 'lucide-react';
import { apiClient } from '../utils/api';

export default function SystemPage() {
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statusRes, metricsRes] = await Promise.all([
        apiClient.systemStatus(),
        apiClient.systemMetrics()
      ]);
      setStatus(statusRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Status</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor system health and performance metrics
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <StatusCard
          title="Overall Status"
          value={status?.status || 'unknown'}
          icon={<Activity className="w-6 h-6" />}
          color={status?.status === 'healthy' ? 'green' : 'yellow'}
        />
        <StatusCard
          title="LM Studio"
          value={status?.lm_studio_connected ? 'Connected' : 'Offline'}
          icon={<Cpu className="w-6 h-6" />}
          color={status?.lm_studio_connected ? 'green' : 'red'}
        />
        <StatusCard
          title="Database"
          value={status?.database ? 'Connected' : 'Offline'}
          icon={<Database className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Metrics */}
      {status?.metrics && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Total Queries"
            value={status.metrics.queries_total}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <MetricCard
            label="Avg Latency"
            value={`${status.metrics.avg_latency_ms?.toFixed(0)}ms`}
            icon={<Clock className="w-5 h-5" />}
          />
          <MetricCard
            label="Memory Usage"
            value={`${status.metrics.memory_usage_mb?.toFixed(0)}MB`}
            icon={<HardDrive className="w-5 h-5" />}
          />
          <MetricCard
            label="Documents"
            value={status.metrics.document_count}
            icon={<Database className="w-5 h-5" />}
          />
        </div>
      )}

      {/* Knowledge Graph Stats */}
      {metrics?.knowledge_graph && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Knowledge Graph</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem label="Nodes" value={metrics.knowledge_graph.nodes} />
            <StatItem label="Edges" value={metrics.knowledge_graph.edges} />
            <StatItem label="Density" value={metrics.knowledge_graph.density?.toFixed(4)} />
            <StatItem
              label="Connected"
              value={metrics.knowledge_graph.is_connected ? 'Yes' : 'No'}
            />
          </div>
        </div>
      )}

      {/* Vector Index Stats */}
      {metrics?.vector_index && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Vector Index</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatItem label="Total Vectors" value={metrics.vector_index.total_vectors} />
            <StatItem label="Dimension" value={metrics.vector_index.dimension} />
            <StatItem label="Index Type" value={metrics.vector_index.index_type} />
          </div>
        </div>
      )}

      {/* Query Distribution */}
      {metrics?.query_distribution && metrics.query_distribution.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Query Distribution</h2>
          <div className="space-y-3">
            {metrics.query_distribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="capitalize">{item.mode_used} Mode</span>
                <span className="font-semibold">{item.count} queries</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Info */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-3">System Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600 dark:text-gray-400">Chunks</div>
            <div className="font-semibold">{status?.metrics?.chunk_count || 0}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Entities</div>
            <div className="font-semibold">{status?.metrics?.entity_count || 0}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Relations</div>
            <div className="font-semibold">{status?.metrics?.relation_count || 0}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-400">Uptime</div>
            <div className="font-semibold">
              {formatUptime(status?.metrics?.uptime_seconds)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, icon, color }) {
  const colors = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="card">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
          <div className="text-xl font-bold capitalize">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, icon }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
        <div className="text-primary-600">{icon}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="text-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
      <div className="text-2xl font-bold text-primary-600">{value}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}

function formatUptime(seconds) {
  if (!seconds) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${Math.floor(seconds)}s`;
}
