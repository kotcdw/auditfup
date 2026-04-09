import { useState, useEffect } from 'react';
import { findingsAPI } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { 
  FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, 
  AlertCircle, XCircle, Activity 
} from 'lucide-react';

interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  pendingVerification: number;
  closed: number;
  pastDue: number;
  byRisk: { risk_level: string; count: number }[];
  byDepartment: { department: string; count: number }[];
  byMonth: { month: string; count: number }[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await findingsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const closureRate = stats ? ((stats.closed / stats.total) * 100).toFixed(1) : 0;

  const cards = [
    { 
      title: 'Total Findings', 
      value: stats?.total || 0, 
      icon: FileText, 
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    { 
      title: 'Open', 
      value: stats?.open || 0, 
      icon: AlertCircle, 
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    { 
      title: 'In Progress', 
      value: stats?.inProgress || 0, 
      icon: Clock, 
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    { 
      title: 'Closed', 
      value: stats?.closed || 0, 
      icon: CheckCircle, 
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    { 
      title: 'Past Due', 
      value: stats?.pastDue || 0, 
      icon: XCircle, 
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    { 
      title: 'Closure Rate', 
      value: `${closureRate}%`, 
      icon: TrendingUp, 
      color: 'bg-cyan-500',
      textColor: 'text-cyan-600'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Audit findings overview and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Findings by Risk Level</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.byRisk || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ risk_level, count }) => `${risk_level}: ${count}`}
                >
                  {(stats?.byRisk || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Findings by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.byDepartment || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="department" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Monthly Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={(stats?.byMonth || []).reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Key Performance Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Closure Rate</p>
            <p className="text-2xl font-bold text-green-600">{closureRate}%</p>
            <p className="text-xs text-slate-400 mt-1">Target: 90%+</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Past Due</p>
            <p className="text-2xl font-bold text-red-600">{stats?.pastDue || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Target: &lt;10%</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-2xl font-bold text-orange-600">{stats?.inProgress || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Active remediation</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">Pending Verification</p>
            <p className="text-2xl font-bold text-purple-600">{stats?.pendingVerification || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Awaiting review</p>
          </div>
        </div>
      </div>
    </div>
  );
}