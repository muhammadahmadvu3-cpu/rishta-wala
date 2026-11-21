/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { ProfileDirectory } from './components/ProfileDirectory';
import { SubmitProfileSection } from './components/SubmitProfileSection';
import { TrackStatusSection } from './components/TrackStatusSection';
import { fetchPublicBootstrap, formatWhatsappHref } from './lib/api';
import type { BureauStats, MatrimonialProfile, PublicBureauSettings } from './types';

const DEFAULT_SETTINGS: PublicBureauSettings = {
  bureauName: 'Noor Rishta Bureau',
  whatsappNumber: '03096102719',
  whatsappIntl: '923096102719',
  feePerProfile: 100,
  currency: 'Rs.',
  paymentAccountTitle: 'Noor Rishta Marriage Bureau',
  paymentChannel: 'EasyPaisa / JazzCash — 03096102719',
  paymentInstructions:
    'Every profile listing or family contact unlock carries a flat verification fee of Rs. 100. Send Rs. 100 via EasyPaisa or JazzCash and share your Reference ID on WhatsApp 03096102719 for confirmation.',
  officeCity: 'Lahore & Nationwide Pakistan',
};

const DEFAULT_STATS: BureauStats = {
  totalProfiles: 0,
  approvedProfiles: 0,
  pendingProfiles: 0,
  archivedProfiles: 0,
  totalRequests: 0,
  reviewedRequests: 0,
  newRequests: 0,
  confirmedRevenueRs: 0,
};

export default function App() {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const [settings, setSettings] = useState<PublicBureauSettings>(DEFAULT_SETTINGS);
  const [profiles, setProfiles] = useState<MatrimonialProfile[]>([]);
  const [stats, setStats] = useState<BureauStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<MatrimonialProfile | null>(null);

  const loadPublicData = useCallback(async () => {
    try {
      const data = await fetchPublicBootstrap();
      setSettings(data.settings);
      setProfiles(data.profiles);
      setStats(data.stats);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load profiles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPublicData();
  }, [loadPublicData]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1A1917]">
      <Navbar
        bureauName={settings.bureauName}
        feePerProfile={settings.feePerProfile}
        currency={settings.currency}
        activeView={view}
        onNavigateSection={scrollToSection}
        onOpenAdmin={() => {
          setView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPublic={() => setView('public')}
      />

      {view === 'admin' ? (
        <AdminPanel
          onBackToSite={() => {
            setView('public');
            loadPublicData();
          }}
          onDataChanged={loadPublicData}
        />
      ) : (
        <>
          <main className="flex-1">
            {error && (
              <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
                <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              </div>
            )}

            <HeroSection
              settings={settings}
              stats={stats}
              onScrollToSubmit={() => scrollToSection('submit-profile')}
              onScrollToDirectory={() => scrollToSection('directory')}
            />

            <ProfileDirectory
              profiles={profiles}
              settings={settings}
              loading={loading}
              onSelectProfile={(profile) => setSelectedProfile(profile)}
            />

            <SubmitProfileSection settings={settings} onProfileSubmitted={loadPublicData} />

            <TrackStatusSection settings={settings} />
          </main>

          <footer className="bg-white border-t border-[#E7E2DA] py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="font-display text-2xl font-semibold text-[#1A1917]">
                  {settings.bureauName}
                </div>
                <p className="text-xs text-[#5C574F] mt-1">
                  {settings.officeCity} · {settings.currency} {settings.feePerProfile} per profile
                  confirmed on WhatsApp {settings.whatsappNumber}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#5C574F]">
                <button
                  type="button"
                  onClick={() => scrollToSection('directory')}
                  className="hover:text-[#1A1917] cursor-pointer"
                >
                  Browse Rishtas
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('submit-profile')}
                  className="hover:text-[#1A1917] cursor-pointer"
                >
                  Submit Profile
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('track-status')}
                  className="hover:text-[#1A1917] cursor-pointer"
                >
                  Track Status
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-[#0F5C4D] font-semibold hover:underline cursor-pointer"
                >
                  Admin Panel
                </button>
                <a
                  href={formatWhatsappHref(
                    settings.whatsappIntl,
                    `Assalam-o-Alaikum ${settings.bureauName}, I would like to connect with your marriage bureau desk.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#0F5C4D] font-semibold hover:underline font-mono tabular-nums"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{settings.whatsappNumber}</span>
                </a>
              </div>
            </div>
          </footer>
        </>
      )}

      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          settings={settings}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}
