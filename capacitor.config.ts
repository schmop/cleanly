import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'de.schmoppo.cleanly',
    appName: 'cleanly',
    server: {
        hostname: 'deeplink.cleanly.schmoppo.de',
        androidScheme: 'https',
    },
    webDir: 'dist',
    plugins: {
        Keyboard: {
            resizeOnFullScreen: true,
        },
        StatusBar: {
            overlaysWebView: false,
        },
        PushNotifications: {
            presentationOptions: ["badge", "sound", "alert"]
        },
        // Replaces android.adjustMarginsForEdgeToEdge, which Capacitor 8 dropped. Insets now
        // arrive as --safe-area-inset-* CSS variables, which Ionic's --ion-safe-area-* read.
        SystemBars: {
            insetsHandling: 'css',
        },
    },
};
if (process.env.NODE_ENV === 'development') {
    config.server = {
        hostname: 'deeplink.cleanly.schmoppo.de',
        cleartext: true,
        androidScheme: 'http',
    };
}

export default config;
