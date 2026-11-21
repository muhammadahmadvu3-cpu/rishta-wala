import { useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { formatWhatsappHref } from '../lib/api';
import type { BureauStats, PublicBureauSettings } from '../types';

interface HeroSectionProps {
  settings: PublicBureauSettings;
  stats: BureauStats;
  onScrollToSubmit: () => void;
  onScrollToDirectory: () => void;
}

const HERO_IMAGE_URL = '/src/assets/images/hero_groom_bride_1795162956861.jpg';

export function HeroSection({
  settings,
  stats,
  onScrollToSubmit,
  onScrollToDirectory,
}: HeroSectionProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const directWaUrl = formatWhatsappHref(
    settings.whatsappIntl,
    `Assalam-o-Alaikum ${settings.bureauName}, I would like information about registering a rishta profile (${settings.currency} ${settings.feePerProfile} per profile).`
  );

  return (
    <section className="border-b border-[#E7E2DA] bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Copy Column */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#0F5C4D] mb-4">
                {settings.officeCity} · One-Time {settings.currency} {settings.feePerProfile} Profile Upload Fee
              </p>

              <h1
                className="font-display font-semibold text-[#1A1917] tracking-tight leading-[1.08] mb-5"
                style={{ fontSize: 'clamp(2.35rem, 4.2vw, 3.65rem)', textWrap: 'balance' }}
              >
                Dignified Family Matchmaking, Confirmed Once on WhatsApp.
              </h1>

              <p className="text-base text-[#5C574F] leading-relaxed max-w-xl mb-8">
                Pay a one-time fee of{' '}
                <strong className="font-semibold text-[#1A1917]">
                  {settings.currency} {settings.feePerProfile} once
                </strong>{' '}
                to upload your rishta profile (confirmed on WhatsApp{' '}
                <span className="font-mono font-medium text-[#1A1917] tabular-nums">
                  {settings.whatsappNumber}
                </span>
                ). Once live, families can view each other&apos;s profiles and contact each other
                directly at no extra cost.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onScrollToSubmit}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F5C4D]"
                >
                  <span>Submit Profile — {settings.currency} {settings.feePerProfile}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={onScrollToDirectory}
                  className="inline-flex items-center px-5 py-3 text-sm font-semibold text-[#1A1917] bg-white border border-[#D8D1C5] rounded-lg hover:bg-[#F3EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Browse Verified Rishtas
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E7E2DA] flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-[#5C574F]">
                Need instant assistance? Message our bureau desk directly:
              </div>
              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F5C4D] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span className="font-mono tabular-nums">WhatsApp {settings.whatsappNumber}</span>
              </a>
            </div>
          </div>

          {/* Right Editorial Photography Frame */}
          <div className="lg:col-span-6">
            <div className="relative h-72 sm:h-96 lg:h-full min-h-[340px] w-full rounded-xl overflow-hidden border border-[#E7E2DA] bg-[#EAE3D7]">
              {!heroImgFailed ? (
                <img
                  src={HERO_IMAGE_URL}
                  alt="Dignified Pakistani bride in emerald bridal attire and groom in ivory sherwani standing beneath floral wedding arches"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#F3EFE9] to-[#E2D9C8]">
                  <span className="font-display text-3xl font-semibold text-[#0F5C4D] mb-2">
                    {settings.bureauName}
                  </span>
                  <p className="text-sm text-[#5C574F] max-w-xs">
                    Respectful family introductions confirmed on WhatsApp {settings.whatsappNumber}
                  </p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-6">
                <p className="text-xs font-medium text-white/85">
                  Verified Matrimonial Desk · {settings.currency} {settings.feePerProfile} Standard Fee
                </p>
                <p className="font-display text-xl font-semibold text-white mt-0.5">
                  Direct Family Introductions Across Lahore, Islamabad, Karachi & Overseas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-column summary strip below hero split */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 border border-[#E7E2DA] rounded-xl bg-white divide-y lg:divide-y-0 lg:divide-x divide-[#E7E2DA]">
          <div className="p-5">
            <div className="text-xs font-medium text-[#5C574F]">Approved Profiles</div>
            <div className="mt-1 font-display text-3xl font-semibold text-[#1A1917] tabular-nums">
              {stats.approvedProfiles}
            </div>
            <div className="mt-0.5 text-xs text-[#787166]">Live & family-screened</div>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-[#5C574F]">One-Time Upload Fee</div>
            <div className="mt-1 font-display text-3xl font-semibold text-[#0F5C4D] tabular-nums">
              {settings.currency} {settings.feePerProfile}
            </div>
            <div className="mt-0.5 text-xs text-[#787166]">Paid once per profile</div>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-[#5C574F]">WhatsApp Confirmation</div>
            <div className="mt-1 font-mono text-xl sm:text-2xl font-medium text-[#1A1917] tabular-nums">
              {settings.whatsappNumber}
            </div>
            <div className="mt-0.5 text-xs text-[#787166]">EasyPaisa / JazzCash</div>
          </div>
          <div className="p-5">
            <div className="text-xs font-medium text-[#5C574F]">Client-to-Client Contact</div>
            <div className="mt-1 font-display text-3xl font-semibold text-[#1A1917]">
              Direct
            </div>
            <div className="mt-0.5 text-xs text-[#787166]">Free once profile is uploaded</div>
          </div>
        </div>
      </div>
    </section>
  );
}
