import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'cleanly',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
  },
};
if (process.env.NODE_ENV === 'development') {
    config.server = {
        cleartext: true,
        androidScheme: 'http',
    };
}

export default config;
