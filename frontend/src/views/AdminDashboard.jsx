import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import MobileContainer from '../components/MobileContainer';
import { 
  LogOut, Search, Filter, Download, RotateCcw, 
  Settings, CheckCircle2, XCircle, ChevronDown, ChevronUp, BarChart3 
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Dashboard stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCards: 500,
    cardsAssigned: 0,
    cardsRemaining: 500,
    cardsRedeemed: 0,
    campaignStatus: 'coming_soon',
  });
  
  // Users list state
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [redeemedFilter, setRedeemedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedUser, setExpandedUser] = useState(null); // ID of user card expanded
  
  // Loading states
  const [statsLoading, setStatsLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // holds cardId being updated
  const [campaignUpdateLoading, setCampaignUpdateLoading] = useState(false);

  // Load stats
  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      // If 401, API interceptor handles logout redirection
    } finally {
      setStatsLoading(false);
    }
  };

  // Load customers
  const fetchUsers = useCallback(async (searchQuery = search, filterValue = redeemedFilter, pageNum = page) => {
    setListLoading(true);
    try {
      const res = await API.get('/admin/users', {
        params: {
          search: searchQuery,
          redeemed: filterValue,
          page: pageNum,
          limit: 10,
        }
      });
      if (res.data.success) {
        setUsers(res.data.users);
        setPage(res.data.pagination.page);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      console.error('Error loading users list:', err);
    } finally {
      setListLoading(false);
    }
  }, [search, redeemedFilter, page]);

  // Load page data
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login', { replace: true });
      return;
    }

    // Check URL parameters for scanning redirections (e.g. from QR Codes)
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearch(searchParam);
      fetchUsers(searchParam, '', 1);
      // Clean query string from browser URL bar to avoid refresh side-effects
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      fetchUsers();
    }
    
    fetchStats();
  }, [navigate, fetchUsers]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
    fetchUsers(e.target.value, redeemedFilter, 1);
  };

  const handleFilterChange = (e) => {
    setRedeemedFilter(e.target.value);
    setPage(1);
    fetchUsers(search, e.target.value, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchUsers(search, redeemedFilter, newPage);
  };

  // Toggle user expansion
  const toggleExpand = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  // Redeem Action
  const handleRedeem = async (cardId) => {
    if (!window.confirm('Are you sure you want to mark this reward as redeemed?')) return;
    setActionLoading(cardId);
    try {
      const res = await API.post(`/admin/cards/${cardId}/redeem`);
      if (res.data.success) {
        alert(res.data.message);
        // Refresh
        await fetchStats();
        await fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to redeem card.');
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel Redemption Action
  const handleCancelRedemption = async (cardId) => {
    if (!window.confirm('Cancel redemption? This card will be marked active again.')) return;
    setActionLoading(cardId);
    try {
      const res = await API.post(`/admin/cards/${cardId}/cancel`);
      if (res.data.success) {
        alert(res.data.message);
        // Refresh
        await fetchStats();
        await fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel redemption.');
    } finally {
      setActionLoading(null);
    }
  };

  // Campaign Status Update Action
  const handleCampaignStatus = async (newStatus) => {
    if (campaignUpdateLoading) return;
    setCampaignUpdateLoading(true);
    try {
      const res = await API.put('/admin/campaign', { status: newStatus });
      if (res.data.success) {
        alert(res.data.message);
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update campaign status.');
    } finally {
      setCampaignUpdateLoading(false);
    }
  };

  // Reset Campaign Action (Double Confirm)
  const handleResetCampaign = async () => {
    const doubleCheck1 = window.confirm('CRITICAL WARNING:\n\nThis will completely reset the campaign!\n- All registered users will be DELETED.\n- All redemption logs will be DELETED.\n- All cards will be reset to unassigned.\n\nAre you absolutely sure you want to proceed?');
    if (!doubleCheck1) return;

    const doubleCheck2 = window.prompt('Type "RESET" to confirm this action:');
    if (doubleCheck2 !== 'RESET') {
      alert('Reset cancelled: confirmation text did not match.');
      return;
    }

    setListLoading(true);
    try {
      const res = await API.post('/admin/campaign/reset');
      if (res.data.success) {
        alert(res.data.message);
        setSearch('');
        setRedeemedFilter('');
        setPage(1);
        await fetchStats();
        await fetchUsers('', '', 1);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Reset failed.');
    } finally {
      setListLoading(false);
    }
  };

  // Reset Card Assignments Action (Double Confirm)
  const handleResetCardsBack = async () => {
    const doubleCheck1 = window.confirm('WARNING:\n\nThis will release all scratch cards back to active and unassigned!\n- Customer registrations will NOT be deleted.\n- All redemption logs will be DELETED.\n- All assigned cards will be freed up.\n\nAre you sure you want to proceed?');
    if (!doubleCheck1) return;

    const doubleCheck2 = window.prompt('Type "RELEASE" to confirm this action:');
    if (doubleCheck2 !== 'RELEASE') {
      alert('Reset cancelled: confirmation text did not match.');
      return;
    }

    setListLoading(true);
    try {
      const res = await API.post('/admin/cards/reset-back');
      if (res.data.success) {
        alert(res.data.message);
        setSearch('');
        setRedeemedFilter('');
        setPage(1);
        await fetchStats();
        await fetchUsers('', '', 1);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Resetting card assignments failed.');
    } finally {
      setListLoading(false);
    }
  };

  // Export CSV Action
  const handleExportCsv = async () => {
    try {
      const res = await API.get('/admin/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `lucky_scratch_campaign_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (err) {
      alert('CSV Export failed. Please try again.');
    }
  };

  // Admin Logout Action
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login', { replace: true });
  };

  return (
    <MobileContainer hideNav={true}>
      <div className="flex flex-col space-y-5 pt-2 pb-8">
        
        {/* Admin Header */}
        <div className="flex justify-between items-center bg-brand-blue-navy/40 p-3 rounded-xl border border-brand-gold/10">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Admin Control Panel
            </h2>
            <p className="text-[10px] text-slate-400">Campaign Operations</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[10px] text-red-400 border border-red-500/20 px-2 py-1 rounded bg-red-500/5 hover:bg-red-500/10 flex items-center space-x-1"
          >
            <LogOut size={10} />
            <span>Logout</span>
          </button>
        </div>

        {/* 1. Metrics Statistics Grid */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center space-x-1 border-b border-brand-gold/10 pb-1.5">
            <BarChart3 size={13} />
            <span>Campaign Metrics</span>
          </h3>

          {statsLoading ? (
            <div className="py-4 text-center text-xs text-slate-400">Loading metrics...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-center">
              {[
                { val: stats.totalUsers, label: 'Total Users' },
                { val: `${stats.cardsRemaining} / ${stats.totalCards}`, label: 'Cards Left' },
                { val: stats.cardsAssigned, label: 'Cards Claimed' },
                { val: stats.cardsRedeemed, label: 'Redeemed' }
              ].map((m, idx) => (
                <div key={idx} className="bg-brand-blue-deep/60 p-2.5 rounded-xl border border-brand-blue-light/35 shadow-inner">
                  <span className="text-sm font-extrabold text-brand-gold font-mono block">
                    {m.val}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block mt-0.5">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Campaign Status Controller */}
        <div className="glass-panel p-4 rounded-2xl space-y-3">
          <h3 className="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center space-x-1 border-b border-brand-gold/10 pb-1.5">
            <Settings size={13} />
            <span>Campaign Status Controls</span>
          </h3>

          <div className="flex items-center justify-between text-xs py-1 px-2.5 bg-brand-blue-deep/50 rounded-lg border border-brand-blue-light/30 mb-2">
            <span className="text-slate-300">Current Status:</span>
            <span className="font-extrabold text-brand-gold uppercase tracking-wider font-mono">
              {stats.campaignStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleCampaignStatus('active')}
              disabled={campaignUpdateLoading || stats.campaignStatus === 'active'}
              className="py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 text-emerald-400 font-bold rounded-lg text-[9px] uppercase tracking-wide disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            >
              Start
            </button>
            <button
              onClick={() => handleCampaignStatus('paused')}
              disabled={campaignUpdateLoading || stats.campaignStatus === 'paused'}
              className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/35 text-amber-400 font-bold rounded-lg text-[9px] uppercase tracking-wide disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            >
              Pause
            </button>
            <button
              onClick={() => handleCampaignStatus('ended')}
              disabled={campaignUpdateLoading || stats.campaignStatus === 'ended'}
              className="py-1.5 px-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/35 text-red-400 font-bold rounded-lg text-[9px] uppercase tracking-wide disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            >
              End
            </button>
          </div>

          <div className="pt-2 border-t border-brand-blue-light/20 flex flex-col space-y-2">
            <button
              onClick={handleExportCsv}
              className="w-full py-2 px-3 bg-brand-blue-navy hover:bg-brand-blue-light/20 border border-brand-gold/20 text-brand-gold font-semibold rounded-lg text-[10px] uppercase flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
            >
              <Download size={11} />
              <span>Export CSV Report</span>
            </button>

            <div className="flex space-x-2">
              <button
                onClick={handleResetCardsBack}
                className="flex-1 py-2 px-2 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold rounded-lg text-[9px] uppercase flex items-center justify-center space-x-1 active:scale-95 transition-all"
              >
                <RotateCcw size={11} />
                <span>Reset Cards Back</span>
              </button>

              <button
                onClick={handleResetCampaign}
                className="flex-1 py-2 px-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 font-semibold rounded-lg text-[9px] uppercase flex items-center justify-center space-x-1 active:scale-95 transition-all"
              >
                <RotateCcw size={11} />
                <span>Reset Campaign</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Search and Customer List */}
        <div className="space-y-3">
          <div className="flex flex-col space-y-2">
            <h3 className="text-xs font-bold text-brand-gold uppercase tracking-wider ml-1">
              Customer Registry
            </h3>
            
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type="text"
                placeholder="Search code, name, email..."
                value={search}
                onChange={handleSearchChange}
                className="w-full bg-brand-blue-deep/60 border border-brand-blue-light/50 focus:border-brand-gold rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            {/* Filter Selection Row */}
            <div className="flex items-center space-x-2">
              <Filter size={12} className="text-slate-400" />
              <select
                value={redeemedFilter}
                onChange={handleFilterChange}
                className="flex-1 bg-brand-blue-deep/60 border border-brand-blue-light/50 text-slate-300 text-xs rounded-xl py-2 px-3 outline-none"
              >
                <option value="">All Verification States</option>
                <option value="true">Redeemed Gifts Only</option>
                <option value="false">Pending Claims Only</option>
              </select>
            </div>
          </div>

          {/* Customer list load state */}
          {listLoading ? (
            <div className="w-full py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="glass-panel p-6 rounded-xl text-center text-slate-400 text-xs">
              No matching customer registrations found.
            </div>
          ) : (
            <div className="space-y-2.5">
              {users.map((user) => {
                const card = user.assignedCard;
                const isExpanded = expandedUser === user._id;
                
                return (
                  <div 
                    key={user._id} 
                    className={`glass-panel rounded-xl overflow-hidden border transition-all duration-200 ${
                      card?.redeemed ? 'border-emerald-500/10' : 'border-brand-gold/10'
                    }`}
                  >
                    {/* Header trigger summary row */}
                    <div 
                      onClick={() => toggleExpand(user._id)}
                      className="p-3.5 flex items-center justify-between cursor-pointer active:bg-brand-blue-navy/20 select-none"
                    >
                      <div className="space-y-0.5 max-w-[200px]">
                        <h4 className="text-xs font-bold text-white uppercase truncate">{user.fullName}</h4>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      <div className="flex items-center space-x-3.5">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block font-mono">
                            {card ? card.cardNumber : 'No Card'}
                          </span>
                          <span className="text-xs font-bold text-brand-gold font-sans block">
                            {card ? card.reward : 'N/A'}
                          </span>
                        </div>

                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>

                    {/* Expandable actions drawer */}
                    {isExpanded && (
                      <div className="p-4 bg-brand-blue-deep/30 border-t border-brand-gold/10 space-y-3.5 text-xs text-slate-300">
                        <div className="grid grid-cols-2 gap-2 text-[11px] leading-relaxed">
                          <div className="col-span-2">
                            <span className="text-[9px] text-slate-500 uppercase block">Email Address</span>
                            <span className="text-white break-all">{user.email}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">Redemption State</span>
                            <span className={`font-bold ${card?.redeemed ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {card?.redeemed ? 'Redeemed' : 'Pending Claim'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">Date Assigned</span>
                            <span className="text-white">
                              {card?.createdDate ? new Date(card.createdDate).toLocaleDateString('en-IN') : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons inside drawer */}
                        {card && (
                          <div className="pt-2.5 border-t border-brand-blue-light/10 flex justify-end space-x-2">
                            {card.redeemed ? (
                              <button
                                onClick={() => handleCancelRedemption(card._id)}
                                disabled={actionLoading === card._id}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-2 px-3 rounded-lg text-[10px] uppercase flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
                              >
                                <XCircle size={12} />
                                <span>{actionLoading === card._id ? 'Processing...' : 'Cancel Redemption'}</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRedeem(card._id)}
                                disabled={actionLoading === card._id}
                                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-2 px-3 rounded-lg text-[10px] uppercase flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
                              >
                                <CheckCircle2 size={12} />
                                <span>{actionLoading === card._id ? 'Processing...' : 'Mark as Redeemed'}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination bar */}
          {!listLoading && totalPages > 1 && (
            <div className="flex items-center justify-between text-xs py-3 border-t border-brand-gold/10">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="py-1 px-3 bg-brand-blue-navy rounded border border-brand-blue-light/30 text-slate-300 disabled:opacity-30 disabled:pointer-events-none"
              >
                Previous
              </button>
              
              <span className="text-slate-400">
                Page <strong className="text-brand-gold">{page}</strong> of <strong className="text-brand-gold">{totalPages}</strong>
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="py-1 px-3 bg-brand-blue-navy rounded border border-brand-blue-light/30 text-slate-300 disabled:opacity-30 disabled:pointer-events-none"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </MobileContainer>
  );
};

export default AdminDashboard;
