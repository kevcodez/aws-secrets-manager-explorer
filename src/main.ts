import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faClipboard,
  faKey,
  faInfoCircle,
  faPlus,
  faTrash,
  faStar
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import dayjs from "dayjs";
import Toasted from "vue-toasted";

Vue.use(Toasted);

library.add(faClipboard, faKey, faInfoCircle, faStar, faPlus, faTrash);

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

Vue.filter("dayjs", (str, pattern) => dayjs(str).format(pattern));

new Vue({
  // @ts-ignore
  router,
  render: h => h(App)
}).$mount("#app");
