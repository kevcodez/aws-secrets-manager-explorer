import Vue from "vue";
import VueRouter from "vue-router";
import SecretsList from "../views/SecretsList.vue";
import Secret from "../views/Secret.vue";
import Profiles from "../views/Profiles.vue";

Vue.use(VueRouter);

const routes = [{
    path: "/",
    name: "SecretsList",
    component: SecretsList
  },
  {
    path: "/profiles",
    name: "Profiles",
    component: Profiles
  },
  {
    path: "/secret/:arn",
    name: "Secret",
    component: Secret
  }
];

const router = new VueRouter({
  routes
});

export default router;