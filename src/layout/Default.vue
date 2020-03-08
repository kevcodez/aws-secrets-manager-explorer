<template>
  <div class="h-full">
    <div class="float-right">
      <ActiveProfile class="inline-block mr-4" />
      <router-link
        class="font-bold rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap inline-block mr-4"
        to="/profiles"
      >
        <font-awesome-icon icon="cog" />
      </router-link>
    </div>

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
