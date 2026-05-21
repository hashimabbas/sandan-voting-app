import { usePage } from '@inertiajs/react';

type ZiggyRoutes = {
    [key: string]: { uri: string };
};

export default function useRoute() {
    const { props } = usePage<{ ziggy?: { routes: ZiggyRoutes } }>();

    const route = (name: string, params?: Record<string, any>, absolute = false): string => {
        if (!props.ziggy || !props.ziggy.routes || !props.ziggy.routes[name]) {
            console.warn(`Route "${name}" not found in Ziggy data.`);
            return `#`;
        }

        let url = props.ziggy.routes[name].uri;

        if (params) {
            for (const key in params) {
                url = url.replace(`:${key}`, params[key]);
            }
        }

        if (absolute) {
            return `${window.location.origin}/${url}`;
        }

        return `/${url}`;
    };

    return route;
}
