import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  ChevronDown, ChevronUp, Search, Settings, LogOut, RefreshCw,
  AlertCircle, CheckCircle, Clock, TrendingUp, Users, FileText,
  CreditCard, Zap, Eye, EyeOff, Copy, Check, X
} from 'lucide-react';

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

const BRAND = {
  ink: '#111820',
  'ink-2': '#1e2530',
  slate: '#3d4a58',
  mid: '#6b7280',
  muted: '#9aa3ad',
  cta: '#c9920a',
  member: '#0f4c75',
  live: '#c0392b',
  bg: '#ffffff'
};

const TIER_COLORS = {
  standard: '#0f4c75',
  operator: '#c9920a',
  'first-class': '#8b5cf6',
  elite: '#dc2626'
};

const STATUS_COLORS = {
  active: '#10b981',
  pending: '#f59e0b',
  suspended: '#ef4444',
  cancelled: '#6b7280',
  completed: '#10b981',
  failed: '#ef4444',
  processing: '#3b82f6'
};

const PHASE_NAMES = {
  discovery: 'Discovery',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  onboarding: 'Onboarding',
  active: 'Active'
};

const formatCurrency = (value) => {
  if (!value) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

const formatNumber = (value) => {
  if (!value) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard() {
  // AUTH & CONFIG
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem('hirecar_api_key') || '';
    } catch {
      return '';
    }
  });
  const [tempApiKey, setTempApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const [apiShowKey, setApiShowKey] = useState(false);

  // API CONFIG
  const [mainWorkerUrl, setMainWorkerUrl] = useState(() => {
    try {
      return localStorage.getItem('hirecar_main_worker_url') || '';
    } catch {
      return '';
    }
  });
  const [paymentOrchestratorUrl, setPaymentOrchestratorUrl] = useState(() => {
    try {
      return localStorage.getItem('hirecar_payment_orchestrator_url') || '';
    } catch {
      return '';
    }
  });
  const [tempMainWorkerUrl, setTempMainWorkerUrl] = useState(mainWorkerUrl);
  const [tempPaymentOrchestratorUrl, setTempPaymentOrchestratorUrl] = useState(paymentOrchestratorUrl);

  // UI STATE
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // DATA
  const [stats, setStats] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [members, setMembers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [botStatus, setBotStatus] = useState([]);
  const [healthStatus, setHealthStatus] = useState({});

  // FILTERS & SEARCH
  const [memberSearch, setMemberSearch] = useState('');
  const [memberTierFilter, setMemberTierFilter] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadScoreFilter, setLeadScoreFilter] = useState([0, 100]);
  const [leadStatusFilter, setLeadStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // LOADING & ERROR
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // =========================================================================
  // API FUNCTIONS
  // =========================================================================

  const getHeaders = useCallback(() => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return headers;
  }, [apiKey]);

  const fetchMainWorker = useCallback(
    async (endpoint) => {
      const baseUrl = mainWorkerUrl || '';
      const url = `${baseUrl}${endpoint}`;
      try {
        const response = await fetch(url, {
          headers: getHeaders(),
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        console.error(`Failed to fetch ${endpoint}:`, err);
        setErrors(prev => ({ ...prev, [endpoint]: err.message }));
        throw err;
      }
    },
    [mainWorkerUrl, getHeaders]
  );

  const fetchPaymentOrchestrator = useCallback(
    async (endpoint) => {
      const baseUrl = paymentOrchestratorUrl || '';
      const url = `${baseUrl}${endpoint}`;
      try {
        const response = await fetch(url, {
          headers: getHeaders(),
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        console.error(`Failed to fetch ${endpoint}:`, err);
        setErrors(prev => ({ ...prev, [endpoint]: err.message }));
        throw err;
      }
    },
    [paymentOrchestratorUrl, getHeaders]
  );

  // =========================================================================
  // DATA FETCHING
  // =========================================================================

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setErrors({});

    try {
      // Fetch from main worker
      const [statsData, dailyData, membersData, leadsData, paymentsData] = await Promise.allSettled([
        fetchMainWorker('/api/stats'),
        fetchMainWorker('/api/stats/daily?days=30'),
        fetchMainWorker('/api/members?status=active'),
        fetchMainWorker('/api/leads?status=new'),
        fetchMainWorker('/api/payments?status=completed')
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (dailyData.status === 'fulfilled') setDailyStats(dailyData.value.stats || []);
      if (membersData.status === 'fulfilled') setMembers(membersData.value.members || []);
      if (leadsData.status === 'fulfilled') setLeads(leadsData.value.leads || []);
      if (paymentsData.status === 'fulfilled') setPayments(paymentsData.value.payments || []);

      // Fetch from payment orchestrator
      const [enrollmentData, botsData] = await Promise.allSettled([
        fetchPaymentOrchestrator('/api/enrollment/stats'),
        fetchPaymentOrchestrator('/bots')
      ]);

      if (botsData.status === 'fulfilled') {
        const bots = botsData.value.bots || botsData.value || [];
        setBotStatus(Array.isArray(bots) ? bots : []);
      }

      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to fetch some data. Check API configuration and keys.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchMainWorker, fetchPaymentOrchestrator]);

  useEffect(() => {
    if (apiKey && (mainWorkerUrl || paymentOrchestratorUrl)) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 60000);
      return () => clearInterval(interval);
    }
  }, [apiKey, mainWorkerUrl, paymentOrchestratorUrl, fetchAllData]);

  // =========================================================================
  // SETTINGS HANDLERS
  // =========================================================================

  const handleSaveSettings = () => {
    try {
      if (tempApiKey) {
        setApiKey(tempApiKey);
        localStorage.setItem('hirecar_api_key', tempApiKey);
        setTempApiKey('');
      }
      if (tempMainWorkerUrl) {
        setMainWorkerUrl(tempMainWorkerUrl);
        localStorage.setItem('hirecar_main_worker_url', tempMainWorkerUrl);
      }
      if (tempPaymentOrchestratorUrl) {
        setPaymentOrchestratorUrl(tempPaymentOrchestratorUrl);
        localStorage.setItem('hirecar_payment_orchestrator_url', tempPaymentOrchestratorUrl);
      }
      setShowSettings(false);
      setShowApiKeyInput(false);
      fetchAllData();
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleLogout = () => {
    setApiKey('');
    setApiShowKey(false);
    setShowApiKeyInput(true);
    try {
      localStorage.removeItem('hirecar_api_key');
    } catch {
      // silent fail
    }
  };

  // =========================================================================
  // FILTERED DATA
  // =========================================================================

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch = !memberSearch ||
        m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email?.toLowerCase().includes(memberSearch.toLowerCase());
      const matchTier = !memberTierFilter || m.tier === memberTierFilter;
      const matchStatus = !memberStatusFilter || m.status === memberStatusFilter;
      return matchSearch && matchTier && matchStatus;
    });
  }, [members, memberSearch, memberTierFilter, memberStatusFilter]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !leadSearch ||
        l.name?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.email?.toLowerCase().includes(leadSearch.toLowerCase());
      const matchScore = l.score >= leadScoreFilter[0] && l.score <= leadScoreFilter[1];
      const matchStatus = !leadStatusFilter || l.status === leadStatusFilter;
      return matchSearch && matchScore && matchStatus;
    });
  }, [leads, leadSearch, leadScoreFilter, leadStatusFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchMethod = !paymentMethodFilter || p.method === paymentMethodFilter;
      const matchStatus = !paymentStatusFilter || p.status === paymentStatusFilter;
      return matchMethod && matchStatus;
    });
  }, [payments, paymentMethodFilter, paymentStatusFilter]);

  // =========================================================================
  // CHART DATA
  // =========================================================================

  const leadPipelineData = useMemo(() => {
    const pipeline = {
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0
    };
    leads.forEach(l => {
      if (l.status in pipeline) pipeline[l.status]++;
    });
    return Object.entries(pipeline).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [leads]);

  // =========================================================================
  // RENDER: AUTH GATE
  // =========================================================================

  if (showApiKeyInput) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BRAND.bg }}>
        <style>{`
          * { font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          h1, h2, h3, h4, h5, h6 { font-family: 'Cormorant Garamond', serif; }
          code, pre { font-family: 'DM Mono', monospace; }
          @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        `}</style>
        <div className="w-full max-w-md p-8" style={{ backgroundColor: BRAND['ink-2'], borderRadius: '8px' }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: BRAND.bg }}>
            HIRECAR
          </h1>
          <p className="text-sm mb-6" style={{ color: BRAND.muted }}>
            Market Watch — Admin Dashboard
          </p>
          <div className="mb-6">
            <label className="block text-xs font-semibold mb-2" style={{ color: BRAND.muted }}>
              Main Worker URL (optional)
            </label>
            <input
              type="text"
              placeholder="https://hirecar.workers.dev"
              value={tempMainWorkerUrl}
              onChange={(e) => setTempMainWorkerUrl(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm mb-3"
              style={{
                backgroundColor: BRAND.ink,
                color: BRAND.bg,
                border: `1px solid ${BRAND.slate}`
              }}
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-semibold mb-2" style={{ color: BRAND.muted }}>
              Payment Orchestrator URL (optional)
            </label>
            <input
              type="text"
              placeholder="https://api.hirecar.la"
              value={tempPaymentOrchestratorUrl}
              onChange={(e) => setTempPaymentOrchestratorUrl(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm mb-3"
              style={{
                backgroundColor: BRAND.ink,
                color: BRAND.bg,
                border: `1px solid ${BRAND.slate}`
              }}
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-semibold mb-2" style={{ color: BRAND.muted }}>
              API Key
            </label>
            <div className="relative">
              <input
                type={apiShowKey ? 'text' : 'password'}
                placeholder="Enter your API key"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="w-full px-3 py-2 rounded text-sm pr-10"
                style={{
                  backgroundColor: BRAND.ink,
                  color: BRAND.bg,
                  border: `1px solid ${BRAND.slate}`
                }}
              />
              <button
                onClick={() => setApiShowKey(!apiShowKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: BRAND.muted }}
              >
                {apiShowKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            onClick={handleSaveSettings}
            className="w-full py-2 rounded font-semibold text-sm"
            style={{
              backgroundColor: BRAND.cta,
              color: BRAND.ink,
              cursor: 'pointer'
            }}
          >
            Connect & Enter
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: MAIN DASHBOARD
  // =========================================================================

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: BRAND.bg }}>
      <style>{`
        * { font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Cormorant Garamond', serif; font-weight: 700; }
        code, pre, [data-type="mono"] { font-family: 'DM Mono', monospace; }
        .tab-button { transition: all 0.2s; }
        .tab-button:hover { opacity: 0.8; }
        table { border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid ${BRAND.slate}20; }
        th { font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
        tr:hover { background-color: ${BRAND.ink}05; }
        .stat-card { border-radius: 8px; padding: 16px; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
        .score-bar { height: 6px; border-radius: 3px; background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%); }
        @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
      `}</style>

      {/* SIDEBAR */}
      <div
        className="w-64 border-r flex flex-col"
        style={{
          backgroundColor: BRAND.ink,
          borderColor: BRAND.slate + '20'
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: BRAND.slate + '20' }}>
          <h1 className="text-2xl font-bold" style={{ color: BRAND.cta }}>
            HIRECAR
          </h1>
          <p className="text-xs" style={{ color: BRAND.muted }}>
            Market Watch
          </p>
        </div>

        <nav className="flex-1 p-4">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'leads', label: 'Leads', icon: FileText },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'bots', label: 'Bots', icon: Zap }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="tab-button w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-sm font-semibold"
                style={{
                  backgroundColor: activeTab === tab.id ? BRAND.cta + '20' : 'transparent',
                  color: activeTab === tab.id ? BRAND.cta : BRAND.muted
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: BRAND.slate + '20' }}>
          <button
            onClick={() => setShowSettings(true)}
            className="tab-button w-full flex items-center gap-3 px-4 py-2 rounded-lg mb-2 text-xs font-semibold"
            style={{ color: BRAND.muted }}
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="tab-button w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ color: BRAND.live }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div
          className="border-b px-8 py-4 flex items-center justify-between"
          style={{
            backgroundColor: BRAND['ink-2'],
            borderColor: BRAND.slate + '20'
          }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: BRAND.bg }}>
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'members' && 'Members'}
              {activeTab === 'leads' && 'Leads'}
              {activeTab === 'payments' && 'Payments'}
              {activeTab === 'bots' && 'Bots'}
            </h2>
            <p className="text-xs" style={{ color: BRAND.muted }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => fetchAllData()}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold"
            style={{
              backgroundColor: BRAND.cta,
              color: BRAND.ink,
              opacity: refreshing ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8" style={{ backgroundColor: BRAND.bg }}>
          {error && (
            <div
              className="mb-6 p-4 rounded flex items-gap-3"
              style={{
                backgroundColor: BRAND.live + '20',
                borderLeft: `4px solid ${BRAND.live}`
              }}
            >
              <AlertCircle size={18} style={{ color: BRAND.live }} className="flex-shrink-0" />
              <p style={{ color: BRAND.live }} className="text-sm">
                {error}
              </p>
            </div>
          )}

          {loading && activeTab === 'overview' ? (
            <div className="text-center py-12">
              <div className="inline-block p-3 rounded-full mb-4" style={{ backgroundColor: BRAND.cta + '20' }}>
                <RefreshCw size={24} style={{ color: BRAND.cta }} className="animate-spin" />
              </div>
              <p style={{ color: BRAND.muted }}>Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div>
                  {/* KPI CARDS */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {[
                      {
                        label: 'Total Members',
                        value: stats?.members?.total || 0,
                        icon: Users
                      },
                      {
                        label: 'Active Members',
                        value: stats?.members?.active || 0,
                        icon: CheckCircle
                      },
                      {
                        label: 'Total Leads',
                        value: stats?.leads?.total || 0,
                        icon: FileText
                      },
                      {
                        label: 'Avg Lead Score',
                        value: stats?.leads?.avg_score?.toFixed(1) || 0,
                        icon: TrendingUp
                      },
                      {
                        label: 'Lifetime Revenue',
                        value: formatCurrency(stats?.payments?.lifetime_revenue),
                        icon: CreditCard,
                        isMonetry: true
                      },
                      {
                        label: 'Pending Leads',
                        value: stats?.leads?.pending || 0,
                        icon: Clock
                      }
                    ].map((kpi, idx) => {
                      const Icon = kpi.icon;
                      return (
                        <div
                          key={idx}
                          className="stat-card"
                          style={{
                            backgroundColor: BRAND['ink-2'],
                            border: `1px solid ${BRAND.slate}20`
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p style={{ color: BRAND.muted }} className="text-xs font-semibold mb-2">
                                {kpi.label}
                              </p>
                              <p
                                className="text-2xl font-bold"
                                style={{ color: BRAND.cta }}
                              >
                                {kpi.isMonetry ? kpi.value : formatNumber(kpi.value)}
                              </p>
                            </div>
                            <Icon size={24} style={{ color: BRAND.cta + '60' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CHARTS */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* REVENUE CHART */}
                    <div
                      className="p-6 rounded"
                      style={{
                        backgroundColor: BRAND['ink-2'],
                        border: `1px solid ${BRAND.slate}20`
                      }}
                    >
                      <h3 className="text-lg font-bold mb-4" style={{ color: BRAND.bg }}>
                        Revenue (30 days)
                      </h3>
                      {dailyStats && dailyStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={dailyStats}>
                            <CartesianGrid stroke={BRAND.slate + '30'} />
                            <XAxis
                              dataKey="stat_date"
                              stroke={BRAND.muted}
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke={BRAND.muted} style={{ fontSize: '12px' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: BRAND.ink,
                                border: `1px solid ${BRAND.slate}`,
                                borderRadius: '4px'
                              }}
                              labelStyle={{ color: BRAND.bg }}
                            />
                            <Line
                              type="monotone"
                              dataKey="payment_total"
                              stroke={BRAND.cta}
                              strokeWidth={2}
                              dot={{ fill: BRAND.cta, r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <p style={{ color: BRAND.muted }}>No data available</p>
                        </div>
                      )}
                    </div>

                    {/* LEAD PIPELINE */}
                    <div
                      className="p-6 rounded"
                      style={{
                        backgroundColor: BRAND['ink-2'],
                        border: `1px solid ${BRAND.slate}20`
                      }}
                    >
                      <h3 className="text-lg font-bold mb-4" style={{ color: BRAND.bg }}>
                        Lead Pipeline
                      </h3>
                      {leadPipelineData && leadPipelineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={leadPipelineData}>
                            <CartesianGrid stroke={BRAND.slate + '30'} />
                            <XAxis
                              dataKey="name"
                              stroke={BRAND.muted}
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke={BRAND.muted} style={{ fontSize: '12px' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: BRAND.ink,
                                border: `1px solid ${BRAND.slate}`,
                                borderRadius: '4px'
                              }}
                              labelStyle={{ color: BRAND.bg }}
                            />
                            <Bar
                              dataKey="value"
                              fill={BRAND.member}
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <p style={{ color: BRAND.muted }}>No data available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACTIVITY FEED */}
                  <div
                    className="p-6 rounded"
                    style={{
                      backgroundColor: BRAND['ink-2'],
                      border: `1px solid ${BRAND.slate}20`
                    }}
                  >
                    <h3 className="text-lg font-bold mb-4" style={{ color: BRAND.bg }}>
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {payments && payments.length > 0 ? (
                        payments.slice(0, 10).map((p, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded"
                            style={{ backgroundColor: BRAND.ink + '30' }}
                          >
                            <div className="flex-1">
                              <p style={{ color: BRAND.bg }} className="text-sm font-semibold">
                                Payment from {p.member_name || 'Unknown'}
                              </p>
                              <p style={{ color: BRAND.muted }} className="text-xs">
                                {formatDate(p.date)} • {p.method}
                              </p>
                            </div>
                            <span
                              className="text-sm font-bold"
                              style={{ color: BRAND.cta }}
                            >
                              {formatCurrency(p.amount)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: BRAND.muted }} className="text-sm">
                          No recent activity
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MEMBERS TAB */}
              {activeTab === 'members' && (
                <div>
                  <div className="mb-6 flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1">
                      <div className="relative">
                        <Search
                          size={16}
                          style={{ color: BRAND.muted }}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                        />
                        <input
                          type="text"
                          placeholder="Search members..."
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded text-sm"
                          style={{
                            backgroundColor: BRAND['ink-2'],
                            color: BRAND.bg,
                            border: `1px solid ${BRAND.slate}20`
                          }}
                        />
                      </div>
                    </div>
                    <select
                      value={memberTierFilter}
                      onChange={(e) => setMemberTierFilter(e.target.value)}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: BRAND['ink-2'],
                        color: BRAND.bg,
                        border: `1px solid ${BRAND.slate}20`
                      }}
                    >
                      <option value="">All Tiers</option>
                      {['standard', 'operator', 'first-class', 'elite'].map(tier => (
                        <option key={tier} value={tier}>
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={memberStatusFilter}
                      onChange={(e) => setMemberStatusFilter(e.target.value)}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: BRAND['ink-2'],
                        color: BRAND.bg,
                        border: `1px solid ${BRAND.slate}20`
                      }}
                    >
                      <option value="">All Status</option>
                      {['active', 'suspended', 'cancelled'].map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    className="rounded overflow-hidden"
                    style={{
                      backgroundColor: BRAND['ink-2'],
                      border: `1px solid ${BRAND.slate}20`
                    }}
                  >
                    {filteredMembers.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: BRAND.ink }}>
                            <th style={{ color: BRAND.muted }}>Name</th>
                            <th style={{ color: BRAND.muted }}>Email</th>
                            <th style={{ color: BRAND.muted }}>Tier</th>
                            <th style={{ color: BRAND.muted }}>Status</th>
                            <th style={{ color: BRAND.muted }}>Enrolled</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMembers.map((m, idx) => (
                            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : BRAND.ink + '10' }}>
                              <td style={{ color: BRAND.bg }} className="font-semibold">
                                {m.name || '-'}
                              </td>
                              <td style={{ color: BRAND.muted }} data-type="mono" className="text-xs">
                                {m.email || '-'}
                              </td>
                              <td>
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor: TIER_COLORS[m.tier] + '20',
                                    color: TIER_COLORS[m.tier]
                                  }}
                                >
                                  {m.tier}
                                </span>
                              </td>
                              <td>
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor: STATUS_COLORS[m.status] + '20',
                                    color: STATUS_COLORS[m.status]
                                  }}
                                >
                                  {m.status}
                                </span>
                              </td>
                              <td style={{ color: BRAND.muted }} className="text-xs">
                                {formatDate(m.enrolled_date)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center">
                        <p style={{ color: BRAND.muted }}>No members found</p>
                      </div>
                    )}
                  </div>
                  <p style={{ color: BRAND.muted }} className="text-xs mt-4">
                    Showing {filteredMembers.length} of {members.length} members
                  </p>
                </div>
              )}

              {/* LEADS TAB */}
              {activeTab === 'leads' && (
                <div>
                  <div className="mb-6 flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1">
                      <div className="relative">
                        <Search
                          size={16}
                          style={{ color: BRAND.muted }}
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                        />
                        <input
                          type="text"
                          placeholder="Search leads..."
                          value={leadSearch}
                          onChange={(e) => setLeadSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded text-sm"
                          style={{
                            backgroundColor: BRAND['ink-2'],
                            color: BRAND.bg,
                            border: `1px solid ${BRAND.slate}20`
                          }}
                        />
                      </div>
                    </div>
                    <select
                      value={leadStatusFilter}
                      onChange={(e) => setLeadStatusFilter(e.target.value)}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: BRAND['ink-2'],
                        color: BRAND.bg,
                        border: `1px solid ${BRAND.slate}20`
                      }}
                    >
                      <option value="">All Status</option>
                      {['new', 'contacted', 'qualified', 'converted'].map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((l, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded"
                          style={{
                            backgroundColor: BRAND['ink-2'],
                            border: `1px solid ${BRAND.slate}20`
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 style={{ color: BRAND.bg }} className="font-semibold">
                                {l.name || '-'}
                              </h4>
                              <p style={{ color: BRAND.muted }} className="text-xs" data-type="mono">
                                {l.email || '-'}
                              </p>
                            </div>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: STATUS_COLORS[l.status] + '20',
                                color: STATUS_COLORS[l.status]
                              }}
                            >
                              {l.status}
                            </span>
                          </div>
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <p style={{ color: BRAND.muted }} className="text-xs">
                                Lead Score
                              </p>
                              <p style={{ color: BRAND.cta }} className="text-sm font-bold">
                                {l.score || 0}/100
                              </p>
                            </div>
                            <div className="score-bar" style={{ opacity: (l.score || 0) / 100 }}></div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <p style={{ color: BRAND.muted }}>
                              Source: <span style={{ color: BRAND.bg }}>{l.source || '-'}</span>
                            </p>
                            <p style={{ color: BRAND.muted }}>
                              Assigned: <span style={{ color: BRAND.bg }}>{l.assigned_to || '-'}</span>
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center rounded" style={{ backgroundColor: BRAND['ink-2'] }}>
                        <p style={{ color: BRAND.muted }}>No leads found</p>
                      </div>
                    )}
                  </div>
                  <p style={{ color: BRAND.muted }} className="text-xs mt-4">
                    Showing {filteredLeads.length} of {leads.length} leads
                  </p>
                </div>
              )}

              {/* PAYMENTS TAB */}
              {activeTab === 'payments' && (
                <div>
                  <div className="mb-6 flex flex-col gap-4 lg:flex-row">
                    <select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: BRAND['ink-2'],
                        color: BRAND.bg,
                        border: `1px solid ${BRAND.slate}20`
                      }}
                    >
                      <option value="">All Methods</option>
                      {['stripe', 'paypal', 'cash'].map(method => (
                        <option key={method} value={method}>
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      className="px-4 py-2 rounded text-sm"
                      style={{
                        backgroundColor: BRAND['ink-2'],
                        color: BRAND.bg,
                        border: `1px solid ${BRAND.slate}20`
                      }}
                    >
                      <option value="">All Status</option>
                      {['completed', 'pending', 'failed'].map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    className="rounded overflow-hidden"
                    style={{
                      backgroundColor: BRAND['ink-2'],
                      border: `1px solid ${BRAND.slate}20`
                    }}
                  >
                    {filteredPayments.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: BRAND.ink }}>
                            <th style={{ color: BRAND.muted }}>Date</th>
                            <th style={{ color: BRAND.muted }}>Member</th>
                            <th style={{ color: BRAND.muted }}>Amount</th>
                            <th style={{ color: BRAND.muted }}>Method</th>
                            <th style={{ color: BRAND.muted }}>Status</th>
                            <th style={{ color: BRAND.muted }}>Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPayments.map((p, idx) => (
                            <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : BRAND.ink + '10' }}>
                              <td style={{ color: BRAND.muted }} className="text-xs">
                                {formatDate(p.date)}
                              </td>
                              <td style={{ color: BRAND.bg }} className="font-semibold text-sm">
                                {p.member_name || '-'}
                              </td>
                              <td style={{ color: BRAND.cta }} className="font-bold">
                                {formatCurrency(p.amount)}
                              </td>
                              <td style={{ color: BRAND.bg }} className="text-sm">
                                {p.method}
                              </td>
                              <td>
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor: STATUS_COLORS[p.status] + '20',
                                    color: STATUS_COLORS[p.status]
                                  }}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td style={{ color: BRAND.muted }} data-type="mono" className="text-xs">
                                {p.provider_ref || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center">
                        <p style={{ color: BRAND.muted }}>No payments found</p>
                      </div>
                    )}
                  </div>
                  <p style={{ color: BRAND.muted }} className="text-xs mt-4">
                    Showing {filteredPayments.length} of {payments.length} payments
                  </p>
                </div>
              )}

              {/* BOTS TAB */}
              {activeTab === 'bots' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {botStatus && botStatus.length > 0 ? (
                      botStatus.map((bot, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded"
                          style={{
                            backgroundColor: BRAND['ink-2'],
                            border: `1px solid ${BRAND.slate}20`
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 style={{ color: BRAND.bg }} className="font-semibold text-sm">
                                {bot.name || `Bot ${bot.id || idx}`}
                              </h4>
                              <p style={{ color: BRAND.muted }} className="text-xs" data-type="mono">
                                {bot.id || '-'}
                              </p>
                            </div>
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: bot.status === 'online' ? '#10b981' : '#6b7280'
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <p style={{ color: BRAND.muted }}>Type</p>
                            <p style={{ color: BRAND.bg }} className="font-semibold">
                              {bot.type || 'Standard'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-2">
                            <span
                              className="badge"
                              style={{
                                backgroundColor: bot.status === 'online' ? '#10b98120' : '#6b728020',
                                color: bot.status === 'online' ? '#10b981' : '#6b7280'
                              }}
                            >
                              {bot.status || 'offline'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full p-8 text-center rounded" style={{ backgroundColor: BRAND['ink-2'] }}>
                        <p style={{ color: BRAND.muted }}>No bots available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ backgroundColor: BRAND.ink + 'cc' }}
        >
          <div
            className="w-full max-w-md rounded-lg p-6"
            style={{
              backgroundColor: BRAND['ink-2'],
              border: `1px solid ${BRAND.slate}20`
            }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: BRAND.bg }}>
              Settings
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: BRAND.muted }}>
                  Main Worker URL
                </label>
                <input
                  type="text"
                  value={tempMainWorkerUrl}
                  onChange={(e) => setTempMainWorkerUrl(e.target.value)}
                  placeholder="https://hirecar.workers.dev"
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: BRAND.ink,
                    color: BRAND.bg,
                    border: `1px solid ${BRAND.slate}20`
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: BRAND.muted }}>
                  Payment Orchestrator URL
                </label>
                <input
                  type="text"
                  value={tempPaymentOrchestratorUrl}
                  onChange={(e) => setTempPaymentOrchestratorUrl(e.target.value)}
                  placeholder="https://api.hirecar.la"
                  className="w-full px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: BRAND.ink,
                    color: BRAND.bg,
                    border: `1px solid ${BRAND.slate}20`
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: BRAND.muted }}>
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={apiShowKey ? 'text' : 'password'}
                    value={tempApiKey || apiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter API key to change"
                    className="w-full px-3 py-2 rounded text-sm pr-10"
                    style={{
                      backgroundColor: BRAND.ink,
                      color: BRAND.bg,
                      border: `1px solid ${BRAND.slate}20`
                    }}
                  />
                  <button
                    onClick={() => setApiShowKey(!apiShowKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: BRAND.muted }}
                  >
                    {apiShowKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveSettings}
                className="flex-1 py-2 rounded font-semibold text-sm"
                style={{
                  backgroundColor: BRAND.cta,
                  color: BRAND.ink
                }}
              >
                Save
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 rounded font-semibold text-sm"
                style={{
                  backgroundColor: BRAND.slate + '20',
                  color: BRAND.bg
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
