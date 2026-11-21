import { useState } from 'react';
import { EyeOff, UserCheck } from 'lucide-react';
import type { ProfileGender } from '../types';

interface ProfilePhotoProps {
  src: string;
  name: string;
  gender: ProfileGender;
  city: string;
  hidePhoto?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name
    .replace(/^(Dr\.|Engr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, '')
    .trim()
    .split(/\s+/);
  if (parts.length === 0) return 'NR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ProfilePhoto({
  src,
  name,
  gender,
  city,
  hidePhoto = false,
  className = '',
}: ProfilePhotoProps) {
  const [failed, setFailed] = useState(false);

  if (hidePhoto || !src || failed) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-[#F3EFE9] via-[#EAE3D7] to-[#E2D9C8] text-[#1A1917] select-none px-4 text-center ${className}`}
        aria-label={hidePhoto ? `${name} photo hidden for privacy` : `${name} portrait placeholder`}
      >
        <div className="w-16 h-16 rounded-full border border-[#B08943]/35 bg-[#FAF8F5] flex items-center justify-center mb-3">
          <span className="font-display text-2xl font-semibold tracking-wide text-[#0F5C4D]">
            {getInitials(name)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#5C574F]">
          {hidePhoto ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-[#0F5C4D]" aria-hidden="true" />
              <span>Photo Hidden for Privacy</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 text-[#0F5C4D]" aria-hidden="true" />
              <span>Family Verified {gender}</span>
            </>
          )}
        </div>
        <span className="mt-1 text-[11px] text-[#787166]">
          {hidePhoto ? 'Shared privately on family contact' : city}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} — ${gender} matrimonial profile from ${city}`}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover object-top ${className}`}
    />
  );
}
