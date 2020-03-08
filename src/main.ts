import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faClipboard,
  faKey,
  faInfoCircle,
  faSyncAlt,
  faPlus,
  faTrash,
  faStar,
  faCog
} from "@fortawesome/free-solid-svg-icons";
import { faStar as starRegular } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import dayjs from "dayjs";
import Toasted from "vue-toasted";
import Default from "@/layout/Default.vue";
import Empty from "@/layout/Empty.vue";

Vue.use(Toasted);

library.add(
  faClipboard,
  faKey,
  faInfoCircle,
  faStar,
  starRegular,
  faPlus,
  faTrash,
  faSyncAlt,
  faCog
);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("default-layout", Default);
Vue.component("empty-layout", Empty);

Vue.config.productionTip = false;

Vue.filter("dayjs", (str, pattern) => dayjs(str).format(pattern));

new Vue({
  // @ts-ignore
  router,
  render: h => h(App)
}).$mount("#app");
