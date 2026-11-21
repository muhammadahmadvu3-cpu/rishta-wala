import { useState, type FormEvent } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { formatWhatsappHref, trackReferenceStatus } from '../lib/api';
import type { PublicBureauSettings, TrackStatusResponse } from '../types';

interface TrackStatusSectionProps {
  settings: PublicBureauSettings;
}

export function TrackStatusSection({ settings }: TrackStatusSectionProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackStatusResponse | null>(null);

  const runLookup = async (targetCode: string) => {
    const trimmed = targetCode.trim();
    if (!trimmed) return;
    setCode(trimmed);
    setError('');
    setLoading(true);
    try {
      const data = await trackReferenceStatus(trimmed);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Reference not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runLookup(code);
  };

  return (
    <section id="track-status" className="py-14 bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E7E2DA] rounded-xl p-6 sm:p-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold text-[#0F5C4D] mb-2">
              03. Live Verification Lookup
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#1A1917] tracking-tight">
              Track Profile Upload Approval Status
            </h2>
            <p className="text-sm text-[#5C574F] mt-2">
              Enter your Profile ID (e.g. <span className="font-mono text-[#1A1917]">NR-1001</span>) or
              Inquiry ID (e.g. <span className="font-mono text-[#1A1917]">REQ-5001</span>) to
              check your one-time {settings.currency} {settings.feePerProfile} profile upload
              confirmation status.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-[#787166] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter Reference ID (NR-1001 or REQ-5001)"
                aria-label="Reference ID"
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg text-[#1A1917] focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#5C574F]">
            <span>Sample IDs:</span>
            <button
              type="button"
              onClick={() => runLookup('NR-1006')}
              className="font-mono text-[#0F5C4D] hover:underline cursor-pointer"
            >
              NR-1006 (Pending)
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => runLookup('REQ-5001')}
              className="font-mono text-[#0F5C4D] hover:underline cursor-pointer"
            >
              REQ-5001 (Unlocked Contact)
            </button>
          </div>

          {error && (
            <div className="mt-5 p-3.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-5 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#0F5C4D]">
                    {result.refCode}
                  </span>
                  <h3 className="font-display text-2xl font-semibold text-[#1A1917]">
                    {result.title}
                  </h3>
                  <p className="text-xs text-[#5C574F]">{result.subtitle}</p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-[#5C574F]">Status</div>
                  <div
                    className={`text-sm font-semibold ${
                      result.paymentConfirmed ? 'text-[#0F5C4D]' : 'text-[#B45309]'
                    }`}
                  >
                    {result.paymentConfirmed
                      ? `Confirmed (${settings.currency} ${result.feeAmount} Verified)`
                      : `Pending WhatsApp Confirmation (${settings.currency} ${result.feeAmount})`}
                  </div>
                </div>
              </div>

              {result.unlockedContact ? (
                <div className="p-4 bg-white border border-[#0F5C4D]/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#0F5C4D]">
                      Guardian Contact Unlocked
                    </div>
                    <div className="text-sm font-semibold text-[#1A1917] mt-0.5">
                      {result.unlockedContact.guardianName}
                    </div>
                    <div className="font-mono text-base font-medium text-[#1A1917] mt-0.5 tabular-nums">
                      {result.unlockedContact.guardianPhone}
                    </div>
                  </div>
                  <a
                    href={formatWhatsappHref(
                      result.unlockedContact.guardianPhone.replace(/^0/, '92'),
                      `Assalam-o-Alaikum ${result.unlockedContact.guardianName}, we received your contact via ${settings.bureauName} for profile ${result.unlockedContact.profileRefCode}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Message Guardian</span>
                  </a>
                </div>
              ) : !result.paymentConfirmed ? (
                <div className="pt-3 border-t border-[#E7E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-[#5C574F]">
                    Send {settings.currency} {result.feeAmount} and share reference{' '}
                    <span className="font-mono font-semibold text-[#1A1917]">{result.refCode}</span> on
                    WhatsApp {settings.whatsappNumber}.
                  </p>
                  <a
                    href={formatWhatsappHref(
                      settings.whatsappIntl,
                      `Assalam-o-Alaikum ${settings.bureauName}, confirming ${settings.currency} ${result.feeAmount} payment for Reference ID ${result.refCode}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Confirm on WhatsApp ({settings.whatsappNumber})</span>
                  </a>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
