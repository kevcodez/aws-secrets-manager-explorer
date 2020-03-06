import Vue from "vue";
import VueRouter from "vue-router";
import SecretsList from "../views/SecretsList.vue";
import Secret from "../views/Secret.vue";
import Profiles from "../views/Profiles.vue";
import About from "../views/About.vue";

Vue.use(VueRouter);

const routes = [
  {
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
  },
  {
    path: "/about",
    name: "About",
    component: About,
    meta: {
      layout: "empty"
    }
  }
];

const router = new VueRouter({
  mode: "hash",
  routes
});

export default router;
