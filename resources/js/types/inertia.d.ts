import { Page as InertiaPage } from '@inertiajs/core';

// Define flash messages
export interface FlashMessages {
    success?: string;
    error?: string;
}

// Extend Inertia's page props
export interface PageProps {
    flash: FlashMessages;
    // You can add other global props you share from Laravel here
}

// Extend the Inertia Page type to include our PageProps
declare module '@inertiajs/core' {
    interface Page<SharedProps extends Record<string, unknown> = PageProps, RememberedState = unknown>
        extends InertiaPage<SharedProps, RememberedState> {}
}
