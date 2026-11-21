import { useState, type FormEvent } from 'react';
import { Check, Copy, MessageCircle, Phone, X } from 'lucide-react';
import { formatWhatsappHref, submitContactRequest } from '../lib/api';
import type { ContactRequest, MatrimonialProfile, PublicBureauSettings } from '../types';
import { ProfilePhoto } from './ProfilePhoto';

interface ProfileDetailModalProps {
  profile: MatrimonialProfile;
  settings: PublicBureauSettings;
  onClose: () => void;
}

export function ProfileDetailModal({ profile, settings, onClose }: ProfileDetailModalProps) {
  const [requesterName, setRequesterName] = useState('');
  const [requesterCity, setRequesterCity] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [relationToCandidate, setRelationToCandidate] = useState('Parents / Father / Mother');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState<{
    request: ContactRequest;
    whatsappUrl: string;
  } | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const guardianDigits = (profile.guardianPhone || '').replace(/[^\d]/g, '');
  const guardianWaIntl = guardianDigits.startsWith('0')
    ? `92${guardianDigits.slice(1)}`
    : guardianDigits || settings.whatsappIntl;

  const directGuardianWaUrl = formatWhatsappHref(
    guardianWaIntl,
    `Assalam-o-Alaikum ${profile.guardianName}, we viewed profile ${profile.refCode} (${profile.fullName}) on ${settings.bureauName} and would like to introduce our family.`
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await submitContactRequest({
        profileId: profile.id,
        requesterName,
        requesterCity,
        requesterPhone,
        relationToCandidate,
        message,
      });
      setCreatedResult({
        request: res.request,
        whatsappUrl: res.whatsappUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send introduction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPhone = async () => {
    if (!profile.guardianPhone) return;
    try {
      await navigator.clipboard.writeText(profile.guardianPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="bg-white border border-[#E7E2DA] rounded-xl max-w-4xl w-full my-8 overflow-hidden shadow-xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E7E2DA] bg-[#FAF8F5] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#5C574F]">
            <span className="font-mono font-semibold text-[#0F5C4D]">{profile.refCode}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.gender} Biodata</span>
            <span aria-hidden="true">·</span>
            <span>{profile.city}, {profile.country}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-[#E7E2DA] text-[#5C574F] hover:text-[#1A1917] hover:bg-white cursor-pointer"
            aria-label="Close biodata dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[82vh] overflow-y-auto">
          {/* Left Biodata Column */}
          <div className="lg:col-span-7 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-[#E7E2DA]">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-28 h-36 rounded-lg overflow-hidden border border-[#E7E2DA] bg-[#F3EFE9] shrink-0">
                <ProfilePhoto
                  src={profile.photoUrl}
                  name={profile.fullName}
                  gender={profile.gender}
                  city={profile.city}
                  hidePhoto={profile.hidePhoto}
                  className="w-full h-full"
                />
              </div>
              <div>
                <h2
                  id="profile-modal-title"
                  className="font-display text-3xl font-semibold text-[#1A1917] leading-tight"
                >
                  {profile.fullName}
                </h2>
                <p className="text-sm font-medium text-[#0F5C4D] mt-1">{profile.profession}</p>
                <p className="text-xs text-[#5C574F] mt-1">{profile.education}</p>
                <div className="mt-3 text-xs text-[#5C574F] flex flex-wrap gap-x-3 gap-y-1 tabular-nums">
                  <span>Age: <strong className="text-[#1A1917]">{profile.age} yrs</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Height: <strong className="text-[#1A1917]">{profile.height}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Status: <strong className="text-[#1A1917]">{profile.maritalStatus}</strong></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#EFEAE2] text-sm">
              <div>
                <div className="text-xs text-[#787166]">Sect / Caste</div>
                <div className="font-medium text-[#1A1917] mt-0.5">{profile.sect} · {profile.caste}</div>
              </div>
              <div>
                <div className="text-xs text-[#787166]">Monthly Income</div>
                <div className="font-medium text-[#1A1917] mt-0.5 tabular-nums">{profile.monthlyIncome}</div>
              </div>
              <div>
                <div className="text-xs text-[#787166]">Family Structure</div>
                <div className="font-medium text-[#1A1917] mt-0.5">{profile.familyType} Family</div>
              </div>
              <div>
                <div className="text-xs text-[#787166]">Father&apos;s Occupation</div>
                <div className="font-medium text-[#1A1917] mt-0.5">{profile.fatherProfession}</div>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-[#787166]">Siblings</div>
                <div className="font-medium text-[#1A1917] mt-0.5">{profile.siblings}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EFEAE2] space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-[#5C574F] mb-1">About Candidate & Family</h3>
                <p className="text-sm text-[#1A1917] leading-relaxed">{profile.bio}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#5C574F] mb-1">Partner Expectations</h3>
                <p className="text-sm text-[#1A1917] leading-relaxed">{profile.partnerPreference}</p>
              </div>
            </div>
          </div>

          {/* Right Direct Family Contact Column */}
          <div className="lg:col-span-5 p-6 bg-[#FAF8F5] space-y-5">
            {/* Direct Guardian Contact Box */}
            <div className="bg-white border border-[#E7E2DA] rounded-lg p-4 space-y-3">
              <div>
                <div className="text-xs font-semibold text-[#0F5C4D]">
                  Direct Family Contact (Free)
                </div>
                <div className="text-sm font-semibold text-[#1A1917] mt-1">
                  {profile.guardianName}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-base font-semibold text-[#1A1917] tabular-nums">
                    {profile.guardianPhone}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#0F5C4D] hover:underline cursor-pointer"
                  >
                    {copiedPhone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href={`tel:${profile.guardianPhone}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1A1917] bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg hover:bg-[#F3EFE9] transition-colors whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0F5C4D]" aria-hidden="true" />
                  <span>Call Family</span>
                </a>
                <a
                  href={directGuardianWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {createdResult ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#0F5C4D] mb-1">Introduction Sent</p>
                  <h3 className="font-display text-2xl font-semibold text-[#1A1917]">
                    Ready to Message Family
                  </h3>
                  <p className="text-xs text-[#5C574F] mt-1 leading-relaxed">
                    Your inquiry has been logged with Reference ID{' '}
                    <button
                      type="button"
                      onClick={() => handleCopyCode(createdResult.request.requestCode)}
                      className="inline-flex items-center gap-1 font-mono font-semibold text-[#0F5C4D] cursor-pointer"
                    >
                      <span>{createdResult.request.requestCode}</span>
                      {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                    . Send your introduction directly to {profile.guardianName} on WhatsApp:
                  </p>
                </div>

                <a
                  href={createdResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Open WhatsApp Chat with Family</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-[#E7E2DA]">
                <div>
                  <h3 className="font-display text-xl font-semibold text-[#1A1917]">
                    Send Family Introduction
                  </h3>
                  <p className="text-xs text-[#5C574F] mt-0.5">
                    Free direct inquiry — no fee required to contact families.
                  </p>
                </div>

                {error && (
                  <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#1A1917] mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="e.g. Muhammad Tariq"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Your City
                    </label>
                    <input
                      type="text"
                      required
                      value={requesterCity}
                      onChange={(e) => setRequesterCity(e.target.value)}
                      placeholder="e.g. Lahore"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      WhatsApp Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={requesterPhone}
                      onChange={(e) => setRequesterPhone(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1A1917] mb-1">
                    Relation to Candidate
                  </label>
                  <select
                    value={relationToCandidate}
                    onChange={(e) => setRelationToCandidate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                  >
                    <option value="Parents / Father / Mother">Parents / Father / Mother</option>
                    <option value="Brother / Sister">Brother / Sister</option>
                    <option value="Self">Self</option>
                    <option value="Uncle / Aunt / Elder">Uncle / Aunt / Elder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1A1917] mb-1">
                    Introduction Note
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share a short note about candidate's education, job, and family..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {submitting ? 'Sending...' : 'Send Introduction on WhatsApp (Free)'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
