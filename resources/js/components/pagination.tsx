// resources/js/components/pagination.tsx
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

export function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) { // No pagination needed if less than 3 links (prev, 1, next)
        return null;
    }

    return (
        <nav className="flex justify-center mt-4">
            <ul className="flex items-center space-x-2">
                {links.map((link, index) => (
                    <li key={index}>
                        <Button
                            asChild
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            className={clsx({
                                'pointer-events-none opacity-50': !link.url, // Disable if no URL
                            })}
                        >
                            <Link href={link.url || '#'} dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
