import React from 'react';
import { ChevronDown } from 'lucide-react'; // Example icon for expansion if you want it to be collapsible
import { cn } from '@/lib/utils'; // Assuming you have a utility for combining class names

interface SidebarMenuSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
    icon?: React.ElementType; // Lucide icon component
    children: React.ReactNode;
    defaultOpen?: boolean; // If you want to make sections collapsible
}

export function SidebarMenuSection({
    label,
    icon: Icon,
    children,
    defaultOpen = true,
    className,
    ...props
}: SidebarMenuSectionProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className={cn('space-y-1 py-2', className)} {...props}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors duration-200"
            >
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
                    <span>{label}</span>
                </div>
                {/* Optional: Add an expand/collapse icon */}
                {/* <ChevronDown className={cn('h-4 w-4 transform transition-transform duration-200', isOpen ? 'rotate-0' : '-rotate-90')} /> */}
            </button>
            {isOpen && (
                <div className="space-y-1">
                    {children}
                </div>
            )}
        </div>
    );
}
