export default {
    async fetch(request) {
        const url = new URL(request.url);
        const path = url.pathname;

        // Headers de seguridad y caché
        const headers = {
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        };

        // Servir archivos estáticos
        if (path === '/manifest.json') {
            return fetch('https://tamagotchi-1b6.pages.dev/manifest.json', {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).catch(() => {
                // Fallback: servir manifest.json desde el código
                const manifest = {
                    name: "Tamagotchi Ultimate",
                    short_name: "Tamagotchi",
                    description: "Mascota virtual con todas las mecánicas clásicas y modernas",
                    start_url: "/",
                    display: "standalone",
                    orientation: "portrait",
                    background_color: "#1a1a2e",
                    theme_color: "#1a1a2e"
                };
                return new Response(JSON.stringify(manifest), {
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    }
                });
            });
        }

        // API endpoints
        if (path.startsWith('/api/')) {
            return new Response(JSON.stringify({ 
                status: 'success',
                message: 'Tamagotchi API v1.0',
                timestamp: Date.now()
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache'
                }
            });
        }

        // Si es un asset estático, intentar servirlo
        if (path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|json)$/)) {
            const assetUrl = `https://tamagotchi-1b6.pages.dev${path}`;
            try {
                const response = await fetch(assetUrl);
                if (response.ok) {
                    return response;
                }
            } catch (e) {
                // Fall through to HTML
            }
        }

        // Fallback a index.html (SPA)
        try {
            const html = await fetch('https://tamagotchi-1b6.pages.dev/index.html');
            return html;
        } catch (e) {
            return new Response('Tamagotchi Ultimate - Página principal', {
                headers: {
                    ...headers,
                    'Content-Type': 'text/html'
                }
            });
        }
    }
};