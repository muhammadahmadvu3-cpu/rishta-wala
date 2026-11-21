import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { createAdminProfile, updateAdminProfile } from '../lib/api';
import type {
  BureauSettings,
  BureauStats,
  MaritalStatus,
  MatrimonialProfile,
  ProfileGender,
  ProfileStatus,
} from '../types';

interface AdminProfileFormModalProps {
  profile: MatrimonialProfile | null;
  settings: BureauSettings;
  onClose: () => void;
  onSaved: (profile: MatrimonialProfile, stats: BureauStats, isNew: boolean) => void;
}

const PORTRAIT_PRESETS = [
  { label: 'No Photo (Monogram)', value: '' },
  {
    label: 'Bride Portrait 01',
    value: '/src/assets/images/profile_bride_ayesha_1795159529319.jpg',
  },
  {
    label: 'Bride Portrait 02',
    value: '/src/assets/images/profile_bride_zainab_1795159529203.jpg',
  },
  {
    label: 'Groom Portrait 01',
    value: '/src/assets/images/profile_groom_hamza_1795159529196.jpg',
  },
  {
    label: 'Groom Portrait 02',
    value: '/src/assets/images/profile_groom_usman_1795159528459.jpg',
  },
];

export function AdminProfileFormModal({
  profile,
  settings,
  onClose,
  onSaved,
}: AdminProfileFormModalProps) {
  const isEdit = Boolean(profile);
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [gender, setGender] = useState<ProfileGender>(profile?.gender || 'Bride');
  const [age, setAge] = useState(String(profile?.age || 25));
  const [height, setHeight] = useState(profile?.height || '5 ft 5 in');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(
    profile?.maritalStatus || 'Never Married'
  );
  const [city, setCity] = useState(profile?.city || '');
  const [country, setCountry] = useState(profile?.country || 'Pakistan');
  const [education, setEducation] = useState(profile?.education || '');
  const [profession, setProfession] = useState(profile?.profession || '');
  const [monthlyIncome, setMonthlyIncome] = useState(profile?.monthlyIncome || '');
  const [sect, setSect] = useState(profile?.sect || 'Sunni');
  const [caste, setCaste] = useState(profile?.caste || '');
  const [familyType, setFamilyType] = useState<'Nuclear' | 'Joint'>(
    profile?.familyType || 'Nuclear'
  );
  const [fatherProfession, setFatherProfession] = useState(profile?.fatherProfession || '');
  const [siblings, setSiblings] = useState(profile?.siblings || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [partnerPreference, setPartnerPreference] = useState(profile?.partnerPreference || '');
  const [guardianName, setGuardianName] = useState(profile?.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(profile?.guardianPhone || '');
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl || '');
  const [hidePhoto, setHidePhoto] = useState<boolean>(Boolean(profile?.hidePhoto));
  const [status, setStatus] = useState<ProfileStatus>(profile?.status || 'approved');
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(
    profile?.paymentConfirmed ?? true
  );
  const [feeAmount, setFeeAmount] = useState(String(profile?.feeAmount ?? settings.feePerProfile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 480;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPhotoUrl(canvas.toDataURL('image/jpeg', 0.78));
        }
      };
      if (typeof reader.result === 'string') img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        fullName,
        gender,
        age: Number(age),
        height,
        maritalStatus,
        city,
        country,
        education,
        profession,
        monthlyIncome,
        sect,
        caste,
        familyType,
        fatherProfession,
        siblings,
        bio,
        partnerPreference,
        guardianName,
        guardianPhone,
        photoUrl,
        hidePhoto,
        status,
        paymentConfirmed,
        feeAmount: Number(feeAmount),
      };

      if (profile) {
        const res = await updateAdminProfile(profile.id, payload);
        onSaved(res.profile, res.stats, false);
      } else {
        const res = await createAdminProfile(payload);
        onSaved(res.profile, res.stats, true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-profile-modal-title"
    >
      <div className="bg-white border border-[#E7E2DA] rounded-xl max-w-3xl w-full my-8 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-[#E7E2DA] bg-[#FAF8F5] flex items-center justify-between">
          <div>
            <h2 id="admin-profile-modal-title" className="font-display text-2xl font-semibold text-[#1A1917]">
              {isEdit ? `Edit Profile · ${profile?.refCode}` : 'Add New Matrimonial Profile'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-[#E7E2DA] text-[#5C574F] hover:text-[#1A1917] hover:bg-white cursor-pointer"
            aria-label="Close profile editor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Approval & Rs. 100 Confirmation Strip */}
          <div className="p-4 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">
                Listing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProfileStatus)}
                className="w-full px-3 py-1.5 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              >
                <option value="approved">Approved & Live</option>
                <option value="pending_whatsapp">Pending WhatsApp</option>
                <option value="archived">Archived / Matched</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">
                Fee Amount ({settings.currency})
              </label>
              <input
                type="number"
                min={0}
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="w-full px-3 py-1.5 text-sm font-mono bg-white border border-[#D8D1C5] rounded-lg tabular-nums focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <label className="flex items-center gap-2.5 pt-4 sm:pt-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={paymentConfirmed}
                onChange={(e) => setPaymentConfirmed(e.target.checked)}
                className="w-4 h-4 accent-[#0F5C4D]"
              />
              <span className="text-xs font-semibold text-[#1A1917]">
                {settings.currency} {feeAmount} Confirmed on WhatsApp
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as ProfileGender)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              >
                <option value="Bride">Bride</option>
                <option value="Groom">Groom</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Age *</label>
              <input
                type="number"
                min={18}
                max={70}
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg tabular-nums focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Marital Status</label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              >
                <option value="Never Married">Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Khula">Khula</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Education *</label>
              <input
                type="text"
                required
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Profession *</label>
              <input
                type="text"
                required
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Monthly Income</label>
              <input
                type="text"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Sect</label>
              <input
                type="text"
                value={sect}
                onChange={(e) => setSect(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Caste</label>
              <input
                type="text"
                value={caste}
                onChange={(e) => setCaste(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Family Type</label>
              <select
                value={familyType}
                onChange={(e) => setFamilyType(e.target.value as 'Nuclear' | 'Joint')}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              >
                <option value="Nuclear">Nuclear</option>
                <option value="Joint">Joint</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">
                Father&apos;s Profession
              </label>
              <input
                type="text"
                value={fatherProfession}
                onChange={(e) => setFatherProfession(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Siblings</label>
              <input
                type="text"
                value={siblings}
                onChange={(e) => setSiblings(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Guardian Name *</label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Guardian Phone *</label>
              <input
                type="text"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1A1917] mb-1">
                Partner Preferences
              </label>
              <textarea
                rows={2}
                value={partnerPreference}
                onChange={(e) => setPartnerPreference(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7E2DA] space-y-3">
            {photoUrl && (
              <div className="flex items-center justify-between gap-3 p-3 bg-[#FAF8F5] border border-[#E7E2DA] rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={photoUrl}
                    alt={`${fullName || 'Candidate'} matchmaking preview`}
                    referrerPolicy="no-referrer"
                    className="w-14 h-18 object-cover rounded border border-[#D8D1C5] shrink-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-[#1A1917]">
                      {hidePhoto
                        ? 'Private Photo — Admin Matchmaking View Only'
                        : 'Public Profile Photo'}
                    </div>
                    <p className="text-[11px] text-[#5C574F] mt-0.5">
                      {hidePhoto
                        ? 'Hidden on the public website. Only Admin can view this photo for matchmaking.'
                        : 'Visible to public visitors once the profile is approved.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="px-2.5 py-1.5 text-[11px] font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer shrink-0"
                >
                  Clear Photo
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={PORTRAIT_PRESETS.some((p) => p.value === photoUrl) ? photoUrl : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') setPhotoUrl(e.target.value);
                  }}
                  aria-label="Portrait preset"
                  className="px-3 py-2 text-xs bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                >
                  {PORTRAIT_PRESETS.map((p) => (
                    <option key={p.label} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                  {!PORTRAIT_PRESETS.some((p) => p.value === photoUrl) && (
                    <option value="custom">Uploaded Custom Photo</option>
                  )}
                </select>
                <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1A1917] bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg hover:bg-[#F3EFE9] cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-[#0F5C4D]" aria-hidden="true" />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="sr-only" />
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1A1917] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hidePhoto}
                    onChange={(e) => setHidePhoto(e.target.checked)}
                    className="w-4 h-4 accent-[#0F5C4D]"
                  />
                  <span>Hide Picture from Public (Admin Only)</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-[#5C574F] hover:text-[#1A1917] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] disabled:opacity-60 cursor-pointer"
                >
                  {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Profile'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
