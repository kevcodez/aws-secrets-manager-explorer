<template>
  <div>
    <ActiveProfile />

    <slot />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ActiveProfile from "@/components/ActiveProfile.vue";

@Component({
  components: {
    ActiveProfile
  }
})
export default class Default extends Vue {}
</script>
