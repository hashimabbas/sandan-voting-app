import React from 'react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
    className?: string;
    variant?: 'light' | 'dark' | 'auto';
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function AppLogo({ className, variant = 'auto', size = 'md' }: AppLogoProps) {
    const sizeClasses = {
        sm: 'h-8',
        md: 'h-12',
        lg: 'h-20',
        xl: 'h-32'
    };

    return (
        <div className={cn("flex items-center gap-3 group", className)}>
            <div className={cn(
                "relative flex items-center justify-center rounded-2xl transition-all duration-500",
                "bg-slate-100 p-2 group-hover:bg-slate-200"
            )}>
                <img 
                    src="/logo-transparent.png" 
                    alt="Sandan Logo" 
                    className={cn(
                        sizeClasses[size],
                        "w-auto object-contain transition-all duration-700 group-hover:scale-105"
                    )}
                />
            </div>
            {size !== 'sm' && (
                <div className="flex flex-col">
                    <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">SANDAN</span>
                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.2em] mt-1">Property Systems</span>
                </div>
            )}
        </div>
    );
}
