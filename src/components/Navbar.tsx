import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  bureauName: string;
  feePerProfile: number;
  currency: string;
  activeView: 'public' | 'admin';
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
  onOpenPublic: () => void;
}

export function Navbar({
  bureauName,
  feePerProfile,
  currency,
  activeView,
  onNavigateSection,
  onOpenAdmin,
  onOpenPublic,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSection = (id: string) => {
    setMobileOpen(false);
    if (activeView !== 'public') {
      onOpenPublic();
      setTimeout(() => {
        onNavigateSection(id);
      }, 60);
    } else {
      onNavigateSection(id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E7E2DA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            onOpenPublic();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-2xl font-semibold tracking-tight text-[#1A1917] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5C4D] rounded"
        >
          {bureauName}
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C574F]" aria-label="Primary navigation">
          <button
            type="button"
            onClick={() => handleSection('directory')}
            className="hover:text-[#1A1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Browse Rishtas
          </button>
          <button
            type="button"
            onClick={() => handleSection('submit-profile')}
            className="hover:text-[#1A1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Submit Profile
          </button>
          <button
            type="button"
            onClick={() => handleSection('track-status')}
            className="hover:text-[#1A1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Track Status
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenAdmin();
            }}
            className={`hover:text-[#1A1917] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeView === 'admin' ? 'text-[#0F5C4D] font-semibold underline' : ''
            }`}
          >
            Admin Panel
          </button>
        </nav>

        {/* Zone 3: 1 primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSection('submit-profile')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F5C4D]"
          >
            Register — {currency} {feePerProfile}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#E7E2DA] text-[#1A1917] hover:bg-[#F3EFE9] cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E7E2DA] bg-[#FAF8F5] px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleSection('directory')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-[#1A1917] rounded-lg hover:bg-[#F3EFE9]"
          >
            Browse Rishtas
          </button>
          <button
            type="button"
            onClick={() => handleSection('submit-profile')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-[#1A1917] rounded-lg hover:bg-[#F3EFE9]"
          >
            Submit Profile ({currency} {feePerProfile})
          </button>
          <button
            type="button"
            onClick={() => handleSection('track-status')}
            className="block w-full text-left px-3 py-2.5 text-sm font-medium text-[#1A1917] rounded-lg hover:bg-[#F3EFE9]"
          >
            Track Status
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenAdmin();
            }}
            className="block w-full text-left px-3 py-2.5 text-sm font-semibold text-[#0F5C4D] rounded-lg hover:bg-[#F3EFE9]"
          >
            Admin Panel
          </button>
        </div>
      )}
    </header>
  );
}
