import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/display.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/float-elements.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/typography.css';
import { createApp } from 'vue'
import App from './App.vue'
import { container } from './dependency-injection/container';
import router from './router';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
    .use(IonicVue)
    .use(router)
    .use(container.getStore())
    .use(container);

router.isReady()
    .then(() => app.mount('#app'))
    .catch((err) => console.error("Error starting vue router!", err));
