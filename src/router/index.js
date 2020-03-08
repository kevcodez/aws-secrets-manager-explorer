import Vue from "vue";
import VueRouter from "vue-router";
import SecretListView from "@/views/SecretListView.vue";
import SecretView from "@/views/SecretView.vue";
import ProfilesView from "@/views/ProfilesView.vue";
import AboutView from "@/views/AboutView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "SecretListView",
    component: SecretListView
  },
  {
    path: "/profiles",
    name: "ProfilesView",
    component: ProfilesView,
    meta: {
      layout: "empty"
    }
  },
  {
    path: "/secret/:arn",
    name: "SecretView",
    component: SecretView
  },
  {
    path: "/about",
    name: "AboutView",
    component: AboutView,
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
