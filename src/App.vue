<template>
  <div id="app">
    <ActiveProfile />

    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import "./assets/styles/styles.css";
import ActiveProfile from "@/components/ActiveProfile.vue";

@Component({
  components: {
    ActiveProfile
  }
})
export default class App extends Vue {}
</script>
