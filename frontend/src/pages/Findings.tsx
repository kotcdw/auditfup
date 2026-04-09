import { useState, useEffect } from 'react';
import { findingsAPI, authAPI, uploadAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Edit, Trash2, Eye, X, Upload, FileText as FileIcon, MessageSquare
} from 'lucide-react';

interface Finding {
  id: number;
  ref_id: string;
  finding: string;
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low';
  owner_id: number;
  owner_name: string;
  department: string;
  due_date: string;
  status: 'Open' | 'In Progress' | 'Pending Verification' | 'Closed';
  evidence_path: string;
  evidence_files: string[];
  description: string;
  recommendation: string;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
}

interface Comment {
  id: number;
  user_id: number;
  user_name: string;
  comment: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const statusColors: Record<string, string> = {
  'Open': 'bg-red-100 text-red-700',
  'In Progress': 'bg-orange-100 text-orange-700',
  'Pending Verification': 'bg-purple-100 text-purple-700',
  'Closed': 'bg-green-100 text-green-700',
};

const riskColors: Record<string, string> = {
  'Critical': 'bg-red-500 text-white',
  'High': 'bg-orange-500 text-white',
  'Medium': 'bg-yellow-500 text-white',
  'Low': 'bg-green-500 text-white',
};

const departments = [
  'Finance', 'IT', 'Operations', 'HR', 'Legal', 'Compliance', 'Risk Management', 'Internal Audit', 'Marketing', 'Supply Chain'
];

export default function Findings() {
  const { user } = useAuth();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [formData, setFormData] = useState({
    finding: '',
    risk_level: 'Medium',
    owner_id: '',
    department: '',
    due_date: '',
    status: 'Open',
    description: '',
    recommendation: '',
    evidence_files: [] as string[]
  });

  useEffect(() => {
    loadFindings();
    loadUsers();
  }, [search, filterStatus, filterRisk, filterDepartment]);

  const loadFindings = async () => {
    try {
      const response = await findingsAPI.getAll({ 
        search, 
        status: filterStatus, 
        risk_level: filterRisk,
        department: filterDepartment
      });
      setFindings(response.data);
    } catch (error) {
      console.error('Failed to load findings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedFinding) {
        await findingsAPI.update(selectedFinding.id, formData);
      } else {
        await findingsAPI.create(formData);
      }
      setShowModal(false);
      loadFindings();
      resetForm();
    } catch (error) {
      console.error('Failed to save finding:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this finding?')) return;
    try {
      await findingsAPI.delete(id);
      loadFindings();
    } catch (error) {
      console.error('Failed to delete finding:', error);
    }
  };

  const openEdit = (finding: Finding) => {
    setSelectedFinding(finding);
    setUploadedFiles(finding.evidence_files || []);
    setFormData({
      finding: finding.finding,
      risk_level: finding.risk_level,
      owner_id: String(finding.owner_id || ''),
      department: finding.department || '',
      due_date: finding.due_date || '',
      status: finding.status,
      description: finding.description || '',
      recommendation: finding.recommendation || '',
      evidence_files: finding.evidence_files || []
    });
    setShowModal(true);
  };

  const openView = (finding: Finding) => {
    setSelectedFinding(finding);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setSelectedFinding(null);
    setUploadedFiles([]);
    setFormData({
      finding: '',
      risk_level: 'Medium',
      owner_id: '',
      department: '',
      due_date: '',
      status: 'Open',
      description: '',
      recommendation: '',
      evidence_files: []
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const response = await uploadAPI.uploadFile(files[i]);
        const newFiles = [...uploadedFiles, response.data.path];
        setUploadedFiles(newFiles);
        setFormData({ ...formData, evidence_files: newFiles });
      }
      setMessage({ type: 'success', text: 'Files uploaded successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload files' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedFinding || !commentText.trim()) return;
    try {
      await findingsAPI.addComment(selectedFinding.id, commentText);
      setCommentText('');
      const response = await findingsAPI.getById(selectedFinding.id);
      setSelectedFinding({ ...selectedFinding, comments: response.data.comments });
      setMessage({ type: 'success', text: 'Comment added!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add comment' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'auditor' || user?.role === 'manager';
  const canDelete = user?.role === 'admin' || user?.role === 'manager';
  const canExport = user?.role === 'admin' || user?.role === 'auditor' || user?.role === 'manager';
  const canAddComment = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'audit_client';

  const exportToExcel = () => {
    const headers = ['Ref ID', 'Finding', 'Risk Level', 'Department', 'Owner', 'Due Date', 'Status'];
    const rows = findings.map(f => [
      f.ref_id,
      f.finding,
      f.risk_level,
      f.department || '',
      f.owner_name || '',
      f.due_date || '',
      f.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `findings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Audit Findings Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
            th { background: #f1f5f9; }
            .status-open { color: #dc2626; }
            .status-inprogress { color: #ea580c; }
            .status-pending { color: #9333ea; }
            .status-closed { color: #16a34a; }
          </style>
        </head>
        <body>
          <h1>Audit Findings Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Ref ID</th>
                <th>Finding</th>
                <th>Risk</th>
                <th>Department</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${findings.map(f => `
                <tr>
                  <td>${f.ref_id}</td>
                  <td>${f.finding.substring(0, 50)}...</td>
                  <td>${f.risk_level}</td>
                  <td>${f.department || '-'}</td>
                  <td>${f.owner_name || '-'}</td>
                  <td>${f.due_date || '-'}</td>
                  <td class="status-${f.status.toLowerCase().replace(' ', '')}">${f.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Findings</h1>
          <p className="text-slate-500 mt-1">Manage audit findings and remediation</p>
        </div>
        <div className="flex items-center gap-2">
          {canExport && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                  <button
                    onClick={() => { exportToExcel(); setShowExportMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-100 text-slate-700"
                  >
                    Export to Excel
                  </button>
                  <button
                    onClick={() => { exportToPDF(); setShowExportMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-100 text-slate-700"
                  >
                    Export to PDF
                  </button>
                </div>
              )}
            </div>
          )}
          {canEdit && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Finding
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search findings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : findings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No findings found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ref ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Finding</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Risk</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {findings.map((finding) => (
                  <tr key={finding.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{finding.ref_id}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate">{finding.finding}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${riskColors[finding.risk_level]}`}>
                        {finding.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{finding.owner_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {finding.due_date ? new Date(finding.due_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[finding.status]}`}>
                        {finding.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openView(finding)}
                          className="p-1 text-slate-400 hover:text-blue-500"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                            <>
                            <button
                              onClick={() => openEdit(finding)}
                              className="p-1 text-slate-400 hover:text-green-500"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(finding.id)}
                                className="p-1 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">{selectedFinding ? 'Edit Finding' : 'Add New Finding'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Finding Description</label>
                  <textarea
                    value={formData.finding}
                    onChange={(e) => setFormData({ ...formData, finding: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Risk Level</label>
                  <select
                    value={formData.risk_level}
                    onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Owner</label>
                  <select
                    value={formData.owner_id}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select owner</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Recommendation</label>
                  <textarea
                    value={formData.recommendation}
                    onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {selectedFinding ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedFinding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Finding Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-blue-600">{selectedFinding.ref_id}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${riskColors[selectedFinding.risk_level]}`}>
                  {selectedFinding.risk_level}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[selectedFinding.status]}`}>
                  {selectedFinding.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500">Finding</h3>
                <p className="text-slate-900 mt-1">{selectedFinding.finding}</p>
              </div>
              {selectedFinding.description && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Description</h3>
                  <p className="text-slate-900 mt-1">{selectedFinding.description}</p>
                </div>
              )}
              {selectedFinding.recommendation && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Recommendation</h3>
                  <p className="text-slate-900 mt-1">{selectedFinding.recommendation}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Owner</h3>
                  <p className="text-slate-900 mt-1">{selectedFinding.owner_name || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Department</h3>
                  <p className="text-slate-900 mt-1">{selectedFinding.department || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Due Date</h3>
                  <p className="text-slate-900 mt-1">
                    {selectedFinding.due_date ? new Date(selectedFinding.due_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Created</h3>
                  <p className="text-slate-900 mt-1">
                    {new Date(selectedFinding.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedFinding.comments && selectedFinding.comments.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Comments</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFinding.comments.map((comment) => (
                      <div key={comment.id} className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-slate-700">{comment.user_name}</p>
                        <p className="text-sm text-slate-600">{comment.comment}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {canAddComment && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Add Comment</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}