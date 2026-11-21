import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  checkAdminSession,
  deleteAdminProfile,
  deleteAdminRequest,
  fetchAdminDashboard,
  formatWhatsappHref,
  loginAdmin,
  logoutAdmin,
  updateAdminProfile,
  updateAdminRequestStatus,
  updateAdminSettings,
} from '../lib/api';
import type {
  BureauSettings,
  BureauStats,
  ContactRequest,
  MatrimonialProfile,
  ProfileStatus,
} from '../types';
import { AdminProfileFormModal } from './AdminProfileFormModal';
import { PaginationBar } from './PaginationBar';

interface AdminPanelProps {
  onBackToSite: () => void;
  onDataChanged: () => void;
}

type AdminTab = 'overview' | 'profiles' | 'requests' | 'settings';

export function AdminPanel({ onBackToSite, onDataChanged }: AdminPanelProps) {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<AdminTab>('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [settings, setSettings] = useState<BureauSettings | null>(null);
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [stats, setStats] = useState<BureauStats | null>(null);
  const [bannerMsg, setBannerMsg] = useState('');

  // Profile Filters & Pagination (9 per page)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProfileStatus>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'Bride' | 'Groom'>('all');
  const [profilePage, setProfilePage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);
  const ADMIN_PAGE_SIZE = 9;

  // Inline Delete Confirmation ID
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<MatrimonialProfile | null>(null);
  const [viewingPhotoProfile, setViewingPhotoProfile] = useState<MatrimonialProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    bureauName: '',
    whatsappNumber: '',
    feePerProfile: '100',
    paymentAccountTitle: '',
    paymentChannel: '',
    paymentInstructions: '',
    officeCity: '',
    newAdminPassword: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const loadDashboard = async () => {
    setLoadingData(true);
    try {
      const data = await fetchAdminDashboard();
      setSettings(data.settings);
      setProfiles(data.profiles);
      setRequests(data.requests);
      setStats(data.stats);
      setSettingsForm({
        bureauName: data.settings.bureauName,
        whatsappNumber: data.settings.whatsappNumber,
        feePerProfile: String(data.settings.feePerProfile),
        paymentAccountTitle: data.settings.paymentAccountTitle,
        paymentChannel: data.settings.paymentChannel,
        paymentInstructions: data.settings.paymentInstructions,
        officeCity: data.settings.officeCity,
        newAdminPassword: '',
      });
    } catch {
      setAuthenticated(false);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    checkAdminSession()
      .then((res) => {
        setAuthenticated(res.authenticated);
        setAuthChecked(true);
        if (res.authenticated) {
          loadDashboard();
        }
      })
      .catch(() => {
        setAuthChecked(true);
      });
  }, []);

  const flashBanner = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(''), 3500);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      await loginAdmin(password);
      setAuthenticated(true);
      setPassword('');
      await loadDashboard();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin().catch(() => undefined);
    setAuthenticated(false);
    setProfiles([]);
    setRequests([]);
  };

  const handleConfirmProfilePayment = async (profile: MatrimonialProfile) => {
    try {
      const res = await updateAdminProfile(profile.id, {
        status: 'approved',
        paymentConfirmed: true,
      });
      setProfiles((prev) => prev.map((p) => (p.id === profile.id ? res.profile : p)));
      setStats(res.stats);
      onDataChanged();
      flashBanner(`${profile.refCode} (${profile.fullName}) approved & Rs. ${profile.feeAmount} confirmed.`);
    } catch (err) {
      flashBanner(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const handleArchiveProfile = async (profile: MatrimonialProfile) => {
    const nextStatus: ProfileStatus = profile.status === 'archived' ? 'approved' : 'archived';
    try {
      const res = await updateAdminProfile(profile.id, { status: nextStatus });
      setProfiles((prev) => prev.map((p) => (p.id === profile.id ? res.profile : p)));
      setStats(res.stats);
      onDataChanged();
      flashBanner(`${profile.refCode} moved to ${nextStatus}.`);
    } catch (err) {
      flashBanner(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      const res = await deleteAdminProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      setStats(res.stats);
      setConfirmDeleteId(null);
      onDataChanged();
      flashBanner('Profile permanently deleted.');
    } catch (err) {
      flashBanner(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const handleUpdateRequest = async (reqItem: ContactRequest, nextStatus: ContactRequest['status']) => {
    try {
      const res = await updateAdminRequestStatus(reqItem.id, nextStatus);
      setRequests((prev) => prev.map((r) => (r.id === reqItem.id ? res.request : r)));
      setStats(res.stats);
      onDataChanged();
      flashBanner(`${reqItem.requestCode} marked as ${nextStatus}.`);
    } catch (err) {
      flashBanner(err instanceof Error ? err.message : 'Update failed.');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const res = await deleteAdminRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setStats(res.stats);
      setConfirmDeleteId(null);
      onDataChanged();
      flashBanner('Contact request deleted.');
    } catch (err) {
      flashBanner(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await updateAdminSettings({
        bureauName: settingsForm.bureauName,
        whatsappNumber: settingsForm.whatsappNumber,
        feePerProfile: Number(settingsForm.feePerProfile),
        paymentAccountTitle: settingsForm.paymentAccountTitle,
        paymentChannel: settingsForm.paymentChannel,
        paymentInstructions: settingsForm.paymentInstructions,
        officeCity: settingsForm.officeCity,
        newAdminPassword: settingsForm.newAdminPassword || undefined,
      });
      setSettings(res.settings);
      setStats(res.stats);
      setSettingsForm((prev) => ({ ...prev, newAdminPassword: '' }));
      onDataChanged();
      flashBanner('Bureau settings saved.');
    } catch (err) {
      flashBanner(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return profiles.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
      if (q) {
        const hay = `${p.refCode} ${p.fullName} ${p.city} ${p.profession} ${p.guardianPhone || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [profiles, searchQuery, statusFilter, genderFilter]);

  useEffect(() => {
    setProfilePage(1);
  }, [searchQuery, statusFilter, genderFilter]);

  const safeProfilePage = Math.min(
    profilePage,
    Math.max(1, Math.ceil(filteredProfiles.length / ADMIN_PAGE_SIZE))
  );
  const paginatedAdminProfiles = useMemo(() => {
    const start = (safeProfilePage - 1) * ADMIN_PAGE_SIZE;
    return filteredProfiles.slice(start, start + ADMIN_PAGE_SIZE);
  }, [filteredProfiles, safeProfilePage]);

  const safeRequestPage = Math.min(
    requestPage,
    Math.max(1, Math.ceil(requests.length / ADMIN_PAGE_SIZE))
  );
  const paginatedRequests = useMemo(() => {
    const start = (safeRequestPage - 1) * ADMIN_PAGE_SIZE;
    return requests.slice(start, start + ADMIN_PAGE_SIZE);
  }, [requests, safeRequestPage]);

  const pendingProfilesList = useMemo(
    () => profiles.filter((p) => p.status === 'pending_whatsapp'),
    [profiles]
  );

  const newRequestsList = useMemo(
    () => requests.filter((r) => r.status === 'direct_sent').slice(0, 6),
    [requests]
  );

  if (!authChecked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-sm text-[#5C574F]">
        Verifying admin session...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAF8F5]">
        <div className="w-full max-w-md bg-white border border-[#E7E2DA] rounded-xl p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#0F5C4D] mb-1">Marriage Bureau Console</p>
            <h1 className="font-display text-3xl font-semibold text-[#1A1917]">
              Admin Panel Sign In
            </h1>
            <p className="text-xs text-[#5C574F] mt-2 leading-relaxed">
              Manage matrimonial profiles, confirm Rs. 100 WhatsApp payments, and unlock family
              contact requests.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] disabled:opacity-60 transition-colors cursor-pointer"
            >
              {loggingIn ? 'Signing In...' : 'Sign In to Admin Console'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#EFEAE2] flex items-center justify-between text-xs text-[#5C574F]">
            <span>Default password: <code className="font-mono text-[#1A1917]">admin100</code></span>
            <button
              type="button"
              onClick={() => setPassword('admin100')}
              className="text-[#0F5C4D] font-medium hover:underline cursor-pointer"
            >
              Fill Default
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToSite}
            className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#5C574F] hover:text-[#1A1917] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Return to Public Matrimonial Site</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FAF8F5] flex flex-col lg:flex-row">
      {/* Sidebar Navigation (240px desktop) */}
      <aside className="lg:w-60 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-[#E7E2DA] flex flex-col justify-between">
        <div className="p-4">
          <div className="px-3 py-2 mb-3 hidden lg:block">
            <div className="text-xs font-semibold text-[#0F5C4D]">Bureau Operations</div>
            <div className="text-xs text-[#5C574F] mt-0.5 font-mono tabular-nums">
              WA: {settings?.whatsappNumber || '03096102719'}
            </div>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto" aria-label="Admin navigation">
            <button
              type="button"
              onClick={() => setTab('overview')}
              className={`inline-flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                tab === 'overview'
                  ? 'bg-[#0F5C4D] text-white'
                  : 'text-[#5C574F] hover:bg-[#F3EFE9] hover:text-[#1A1917]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              <span>Overview & Ledger</span>
            </button>

            <button
              type="button"
              onClick={() => setTab('profiles')}
              className={`inline-flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                tab === 'profiles'
                  ? 'bg-[#0F5C4D] text-white'
                  : 'text-[#5C574F] hover:bg-[#F3EFE9] hover:text-[#1A1917]'
              }`}
            >
              <span className="inline-flex items-center gap-2.5">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>Manage Profiles</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums opacity-85">
                {profiles.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab('requests')}
              className={`inline-flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                tab === 'requests'
                  ? 'bg-[#0F5C4D] text-white'
                  : 'text-[#5C574F] hover:bg-[#F3EFE9] hover:text-[#1A1917]'
              }`}
            >
              <span className="inline-flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4" aria-hidden="true" />
                <span>Contact Requests</span>
              </span>
              <span className="font-mono text-[11px] tabular-nums opacity-85">
                {requests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab('settings')}
              className={`inline-flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                tab === 'settings'
                  ? 'bg-[#0F5C4D] text-white'
                  : 'text-[#5C574F] hover:bg-[#F3EFE9] hover:text-[#1A1917]'
              }`}
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              <span>Bureau Settings</span>
            </button>
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-[#E7E2DA] space-y-1.5">
          <button
            type="button"
            onClick={onBackToSite}
            className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#5C574F] hover:text-[#1A1917] hover:bg-[#F3EFE9] rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>View Public Site</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl">
        {/* Top Bar Contract for Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E2DA] mb-6">
          <div>
            <div className="text-xs text-[#5C574F]">
              Admin Console / <span className="text-[#1A1917] font-medium capitalize">{tab}</span>
            </div>
            <h1 className="font-display text-3xl font-semibold text-[#1A1917] mt-0.5">
              {tab === 'overview' && 'Bureau Overview & Rs. 100 Fee Ledger'}
              {tab === 'profiles' && 'Matrimonial Profiles Registry'}
              {tab === 'requests' && 'Contact Unlock Requests'}
              {tab === 'settings' && 'Bureau & WhatsApp Settings'}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Profile</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden px-3 py-2 text-xs font-medium text-red-700 bg-white border border-[#E7E2DA] rounded-lg cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {bannerMsg && (
          <div className="mb-6 p-3.5 bg-white border border-[#0F5C4D]/40 text-xs font-medium text-[#0F5C4D] rounded-lg">
            {bannerMsg}
          </div>
        )}

        {loadingData && !stats ? (
          <div className="py-12 text-center text-sm text-[#5C574F]">Loading bureau records...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && stats && settings && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 border border-[#E7E2DA] rounded-xl bg-white divide-y lg:divide-y-0 lg:divide-x divide-[#E7E2DA]">
                  <div className="p-5">
                    <div className="text-xs text-[#5C574F]">One-Time Upload Revenue</div>
                    <div className="mt-1 font-mono text-2xl font-semibold text-[#0F5C4D] tabular-nums">
                      {settings.currency} {stats.confirmedRevenueRs.toLocaleString()}
                    </div>
                    <div className="mt-0.5 text-xs text-[#787166]">
                      {settings.currency} {settings.feePerProfile} once per profile upload
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-[#5C574F]">Live Approved Profiles</div>
                    <div className="mt-1 font-mono text-2xl font-semibold text-[#1A1917] tabular-nums">
                      {stats.approvedProfiles}
                    </div>
                    <div className="mt-0.5 text-xs text-[#787166]">
                      Of {stats.totalProfiles} total profiles
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-[#5C574F]">Pending Upload Approvals</div>
                    <div className="mt-1 font-mono text-2xl font-semibold text-[#B45309] tabular-nums">
                      {stats.pendingProfiles}
                    </div>
                    <div className="mt-0.5 text-xs text-[#787166]">Awaiting one-time Rs. {settings.feePerProfile}</div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-[#5C574F]">Direct Client Inquiries</div>
                    <div className="mt-1 font-mono text-2xl font-semibold text-[#1A1917] tabular-nums">
                      {stats.totalRequests}
                    </div>
                    <div className="mt-0.5 text-xs text-[#787166]">
                      {stats.newRequests} new · Free direct contact
                    </div>
                  </div>
                </div>

                {/* Pending Profile WhatsApp Confirmations */}
                <div className="bg-white border border-[#E7E2DA] rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E7E2DA] flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-[#1A1917]">
                        Pending Profile Confirmations ({settings.currency} {settings.feePerProfile})
                      </h2>
                      <p className="text-xs text-[#5C574F] mt-0.5">
                        Approve once family sends Rs. {settings.feePerProfile} confirmation on WhatsApp {settings.whatsappNumber}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('profiles')}
                      className="text-xs font-semibold text-[#0F5C4D] hover:underline cursor-pointer"
                    >
                      View All Profiles
                    </button>
                  </div>

                  {pendingProfilesList.length === 0 ? (
                    <div className="p-6 text-xs text-[#5C574F]">
                      All submitted profiles have been reviewed.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EFEAE2]">
                      {pendingProfilesList.map((p) => (
                        <div
                          key={p.id}
                          className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {p.photoUrl ? (
                              <button
                                type="button"
                                onClick={() => setViewingPhotoProfile(p)}
                                className="shrink-0 cursor-pointer group"
                                title="View candidate photo for matchmaking"
                              >
                                <img
                                  src={p.photoUrl}
                                  alt={`${p.fullName} portrait`}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-12 object-cover rounded border border-[#D8D1C5] group-hover:border-[#0F5C4D]"
                                />
                              </button>
                            ) : (
                              <div className="w-10 h-12 rounded border border-[#E7E2DA] bg-[#FAF8F5] flex items-center justify-center text-[11px] font-semibold text-[#787166] shrink-0">
                                {p.fullName
                                  .split(' ')
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-xs text-[#5C574F] tabular-nums">
                                <span className="font-mono font-semibold text-[#0F5C4D]">{p.refCode}</span>
                                {' · '}
                                <span>{p.gender}, {p.age} yrs</span>
                                {' · '}
                                <span>{p.city}</span>
                                {' · '}
                                <span className="font-mono">Guardian: {p.guardianPhone}</span>
                                {p.hidePhoto && (
                                  <>
                                    {' · '}
                                    <span className="inline-flex items-center gap-1 font-medium text-[#B45309]">
                                      <EyeOff className="w-3 h-3" aria-hidden="true" />
                                      {p.photoUrl ? 'Private Photo (Admin Only)' : 'Photo Hidden (No Upload)'}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-sm font-semibold text-[#1A1917] mt-0.5 truncate">
                                {p.fullName} — {p.profession}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {p.photoUrl && (
                              <button
                                type="button"
                                onClick={() => setViewingPhotoProfile(p)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#0F5C4D] bg-white border border-[#D8D1C5] rounded-lg hover:bg-[#F3EFE9] cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>View Photo</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleConfirmProfilePayment(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] cursor-pointer whitespace-nowrap"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Confirm {settings.currency} {p.feeAmount} & Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingProfile(p)}
                              className="px-3 py-1.5 text-xs font-medium text-[#1A1917] bg-white border border-[#D8D1C5] rounded-lg hover:bg-[#F3EFE9] cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Direct Client Inquiries */}
                <div className="bg-white border border-[#E7E2DA] rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E7E2DA] flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-[#1A1917]">
                        Recent Client-to-Client Contact Inquiries (Free)
                      </h2>
                      <p className="text-xs text-[#5C574F] mt-0.5">
                        Families contact each other directly at no fee once profiles are live.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('requests')}
                      className="text-xs font-semibold text-[#0F5C4D] hover:underline cursor-pointer"
                    >
                      View All Requests
                    </button>
                  </div>

                  {newRequestsList.length === 0 ? (
                    <div className="p-6 text-xs text-[#5C574F]">
                      All client inquiries have been reviewed.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EFEAE2]">
                      {newRequestsList.map((reqItem) => (
                        <div
                          key={reqItem.id}
                          className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]"
                        >
                          <div>
                            <div className="text-xs text-[#5C574F] tabular-nums">
                              <span className="font-mono font-semibold text-[#0F5C4D]">
                                {reqItem.requestCode}
                              </span>
                              {' · '}
                              <span>For {reqItem.profileRefCode} ({reqItem.profileName})</span>
                              {' · '}
                              <span className="font-mono">{reqItem.requesterPhone}</span>
                            </div>
                            <div className="text-sm font-semibold text-[#1A1917] mt-0.5">
                              {reqItem.requesterName} ({reqItem.relationToCandidate}, {reqItem.requesterCity})
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateRequest(reqItem, 'reviewed')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] cursor-pointer whitespace-nowrap"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Mark Reviewed</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROFILES TAB */}
            {tab === 'profiles' && settings && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E7E2DA] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search
                      className="w-4 h-4 text-[#787166] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by ID, name, city, phone..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | ProfileStatus)}
                      className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending_whatsapp">Pending WhatsApp</option>
                      <option value="approved">Approved & Live</option>
                      <option value="archived">Archived</option>
                    </select>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value as 'all' | 'Bride' | 'Groom')}
                      className="px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg"
                    >
                      <option value="all">All Genders</option>
                      <option value="Bride">Brides</option>
                      <option value="Groom">Grooms</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-[#E7E2DA] rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[820px]">
                    <thead>
                      <tr className="border-b border-[#E7E2DA] bg-[#FAF8F5] text-[11px] font-semibold text-[#5C574F]">
                        <th className="py-3 px-4">Ref ID</th>
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">City & Profession</th>
                        <th className="py-3 px-4">Guardian Contact</th>
                        <th className="py-3 px-4 text-right">Fee</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEAE2] text-xs">
                      {filteredProfiles.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-[#5C574F]">
                            No profiles match the current filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedAdminProfiles.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FAF8F5]">
                            <td className="py-3 px-4 font-mono font-semibold text-[#0F5C4D] tabular-nums whitespace-nowrap">
                              {p.refCode}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                {p.photoUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => setViewingPhotoProfile(p)}
                                    className="shrink-0 cursor-pointer group"
                                    title="View candidate photo for matchmaking"
                                  >
                                    <img
                                      src={p.photoUrl}
                                      alt={`${p.fullName} portrait`}
                                      referrerPolicy="no-referrer"
                                      className="w-9 h-11 object-cover rounded border border-[#D8D1C5] group-hover:border-[#0F5C4D]"
                                    />
                                  </button>
                                ) : (
                                  <div className="w-9 h-11 rounded border border-[#E7E2DA] bg-[#FAF8F5] flex items-center justify-center text-[10px] font-semibold text-[#787166] shrink-0">
                                    {p.fullName
                                      .split(' ')
                                      .slice(0, 2)
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-[#1A1917]">{p.fullName}</div>
                                  <div className="text-[#5C574F] tabular-nums">
                                    {p.gender} · {p.age} yrs · {p.maritalStatus}
                                  </div>
                                  {p.hidePhoto && (
                                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B45309] mt-0.5">
                                      <EyeOff className="w-3 h-3" aria-hidden="true" />
                                      <span>
                                        {p.photoUrl
                                          ? 'Private Photo (Admin Only)'
                                          : 'Photo Hidden (No Upload)'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-[#1A1917]">{p.city}</div>
                              <div className="text-[#5C574F] truncate max-w-[200px]">{p.profession}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-[#1A1917]">{p.guardianName}</div>
                              <div className="font-mono text-[#5C574F] tabular-nums">{p.guardianPhone}</div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                              <div className="font-semibold text-[#1A1917]">
                                {settings.currency} {p.feeAmount}
                              </div>
                              <div className={p.paymentConfirmed ? 'text-[#0F5C4D]' : 'text-[#B45309]'}>
                                {p.paymentConfirmed ? 'Paid' : 'Unpaid'}
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`font-semibold ${
                                  p.status === 'approved'
                                    ? 'text-[#0F5C4D]'
                                    : p.status === 'pending_whatsapp'
                                      ? 'text-[#B45309]'
                                      : 'text-[#787166]'
                                }`}
                              >
                                {p.status === 'approved'
                                  ? 'Approved'
                                  : p.status === 'pending_whatsapp'
                                    ? 'Pending WA'
                                    : 'Archived'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                {p.photoUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setViewingPhotoProfile(p)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#0F5C4D] bg-white border border-[#D8D1C5] rounded hover:bg-[#F3EFE9] cursor-pointer"
                                    title="View photo for matchmaking"
                                  >
                                    <Eye className="w-3 h-3" aria-hidden="true" />
                                    <span>Photo</span>
                                  </button>
                                )}
                                {p.status !== 'approved' && (
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmProfilePayment(p)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0F5C4D] rounded hover:bg-[#0B473B] cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setEditingProfile(p)}
                                  className="px-2.5 py-1 text-[11px] font-medium text-[#1A1917] bg-white border border-[#D8D1C5] rounded hover:bg-[#F3EFE9] cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleArchiveProfile(p)}
                                  className="px-2.5 py-1 text-[11px] font-medium text-[#5C574F] hover:text-[#1A1917] cursor-pointer"
                                >
                                  {p.status === 'archived' ? 'Restore' : 'Archive'}
                                </button>
                                {confirmDeleteId === p.id ? (
                                  <span className="inline-flex items-center gap-1 ml-1">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProfile(p.id)}
                                      className="px-2 py-1 text-[11px] font-semibold text-white bg-red-600 rounded cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-1.5 py-1 text-[11px] text-[#5C574F] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(p.id)}
                                    className="p-1.5 text-[#787166] hover:text-red-600 cursor-pointer"
                                    aria-label={`Delete profile ${p.refCode}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationBar
                  currentPage={safeProfilePage}
                  totalItems={filteredProfiles.length}
                  pageSize={ADMIN_PAGE_SIZE}
                  itemLabel="profiles"
                  onPageChange={(page) => setProfilePage(page)}
                />
              </div>
            )}

            {/* REQUESTS TAB */}
            {tab === 'requests' && settings && (
              <div className="space-y-4">
                <div className="bg-white border border-[#E7E2DA] rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[820px]">
                    <thead>
                      <tr className="border-b border-[#E7E2DA] bg-[#FAF8F5] text-[11px] font-semibold text-[#5C574F]">
                        <th className="py-3 px-4">Request ID</th>
                        <th className="py-3 px-4">Target Profile</th>
                        <th className="py-3 px-4">Applicant Family</th>
                        <th className="py-3 px-4 text-right">Fee</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEAE2] text-xs">
                      {requests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#5C574F]">
                            No contact unlock requests submitted yet.
                          </td>
                        </tr>
                      ) : (
                        paginatedRequests.map((r) => {
                          const targetProfile = profiles.find((p) => p.id === r.profileId);
                          const requesterWa = formatWhatsappHref(
                            r.requesterPhone.replace(/^0/, '92'),
                            targetProfile
                              ? `Assalam-o-Alaikum ${r.requesterName}, your Rs. ${r.feeAmount} request (${r.requestCode}) for profile ${r.profileRefCode} (${r.profileName}) is confirmed.\nGuardian: ${targetProfile.guardianName}\nPhone: ${targetProfile.guardianPhone || ''}`
                              : `Assalam-o-Alaikum ${r.requesterName}, regarding request ${r.requestCode}.`
                          );
                          return (
                            <tr key={r.id} className="hover:bg-[#FAF8F5]">
                              <td className="py-3 px-4 font-mono font-semibold text-[#0F5C4D] tabular-nums whitespace-nowrap">
                                {r.requestCode}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-mono text-[#1A1917] font-semibold">
                                  {r.profileRefCode}
                                </div>
                                <div className="text-[#5C574F]">{r.profileName}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-[#1A1917]">
                                  {r.requesterName} ({r.relationToCandidate})
                                </div>
                                <div className="text-[#5C574F] font-mono tabular-nums">
                                  {r.requesterCity} · {r.requesterPhone}
                                </div>
                                {r.message && (
                                  <div className="text-[#787166] mt-0.5 max-w-xs truncate">
                                    {r.message}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-[#5C574F] tabular-nums whitespace-nowrap">
                                Free (Direct)
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`font-semibold ${
                                    r.status === 'reviewed'
                                      ? 'text-[#0F5C4D]'
                                      : r.status === 'direct_sent'
                                        ? 'text-[#1A1917]'
                                        : 'text-red-700'
                                  }`}
                                >
                                  {r.status === 'reviewed'
                                    ? 'Reviewed'
                                    : r.status === 'direct_sent'
                                      ? 'Direct Sent'
                                      : 'Declined'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  {r.status !== 'reviewed' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateRequest(r, 'reviewed')}
                                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0F5C4D] rounded hover:bg-[#0B473B] cursor-pointer"
                                    >
                                      Mark Reviewed
                                    </button>
                                  )}
                                  <a
                                    href={requesterWa}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#0F5C4D] bg-white border border-[#D8D1C5] rounded hover:bg-[#F3EFE9]"
                                  >
                                    <MessageCircle className="w-3 h-3" aria-hidden="true" />
                                    <span>WhatsApp</span>
                                  </a>
                                  {confirmDeleteId === r.id ? (
                                    <span className="inline-flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRequest(r.id)}
                                        className="px-2 py-1 text-[11px] font-semibold text-white bg-red-600 rounded cursor-pointer"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="px-1.5 py-1 text-[11px] text-[#5C574F] cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(r.id)}
                                      className="p-1.5 text-[#787166] hover:text-red-600 cursor-pointer"
                                      aria-label={`Delete request ${r.requestCode}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationBar
                  currentPage={safeRequestPage}
                  totalItems={requests.length}
                  pageSize={ADMIN_PAGE_SIZE}
                  itemLabel="client requests"
                  onPageChange={(page) => setRequestPage(page)}
                />
              </div>
            )}

            {/* SETTINGS TAB */}
            {tab === 'settings' && (
              <form
                onSubmit={handleSaveSettings}
                className="max-w-2xl bg-white border border-[#E7E2DA] rounded-xl p-6 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Bureau Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.bureauName}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, bureauName: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      WhatsApp Confirmation Number
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsappNumber}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg tabular-nums focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Fee Per Profile (Rs.)
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={settingsForm.feePerProfile}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, feePerProfile: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm font-mono bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg tabular-nums focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Office Region / City
                    </label>
                    <input
                      type="text"
                      value={settingsForm.officeCity}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, officeCity: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Account Title
                    </label>
                    <input
                      type="text"
                      value={settingsForm.paymentAccountTitle}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, paymentAccountTitle: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Payment Channel (EasyPaisa / JazzCash)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.paymentChannel}
                      onChange={(e) =>
                        setSettingsForm((prev) => ({ ...prev, paymentChannel: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1A1917] mb-1">
                    Payment & Confirmation Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.paymentInstructions}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, paymentInstructions: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                  />
                </div>

                <div className="pt-4 border-t border-[#EFEAE2]">
                  <label className="block text-xs font-medium text-[#1A1917] mb-1">
                    Change Admin Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    minLength={4}
                    value={settingsForm.newAdminPassword}
                    onChange={(e) =>
                      setSettingsForm((prev) => ({ ...prev, newAdminPassword: e.target.value }))
                    }
                    placeholder="New password (min 4 characters)"
                    className="w-full sm:max-w-xs px-3 py-2 text-sm bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] disabled:opacity-60 cursor-pointer"
                >
                  {savingSettings ? 'Saving Settings...' : 'Save Bureau Settings'}
                </button>
              </form>
            )}
          </>
        )}

        {(showCreateModal || editingProfile) && settings && (
          <AdminProfileFormModal
            profile={editingProfile}
            settings={settings}
            onClose={() => {
              setShowCreateModal(false);
              setEditingProfile(null);
            }}
            onSaved={(savedProfile, updatedStats, isNew) => {
              if (isNew) {
                setProfiles((prev) => [savedProfile, ...prev]);
                flashBanner(`Created profile ${savedProfile.refCode} (${savedProfile.fullName}).`);
              } else {
                setProfiles((prev) =>
                  prev.map((p) => (p.id === savedProfile.id ? savedProfile : p))
                );
                flashBanner(`Updated profile ${savedProfile.refCode}.`);
              }
              setStats(updatedStats);
              setShowCreateModal(false);
              setEditingProfile(null);
              onDataChanged();
            }}
          />
        )}

        {viewingPhotoProfile && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-photo-modal-title"
          >
            <div className="w-full max-w-md bg-white border border-[#E7E2DA] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E7E2DA] flex items-center justify-between bg-[#FAF8F5]">
                <div>
                  <div className="font-mono text-xs font-semibold text-[#0F5C4D] tabular-nums">
                    {viewingPhotoProfile.refCode} · Matchmaking Photo View
                  </div>
                  <h2
                    id="admin-photo-modal-title"
                    className="font-display text-xl font-semibold text-[#1A1917]"
                  >
                    {viewingPhotoProfile.fullName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingPhotoProfile(null)}
                  className="p-1.5 text-[#5C574F] hover:text-[#1A1917] rounded-lg hover:bg-[#EFEAE2] cursor-pointer"
                  aria-label="Close photo preview"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="aspect-[4/5] w-full max-h-[380px] overflow-hidden rounded-lg border border-[#E7E2DA] bg-[#FAF8F5]">
                  <img
                    src={viewingPhotoProfile.photoUrl}
                    alt={`${viewingPhotoProfile.fullName} private matchmaking portrait`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-3 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-[#1A1917]">
                    {viewingPhotoProfile.hidePhoto ? (
                      <span className="inline-flex items-center gap-1.5 text-[#B45309]">
                        <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Hidden on Public Website — Admin Matchmaking Only</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[#0F5C4D]">
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Public Profile Photo</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[#5C574F] tabular-nums">
                    {viewingPhotoProfile.gender} · {viewingPhotoProfile.age} yrs ·{' '}
                    {viewingPhotoProfile.city} · {viewingPhotoProfile.profession}
                  </div>
                  <div className="text-[#5C574F] font-mono tabular-nums">
                    Guardian: {viewingPhotoProfile.guardianName} ({viewingPhotoProfile.guardianPhone})
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewingPhotoProfile;
                      setViewingPhotoProfile(null);
                      setEditingProfile(target);
                    }}
                    className="px-4 py-2 text-xs font-medium text-[#1A1917] bg-white border border-[#D8D1C5] rounded-lg hover:bg-[#F3EFE9] cursor-pointer"
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingPhotoProfile(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
