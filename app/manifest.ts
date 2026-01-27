import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Surgery Course',
        short_name: 'Surgery Course',
        description: 'Surgery Course Learning Management System by Haider Alaa',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0d9488',
        icons: [
            {
                src: '/app-icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    };
}
