<template>
  <div id="app">
    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import "./assets/styles/styles.css";

@Component({})
export default class App extends Vue {
  get layout() {
    // @ts-ignore
    return (this.$route.meta.layout || "default") + "-layout";
  }
}
</script>
