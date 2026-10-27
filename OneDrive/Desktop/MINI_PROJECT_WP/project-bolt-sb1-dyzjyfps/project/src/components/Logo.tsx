interface LogoProps {
  className?: string;
}

export default function Logo({ className = 'w-10 h-10' }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tiffinGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#tiffinGrad)" />
      <path
        d="M16 28c0-8.8 7.2-16 16-16s16 7.2 16 16v2H16v-2z"
        fill="#FFF7ED"
        opacity="0.95"
      />
      <rect x="14" y="30" width="36" height="4" rx="2" fill="#FED7AA" />
      <rect x="16" y="34" width="32" height="18" rx="3" fill="#FFFFFF" opacity="0.95" />
      <circle cx="26" cy="43" r="3.5" fill="#F97316" />
      <circle cx="38" cy="43" r="3.5" fill="#16A34A" />
      <path d="M28 14c0-3 2-5 4-5s4 2 4 5" stroke="#FED7AA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}
