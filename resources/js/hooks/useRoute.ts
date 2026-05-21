import { usePage } from '@inertiajs/react';

type ZiggyRoutes = Record<string, { uri: string }>;

export default function useRoute() {
    const { props } = usePage<{ ziggy?: { routes: ZiggyRoutes } }>();

    return (name: string, params?: Record<string, string | number>) => {
        if (!props.ziggy?.routes?.[name]) {
            console.warn(`Route "${name}" not found in Ziggy data.`);
            return `/fallback/${name}`;
        }

        let url = props.ziggy.routes[name].uri;

        if (params) {
            for (const key in params) {
                url = url.replace(`:${key}`, encodeURIComponent(params[key]));
            }
        }

        return url;
    };
}
