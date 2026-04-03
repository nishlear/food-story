import React, { useEffect, useState } from 'react';
import { Map, Store, Users, MessageSquare, BarChart2, Clock } from 'lucide-react';
import { AdminStats } from '../types';

interface Props {
  authHeaders: () => Record<string, string>;
}

interface Street {
  id: string;
  name: string;
  vendors_count: number;
}

interface RecentComment {
  id: string;
  username: string;
  body: string;
  vendor_name: string;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} min${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

const dotColors = [
  'bg-orange-400',
  'bg-amber-400',
  'bg-blue-400',
  'bg-red-400',
];

export default function AdminDashboard({ authHeaders }: Props) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [streets, setStreets] = useState<Street[]>([]);
  const [activity, setActivity] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = authHeaders();
    Promise.all([
      fetch('/api/admin/stats', { headers }).then(r => r.json()),
      fetch('/api/streets', { headers }).then(r => r.json()),
      fetch('/api/admin/comments', { headers }).then(r => r.json()),
    ]).then(([statsData, streetsData, commentsData]) => {
      setStats(statsData);
      const sorted = [...streetsData].sort((a: Street, b: Street) => b.vendors_count - a.vendors_count);
      setStreets(sorted.slice(0, 3));
      setActivity(commentsData.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const metricCards = [
    {
      label: 'Street Food Created',
      value: stats?.streets ?? 0,
      icon: Map,
      badge: 'Streets',
      badgeColor: 'bg-orange-100 text-orange-700',
      iconColor: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Total Vendors',
      value: stats?.vendors ?? 0,
      icon: Store,
      badge: 'Active',
      badgeColor: 'bg-amber-100 text-amber-700',
      iconColor: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Total Users',
      value: stats?.users ?? 0,
      icon: Users,
      badge: 'Global',
      badgeColor: 'bg-blue-100 text-blue-700',
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Total Comments',
      value: stats?.comments ?? 0,
      icon: MessageSquare,
      badge: 'New',
      badgeColor: 'bg-orange-100 text-orange-700',
      iconColor: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="px-8 py-10 flex flex-col gap-12">

      {/* Hero Stats */}
      <div className="grid grid-cols-4 gap-6">
        {metricCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-1">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-4xl font-extrabold text-gray-900">{card.value.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-3 gap-10">

        {/* Left 2/3: Top Streets + Chart */}
        <div className="col-span-2 flex flex-col gap-8">

          {/* Top Performing Streets */}
          <div className="bg-orange-50 rounded-3xl p-8 flex flex-col gap-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Top Performing Streets</h2>
                <p className="text-sm text-gray-500 mt-1">High traffic hubs ranked by vendor count</p>
              </div>
              <span className="text-sm font-semibold text-orange-600 cursor-default">View All Maps</span>
            </div>

            <div className="flex flex-col gap-3">
              {streets.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No streets yet</p>
              ) : (
                streets.map((street, i) => (
                  <div key={street.id} className="bg-white rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg shrink-0">
                      {street.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{street.name}</p>
                      <p className="text-sm text-gray-500">{street.vendors_count} vendor{street.vendors_count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-extrabold text-orange-600">#{i + 1}</p>
                      <p className="text-xs text-gray-400">Rank</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="border-2 border-dashed border-gray-200 rounded-3xl h-48 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <BarChart2 className="w-9 h-9" />
              <p className="text-sm italic">Vendor Activity Chart Visualization</p>
            </div>
          </div>
        </div>

        {/* Right 1/3: Recent Activity + CTA */}
        <div className="col-span-1 flex flex-col gap-6">

          {/* Recent Activity */}
          <div className="bg-orange-50 rounded-3xl p-8 flex flex-col gap-6 border border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-[18px] h-[18px] text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>

            {activity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet</p>
            ) : (
              <div className="relative flex flex-col gap-6 pb-2">
                {/* vertical line */}
                <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-gray-200" />

                {activity.map((comment, i) => (
                  <div key={comment.id} className="pl-10 relative">
                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-orange-50 ${dotColors[i % dotColors.length]}`} />
                    <p className="text-sm font-semibold text-gray-900">New Comment</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {comment.body.length > 60 ? comment.body.slice(0, 60) + '…' : comment.body}
                      {comment.vendor_name && <span className="text-gray-400"> · {comment.vendor_name}</span>}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1.5">
                      {timeAgo(comment.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button className="w-full border border-gray-200 rounded-full py-3 text-sm text-gray-500 hover:bg-white transition-colors">
              Clear All Logs
            </button>
          </div>

          {/* Need Insights CTA */}
          <div className="bg-orange-500 rounded-3xl p-8 relative overflow-hidden shadow-lg shadow-orange-200">
            <div className="relative z-10 flex flex-col gap-2">
              <h3 className="text-lg font-extrabold text-white">Need Insights?</h3>
              <p className="text-sm text-orange-100">
                Generate a comprehensive street performance report for your data.
              </p>
              <button className="mt-3 flex items-center gap-1 text-white font-bold text-sm hover:underline">
                Get Report →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
