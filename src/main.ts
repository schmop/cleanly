import { InputChangeEventDetail, IonicVue } from '@ionic/vue';

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
import { ionicConfig } from "@/ionic-config";
import { Capacitor } from "@capacitor/core";
import { IonInputCustomEvent } from "@ionic/core";

const app = createApp(App)
    .use(IonicVue, ionicConfig)
    .use(router)
    .use(container.getStore())
    .use(container);

app.directive("autofillpatch", {
    mounted: (el) => {
        if (Capacitor.getPlatform() === "ios") {
            setTimeout(() => {
                try {
                    el.nativeElement.children[0].addEventListener("change", (e: IonInputCustomEvent<InputChangeEventDetail>) => {
                        el.nativeElement.value = e.target.value;
                    });
                } catch (e) {
                    console.error(e);
                }
            }, 100); // Need some time for the ion-input to create the input element
        }
    },
});

router.isReady()
    .then(() => app.mount('#app'))
    .catch((err) => console.error("Error starting vue router!", err));
