import React from 'react';
import { cn } from '@/lib/utils';

interface OmaniEmblemProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function OmaniEmblem({ className, size = 'md' }: OmaniEmblemProps) {
    const sizeClasses = {
        sm: 'w-12 h-14',
        md: 'w-16 h-20',
        lg: 'w-24 h-28',
        xl: 'w-32 h-36'
    };

    return (
        <svg
            viewBox="0 0 120 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(sizeClasses[size], className)}
        >
            {/* Crossed Swords */}
            <path
                d="M 60 15 L 20 85 L 28 90 L 65 25 Z"
                fill="#C8102E"
                stroke="#8B0000"
                strokeWidth="0.5"
            />
            <path
                d="M 60 15 L 100 85 L 92 90 L 55 25 Z"
                fill="#C8102E"
                stroke="#8B0000"
                strokeWidth="0.5"
            />
            {/* Sword hilts */}
            <rect x="16" y="78" width="16" height="6" rx="1.5" fill="#8B4513" stroke="#5C2E00" strokeWidth="0.3" />
            <rect x="88" y="78" width="16" height="6" rx="1.5" fill="#8B4513" stroke="#5C2E00" strokeWidth="0.3" />
            {/* Sword handle wraps */}
            <rect x="18" y="84" width="12" height="10" rx="1" fill="#654321" />
            <rect x="90" y="84" width="12" height="10" rx="1" fill="#654321" />
            {/* Sword pommels */}
            <circle cx="24" cy="96" r="3.5" fill="#C8102E" stroke="#8B0000" strokeWidth="0.5" />
            <circle cx="96" cy="96" r="3.5" fill="#C8102E" stroke="#8B0000" strokeWidth="0.5" />

            {/* Khanjar (curved dagger) */}
            <path
                d="M 52 20 
                    Q 30 45 32 75 
                    Q 33 88 42 98 
                    Q 50 106 60 108 
                    Q 70 106 78 98 
                    Q 87 88 88 75 
                    Q 90 45 68 20 
                    L 65 25 
                    Q 45 45 46 70 
                    Q 47 85 55 95 
                    Q 60 100 60 100 
                    Q 60 100 65 95 
                    Q 73 85 74 70 
                    Q 75 45 55 25 Z"
                fill="#C8102E"
                stroke="#8B0000"
                strokeWidth="0.5"
            />
            {/* Khanjar inner decorative line */}
            <path
                d="M 52 22 
                    Q 32 47 34 75 
                    Q 35 87 43 96 
                    Q 50 103 60 105 
                    Q 60 105 60 105"
                fill="none"
                stroke="#FFD700"
                strokeWidth="0.8"
                opacity="0.6"
            />

            {/* Belt/sheath band */}
            <rect x="38" y="104" width="44" height="6" rx="2" fill="#654321" stroke="#4A2F00" strokeWidth="0.5" />
            <rect x="38" y="110" width="44" height="5" rx="2" fill="#8B4513" stroke="#5C2E00" strokeWidth="0.3" />
            
            {/* Belt buckle */}
            <rect x="52" y="106" width="16" height="8" rx="2" fill="#FFD700" stroke="#B8860B" strokeWidth="0.5" />
            <circle cx="60" cy="110" r="2.5" fill="#C8102E" />

            {/* Decorative stars */}
            <circle cx="42" cy="112" r="1" fill="#FFD700" opacity="0.8" />
            <circle cx="78" cy="112" r="1" fill="#FFD700" opacity="0.8" />

            {/* Swords blade accents */}
            <line x1="60" y1="20" x2="25" y2="78" stroke="#FFD700" strokeWidth="0.3" opacity="0.4" />
            <line x1="60" y1="20" x2="95" y2="78" stroke="#FFD700" strokeWidth="0.3" opacity="0.4" />
        </svg>
    );
}
