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
        <img
            src="/logo-transparent.png"
            alt="شعار سلطنة عمان"
            className={cn(sizeClasses[size], 'object-contain', className)}
        />
    );
}
