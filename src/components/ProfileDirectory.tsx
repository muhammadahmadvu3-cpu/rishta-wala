import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { MatrimonialProfile, PublicBureauSettings } from '../types';
import { PaginationBar } from './PaginationBar';
import { ProfilePhoto } from './ProfilePhoto';

interface ProfileDirectoryProps {
  profiles: MatrimonialProfile[];
  settings: PublicBureauSettings;
  loading: boolean;
  onSelectProfile: (profile: MatrimonialProfile) => void;
}

export function ProfileDirectory({
  profiles,
  settings,
  loading,
  onSelectProfile,
}: ProfileDirectoryProps) {
  const [genderFilter, setGenderFilter] = useState<'All' | 'Bride' | 'Groom'>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [maritalFilter, setMaritalFilter] = useState<string>('All');
  const [query, setQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const PAGE_SIZE = 9;

  const cities = useMemo(() => {
    const unique = Array.from(new Set(profiles.map((p) => p.city).filter(Boolean))).sort();
    return ['All', ...unique];
  }, [profiles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (genderFilter !== 'All' && p.gender !== genderFilter) return false;
      if (cityFilter !== 'All' && p.city !== cityFilter) return false;
      if (maritalFilter !== 'All' && p.maritalStatus !== maritalFilter) return false;
      if (q) {
        const hay = `${p.refCode} ${p.fullName} ${p.city} ${p.education} ${p.profession} ${p.caste} ${p.sect}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [profiles, genderFilter, cityFilter, maritalFilter, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [genderFilter, cityFilter, maritalFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProfiles = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const handlePageChange = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
    const el = document.getElementById('directory');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="directory" className="py-14 lg:py-18 bg-[#FAF8F5] border-b border-[#E7E2DA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-[#0F5C4D] mb-2">
              01. Verified Matrimonial Directory
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-[#1A1917] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Approved Brides & Grooms
            </h2>
          </div>
          <p className="text-sm text-[#5C574F] max-w-md">
            Every profile below is verified after a one-time {settings.currency} {settings.feePerProfile}{' '}
            upload confirmation. View full biodata and contact families directly—no extra fees.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#E7E2DA] rounded-xl p-4 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Segmented Gender Filter */}
          <div
            className="inline-flex items-center p-1 bg-[#F3EFE9] rounded-lg self-start"
            role="tablist"
            aria-label="Filter profiles by category"
          >
            {(['All', 'Bride', 'Groom'] as const).map((tab) => {
              const label = tab === 'All' ? 'All Rishtas' : tab === 'Bride' ? 'Brides' : 'Grooms';
              const active = genderFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setGenderFilter(tab)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#1A1917] shadow-xs'
                      : 'text-[#5C574F] hover:text-[#1A1917]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:justify-end">
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                className="w-4 h-4 text-[#787166] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, degree, profession, ID..."
                aria-label="Search approved profiles"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg text-[#1A1917] placeholder:text-[#8C857B] focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#787166] hidden sm:block" aria-hidden="true" />
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                aria-label="Filter by city"
                className="px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#0F5C4D]"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Cities' : c}
                  </option>
                ))}
              </select>

              <select
                value={maritalFilter}
                onChange={(e) => setMaritalFilter(e.target.value)}
                aria-label="Filter by marital status"
                className="px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#0F5C4D]"
              >
                <option value="All">Any Marital Status</option>
                <option value="Never Married">Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Khula">Khula</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border border-[#E7E2DA] rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-64 bg-[#EFEAE2]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-1/2 bg-[#EFEAE2] rounded" />
                  <div className="h-6 w-2/3 bg-[#EFEAE2] rounded" />
                  <div className="h-4 w-full bg-[#EFEAE2] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#E7E2DA] rounded-xl p-10 text-center">
            <h3 className="font-display text-2xl font-semibold text-[#1A1917] mb-2">
              No Matching Profiles Found
            </h3>
            <p className="text-sm text-[#5C574F] max-w-md mx-auto mb-5">
              Try clearing your city or search filters to view all verified brides and grooms currently
              registered with {settings.bureauName}.
            </p>
            <button
              type="button"
              onClick={() => {
                setGenderFilter('All');
                setCityFilter('All');
                setMaritalFilter('All');
                setQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProfiles.map((profile) => (
              <article
                key={profile.id}
                className="bg-white border border-[#E7E2DA] rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div>
                  <div className="aspect-[4/4.3] w-full overflow-hidden bg-[#F3EFE9] border-b border-[#E7E2DA]">
                    <ProfilePhoto
                      src={profile.photoUrl}
                      name={profile.fullName}
                      gender={profile.gender}
                      city={profile.city}
                      hidePhoto={profile.hidePhoto}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="p-5">
                    {/* Clean unboxed metadata line */}
                    <div className="flex items-center gap-2 text-xs text-[#5C574F] mb-1.5 tabular-nums">
                      <span className="font-mono font-medium text-[#0F5C4D]">{profile.refCode}</span>
                      <span aria-hidden="true">·</span>
                      <span>{profile.gender}</span>
                      <span aria-hidden="true">·</span>
                      <span>{profile.age} yrs</span>
                      <span aria-hidden="true">·</span>
                      <span>{profile.city}</span>
                    </div>

                    <h3 className="font-display text-2xl font-semibold text-[#1A1917] leading-snug mb-2">
                      {profile.fullName}
                    </h3>

                    <p className="text-sm font-medium text-[#1A1917] mb-1 truncate">
                      {profile.profession}
                    </p>
                    <p className="text-xs text-[#5C574F] mb-3 truncate">
                      {profile.education}
                    </p>

                    <div className="pt-3 border-t border-[#EFEAE2] grid grid-cols-2 gap-y-1.5 text-xs text-[#5C574F]">
                      <div>
                        <span className="text-[#8C857B]">Marital: </span>
                        <span className="text-[#1A1917] font-medium">{profile.maritalStatus}</span>
                      </div>
                      <div>
                        <span className="text-[#8C857B]">Height: </span>
                        <span className="text-[#1A1917] font-medium tabular-nums">{profile.height}</span>
                      </div>
                      <div>
                        <span className="text-[#8C857B]">Caste: </span>
                        <span className="text-[#1A1917] font-medium">{profile.caste}</span>
                      </div>
                      <div>
                        <span className="text-[#8C857B]">Family: </span>
                        <span className="text-[#1A1917] font-medium">{profile.familyType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectProfile(profile)}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-[#0F5C4D] bg-[#F3EFE9] hover:bg-[#0F5C4D] hover:text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    View Biodata & Contact Family
                  </button>
                </div>
              </article>
            ))}
            </div>

            <PaginationBar
              currentPage={safePage}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              itemLabel="profiles"
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </section>
  );
}
