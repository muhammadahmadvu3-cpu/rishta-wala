import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Check, Copy, EyeOff, MessageCircle, Trash2, Upload } from 'lucide-react';
import { submitPublicProfile } from '../lib/api';
import type { MaritalStatus, MatrimonialProfile, ProfileGender, PublicBureauSettings } from '../types';

interface SubmitProfileSectionProps {
  settings: PublicBureauSettings;
  onProfileSubmitted: () => void;
}

export function SubmitProfileSection({ settings, onProfileSubmitted }: SubmitProfileSectionProps) {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<ProfileGender>('Bride');
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('5 ft 5 in');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('Never Married');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [education, setEducation] = useState('');
  const [profession, setProfession] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [sect, setSect] = useState('Sunni');
  const [caste, setCaste] = useState('');
  const [familyType, setFamilyType] = useState<'Nuclear' | 'Joint'>('Nuclear');
  const [fatherProfession, setFatherProfession] = useState('');
  const [siblings, setSiblings] = useState('');
  const [bio, setBio] = useState('');
  const [partnerPreference, setPartnerPreference] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [hidePhoto, setHidePhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{
    profile: MatrimonialProfile;
    whatsappUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG or PNG).');
      return;
    }
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
          setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.78));
        }
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await submitPublicProfile({
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
        photoUrl: photoDataUrl,
        hidePhoto,
      });
      setReceipt({
        profile: res.profile,
        whatsappUrl: res.whatsappUrl,
      });
      onProfileSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setFullName('');
    setCity('');
    setEducation('');
    setProfession('');
    setMonthlyIncome('');
    setCaste('');
    setFatherProfession('');
    setSiblings('');
    setBio('');
    setPartnerPreference('');
    setGuardianName('');
    setGuardianPhone('');
    setPhotoDataUrl('');
    setHidePhoto(false);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <section id="submit-profile" className="py-14 lg:py-18 bg-white border-b border-[#E7E2DA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Process Explanation */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#0F5C4D] mb-2">
                02. Register a Rishta Profile
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-semibold text-[#1A1917] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                One-Time {settings.currency} {settings.feePerProfile} Profile Upload Fee
              </h2>
              <p className="mt-3 text-sm text-[#5C574F] leading-relaxed">
                {settings.paymentInstructions}
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-[#E7E2DA]">
              <div className="pt-3">
                <h3 className="text-sm font-semibold text-[#1A1917]">
                  01. Upload Family Biodata
                </h3>
                <p className="text-xs text-[#5C574F] mt-1 leading-relaxed">
                  Complete the form with accurate education, profession, family background, and
                  guardian phone number so interested families can connect directly.
                </p>
              </div>
              <div className="pt-3 border-t border-[#EFEAE2]">
                <h3 className="text-sm font-semibold text-[#1A1917]">
                  02. Pay {settings.currency} {settings.feePerProfile} Once Only
                </h3>
                <p className="text-xs text-[#5C574F] mt-1 leading-relaxed">
                  Transfer <strong className="text-[#1A1917]">{settings.currency} {settings.feePerProfile}</strong>{' '}
                  only one time via <span className="font-medium text-[#1A1917]">{settings.paymentChannel}</span>.
                </p>
              </div>
              <div className="pt-3 border-t border-[#EFEAE2]">
                <h3 className="text-sm font-semibold text-[#1A1917]">
                  03. Confirm on WhatsApp ({settings.whatsappNumber})
                </h3>
                <p className="text-xs text-[#5C574F] mt-1 leading-relaxed">
                  Send your Reference ID on WhatsApp once. After approval, your profile goes live
                  and families can view profiles and contact each other freely.
                </p>
              </div>
            </div>
          </div>

          {/* Right Form or Receipt */}
          <div className="lg:col-span-7">
            {receipt ? (
              <div className="bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl p-6 sm:p-8 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-[#0F5C4D] mb-1">
                    Profile Saved — Awaiting Rs. {settings.feePerProfile} WhatsApp Confirmation
                  </p>
                  <h3 className="font-display text-3xl font-semibold text-[#1A1917]">
                    Send Confirmation on WhatsApp
                  </h3>
                  <p className="text-sm text-[#5C574F] mt-2">
                    Your profile for <strong className="text-[#1A1917]">{receipt.profile.fullName}</strong> has
                    been recorded. To publish it live in the directory, please confirm the{' '}
                    <strong className="text-[#1A1917]">{settings.currency} {settings.feePerProfile}</strong> fee
                    on WhatsApp <span className="font-mono">{settings.whatsappNumber}</span>.
                  </p>
                </div>

                <div className="bg-white border border-[#E7E2DA] rounded-lg p-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C574F]">Profile Reference ID</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(receipt.profile.refCode)}
                      className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#0F5C4D] cursor-pointer"
                    >
                      <span>{receipt.profile.refCode}</span>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C574F]">Candidate</span>
                    <span className="font-medium text-[#1A1917]">
                      {receipt.profile.fullName} · {receipt.profile.gender}, {receipt.profile.age} yrs
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C574F]">Profile Listing Fee</span>
                    <span className="font-mono font-semibold text-[#1A1917] tabular-nums">
                      {settings.currency} {settings.feePerProfile}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5C574F]">Payment Account</span>
                    <span className="font-mono text-xs text-[#1A1917]">{settings.paymentChannel}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={receipt.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Confirm {settings.currency} {settings.feePerProfile} on WhatsApp ({settings.whatsappNumber})</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-3 text-sm font-medium text-[#1A1917] bg-white border border-[#D8D1C5] rounded-lg hover:bg-[#F3EFE9] transition-colors cursor-pointer"
                  >
                    Submit Another
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl p-6 sm:p-8 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-4">
                  <h3 className="font-display text-2xl font-semibold text-[#1A1917]">
                    Candidate Biodata Form
                  </h3>
                  <span className="font-mono text-xs font-medium text-[#0F5C4D] tabular-nums">
                    Fee: {settings.currency} {settings.feePerProfile}
                  </span>
                </div>

                {error && (
                  <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Candidate Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Maryam Khalid"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Profile Category *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as ProfileGender)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    >
                      <option value="Bride">Bride (Girl)</option>
                      <option value="Groom">Groom (Boy)</option>
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
                      placeholder="5 ft 5 in"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Marital Status
                    </label>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Lahore, Islamabad, Karachi"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Qualification / Degree *
                    </label>
                    <input
                      type="text"
                      required
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. BS Software Engineering"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Profession / Business *
                    </label>
                    <input
                      type="text"
                      required
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="e.g. Lecturer / Civil Engineer"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Monthly Income
                    </label>
                    <input
                      type="text"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="e.g. Rs. 200,000"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">Sect</label>
                    <input
                      type="text"
                      value={sect}
                      onChange={(e) => setSect(e.target.value)}
                      placeholder="e.g. Sunni"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">Caste</label>
                    <input
                      type="text"
                      value={caste}
                      onChange={(e) => setCaste(e.target.value)}
                      placeholder="e.g. Malik, Sheikh, Arain"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Family Type
                    </label>
                    <select
                      value={familyType}
                      onChange={(e) => setFamilyType(e.target.value as 'Nuclear' | 'Joint')}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    >
                      <option value="Nuclear">Nuclear</option>
                      <option value="Joint">Joint</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Father&apos;s Profession
                    </label>
                    <input
                      type="text"
                      value={fatherProfession}
                      onChange={(e) => setFatherProfession(e.target.value)}
                      placeholder="e.g. Govt Officer / Business"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">Siblings</label>
                    <input
                      type="text"
                      value={siblings}
                      onChange={(e) => setSiblings(e.target.value)}
                      placeholder="e.g. 2 Brothers, 1 Sister"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      About Candidate & Family
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Values, lifestyle, residence details..."
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Partner Expectations
                    </label>
                    <textarea
                      rows={2}
                      value={partnerPreference}
                      onChange={(e) => setPartnerPreference(e.target.value)}
                      placeholder="Preferred age, education, city..."
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                </div>

                {/* Guardian Contact & Photo */}
                <div className="pt-4 border-t border-[#E7E2DA] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Guardian Name (Private) *
                    </label>
                    <input
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Khalid Mehmood (Father)"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1A1917] mb-1">
                      Guardian WhatsApp Number (Private) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="03XX-XXXXXXX"
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D1C5] rounded-lg focus:outline-none focus:border-[#0F5C4D]"
                    />
                  </div>
                </div>

                {/* Photo Upload & Privacy Option */}
                <div className="p-4 bg-white border border-[#E7E2DA] rounded-lg space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-[#1A1917]">
                        Candidate Photo & Privacy
                      </div>
                      <p className="text-[11px] text-[#5C574F] mt-0.5">
                        Optional photo upload. Hidden photos are kept private from the public and
                        shown only to Admin for matchmaking.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#1A1917] bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg hover:bg-[#F3EFE9] cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-[#0F5C4D]" aria-hidden="true" />
                        <span>{photoDataUrl ? 'Change Photo' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="sr-only"
                        />
                      </label>
                      {photoDataUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoDataUrl('')}
                          className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer"
                          aria-label="Remove uploaded photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {photoDataUrl && (
                    <div className="flex items-center gap-3 pt-1">
                      <img
                        src={photoDataUrl}
                        alt="Uploaded candidate preview"
                        referrerPolicy="no-referrer"
                        className="w-12 h-14 object-cover rounded border border-[#E7E2DA]"
                      />
                      <span className="text-xs text-[#5C574F]">
                        {hidePhoto
                          ? 'Photo attached (Private — hidden on public site; visible only to Admin for matchmaking).'
                          : 'Photo attached and will be visible once approved.'}
                      </span>
                    </div>
                  )}

                  <label className="flex items-start gap-2.5 pt-2 border-t border-[#EFEAE2] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hidePhoto}
                      onChange={(e) => setHidePhoto(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#0F5C4D]"
                    />
                    <span className="text-xs text-[#1A1917]">
                      <span className="inline-flex items-center gap-1.5 font-semibold">
                        <EyeOff className="w-3.5 h-3.5 text-[#0F5C4D]" aria-hidden="true" />
                        Hide Picture for Privacy
                      </span>
                      <span className="block text-[11px] text-[#5C574F] mt-0.5">
                        Your photo will stay completely hidden on the public website (only initials
                        appear publicly). Only the Admin can view your photo privately to assist
                        with matchmaking.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-[#0F5C4D] rounded-lg hover:bg-[#0B473B] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {submitting
                      ? 'Submitting Profile...'
                      : `Submit Profile — ${settings.currency} ${settings.feePerProfile}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
