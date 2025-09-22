import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'io.ionic.starter',
    appName: 'cleanly',
    webDir: 'dist',
    bundledWebRuntime: false,
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
    },
    android: {
        adjustMarginsForEdgeToEdge: "force",
    }
};
if (process.env.NODE_ENV === 'development') {
    config.server = {
        cleartext: true,
        androidScheme: 'http',
    };
}

export default config;
