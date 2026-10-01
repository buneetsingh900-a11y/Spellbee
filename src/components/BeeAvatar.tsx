import React from 'react';

interface BeeAvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showAnimation?: boolean;
}

export const AVATAR_OPTIONS = [
  { id: 'bee-worker', name: 'Buzzy Worker', role: 'Hardworking Spell Bee', icon: '🐝' },
  { id: 'bee-scholar', name: 'Scholar Bee', role: 'Grammar & Book Lover', icon: '🎓' },
  { id: 'bee-detective', name: 'Detective Bee', role: 'Error Spotting Ace', icon: '🔍' },
  { id: 'bee-queen', name: 'Queen Bee', role: 'Royal Spelling Champion', icon: '👑' },
  { id: 'bee-astronaut', name: 'Astro Bee', role: 'Cosmic Word Explorer', icon: '🚀' },
];

export const BeeAvatar: React.FC<BeeAvatarProps> = ({
  avatarId,
  size = 'md',
  className = '',
  showAnimation = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const animClass = showAnimation ? 'animate-float-slow' : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-amber-100/90 border border-amber-300 shadow-sm p-1.5 overflow-visible select-none shrink-0 ${sizeMap[size]} ${animClass} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Wing Back */}
        <ellipse
          cx="28"
          cy="36"
          rx="18"
          ry="26"
          transform="rotate(-25 28 36)"
          fill="#BAE6FD"
          fillOpacity="0.85"
          stroke="#0284C7"
          strokeWidth="2.5"
        />
        <ellipse
          cx="72"
          cy="36"
          rx="18"
          ry="26"
          transform="rotate(25 72 36)"
          fill="#BAE6FD"
          fillOpacity="0.85"
          stroke="#0284C7"
          strokeWidth="2.5"
        />

        {/* Bee Body (Chubby Oval) */}
        <ellipse cx="50" cy="56" rx="32" ry="36" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />

        {/* Bee Stripes */}
        <path
          d="M22 48 Q50 56 78 48"
          stroke="#1E293B"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M20 62 Q50 70 80 62"
          stroke="#1E293B"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <path
          d="M26 76 Q50 82 74 76"
          stroke="#1E293B"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Rosy Cheeks */}
        <ellipse cx="36" cy="46" rx="4.5" ry="3" fill="#F43F5E" fillOpacity="0.5" />
        <ellipse cx="64" cy="46" rx="4.5" ry="3" fill="#F43F5E" fillOpacity="0.5" />

        {/* Cute Big Eyes */}
        <circle cx="39" cy="38" r="4.5" fill="#0F172A" />
        <circle cx="61" cy="38" r="4.5" fill="#0F172A" />
        <circle cx="40.5" cy="36.5" r="1.5" fill="#FFFFFF" />
        <circle cx="62.5" cy="36.5" r="1.5" fill="#FFFFFF" />

        {/* Happy Smile */}
        <path
          d="M44 45 Q50 52 56 45"
          stroke="#0F172A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Antennae */}
        <path
          d="M42 22 Q38 12 30 14"
          stroke="#1E293B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="29" cy="14" r="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />

        <path
          d="M58 22 Q62 12 70 14"
          stroke="#1E293B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="71" cy="14" r="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />

        {/* Custom Avatar Accessories */}
        {avatarId === 'bee-queen' && (
          <g>
            <path
              d="M36 21 L43 12 L50 18 L57 12 L64 21 Z"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="2"
            />
            <circle cx="50" cy="14" r="2" fill="#E11D48" />
          </g>
        )}

        {avatarId === 'bee-scholar' && (
          <g>
            {/* Glasses */}
            <circle cx="39" cy="38" r="7" stroke="#475569" strokeWidth="1.8" fill="none" />
            <circle cx="61" cy="38" r="7" stroke="#475569" strokeWidth="1.8" fill="none" />
            <path d="M46 38 L54 38" stroke="#475569" strokeWidth="1.8" />
            {/* Grad Cap */}
            <path d="M30 16 L50 8 L70 16 L50 22 Z" fill="#1E293B" />
            <path d="M66 17 L69 26" stroke="#F59E0B" strokeWidth="1.5" />
          </g>
        )}

        {avatarId === 'bee-detective' && (
          <g>
            {/* Detective Hat */}
            <path
              d="M32 20 Q50 10 68 20 Q50 15 32 20 Z"
              fill="#92400E"
              stroke="#78350F"
              strokeWidth="1.5"
            />
            <ellipse cx="50" cy="19" rx="16" ry="6" fill="#B45309" />
          </g>
        )}

        {avatarId === 'bee-astronaut' && (
          <g>
            {/* Bubble Visor */}
            <circle
              cx="50"
              cy="42"
              r="28"
              stroke="#38BDF8"
              strokeWidth="2.5"
              fill="#38BDF8"
              fillOpacity="0.2"
            />
            <path
              d="M62 26 Q72 35 68 46"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
