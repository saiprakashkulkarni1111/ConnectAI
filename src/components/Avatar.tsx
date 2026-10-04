import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'away' | 'offline';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src && !imgError ? (
        <img
          src={src}
          alt={`${name} avatar`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover border border-slate-700/60 bg-slate-800`}
        />
      ) : (
        <div
          aria-label={name}
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-blue-600 to-indigo-700 border border-slate-700/60 select-none`}
        >
          {initials || 'CA'}
        </div>
      )}
      {status && (
        <span
          title={`Status: ${status}`}
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-slate-950 ${
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'
          } ${
            status === 'online'
              ? 'bg-emerald-500'
              : status === 'away'
              ? 'bg-amber-500'
              : 'bg-slate-500'
          }`}
        />
      )}
    </div>
  );
};
