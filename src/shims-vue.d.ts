import VueRouter from "vue-router";
import Vue from "vue";

declare module "vue/types/vue" {
  interface Vue {
    $router: VueRouter;
  }
}

declare module "*.vue" {
  export default Vue;
}
