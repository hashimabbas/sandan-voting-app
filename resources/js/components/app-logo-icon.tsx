import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex items-center justify-center", className)} {...props}>
            <img src="/logo-transparent.png" alt="Sandan" className="w-full h-full object-contain" />
        </div>
    );
}
