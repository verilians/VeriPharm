import React from 'react';
import type { SettingsStats as SettingsStatsType } from '../types';

interface SettingsStatsProps {
  stats: SettingsStatsType;
  loading?: boolean;
}

export const SettingsStats: React.FC<SettingsStatsProps> = ({
  stats,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No statistics available</p>
      </div>
    );
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBackupStatusColor = (status: string) => {
    switch (status) {
      case 'enabled':
        return 'text-green-600';
      case 'disabled':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBackupStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled':
        return '✅';
      case 'disabled':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total_settings}</div>
            <div className="text-sm text-blue-600">Total Settings</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.categories_count}</div>
            <div className="text-sm text-green-600">Categories</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {getBackupStatusIcon(stats.backup_status)}
            </div>
            <div className={`text-sm ${getBackupStatusColor(stats.backup_status)}`}>
              Backup {stats.backup_status}
            </div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className={`text-2xl font-bold ${getSecurityScoreColor(stats.security_score)}`}>
              {stats.security_score}%
            </div>
            <div className="text-sm text-orange-600">Security Score</div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="space-y-4">
          {/* Notifications Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{stats.notifications_enabled ? '🔔' : '🔕'}</span>
              <div>
                <p className="font-medium text-gray-900">Notifications</p>
                <p className="text-sm text-gray-500">
                  {stats.notifications_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className={`text-sm font-medium ${
              stats.notifications_enabled ? 'text-green-600' : 'text-gray-500'
            }`}>
              {stats.notifications_enabled ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">🕒</span>
              <div>
                <p className="font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-500">
                  {new Date(stats.last_updated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(stats.last_updated).toLocaleTimeString()}
            </div>
          </div>

          {/* Security Score */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">🛡️</span>
              <div>
                <p className="font-medium text-gray-900">Security Score</p>
                <p className="text-sm text-gray-500">Overall system security</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.security_score >= 80 ? 'bg-green-500' :
                    stats.security_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${stats.security_score}%` }}
                ></div>
              </div>
              <span className={`text-sm font-medium ${getSecurityScoreColor(stats.security_score)}`}>
                {stats.security_score}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span>📊</span>
            <span className="text-sm font-medium text-gray-700">Export Settings</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span>🔄</span>
            <span className="text-sm font-medium text-gray-700">Reset to Defaults</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span>💾</span>
            <span className="text-sm font-medium text-gray-700">Create Backup</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span>📋</span>
            <span className="text-sm font-medium text-gray-700">View Logs</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 