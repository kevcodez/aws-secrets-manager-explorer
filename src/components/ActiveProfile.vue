<template>
  <div class="mx-5">
    <div class="dropdown inline-block relative float-right">
      <button
        class="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded inline-flex items-center"
      >
        <span class="mr-1" v-if="activeProfile">{{ activeProfile.label }}</span>
        <svg
          class="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path
            d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
          />
        </svg>
      </button>
      <ul class="dropdown-menu absolute hidden text-gray-700 pt-1">
        <li
          class
          v-for="profile in profiles"
          :key="profile.label"
          v-if="!activeProfile || profile.label !== activeProfile.label"
        >
          <a
            class="rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
            @click="selectProfile(profile)"
            >{{ profile.label }}</a
          >
        </li>
        <li class="py-2 bg-gray-200">
          <div class="w-full border-b-2 border-gray-300"></div>
        </li>
        <li>
          <router-link
            class="font-bold rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap"
            to="/profiles"
            >Manage Profiles</router-link
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { profilesService } from "@/profiles/ProfilesService";
import { Profile } from "../profiles/Profile";
import store from "@/store";

@Component({})
export default class ActiveProfile extends Vue {
  activeProfile: Profile | null = profilesService.getActiveProfile();
  profiles: Profile[] = profilesService.getProfiles();
  unsubribeWatcher: any = null;

  mounted() {
    this.unsubribeWatcher = store.onDidChange(
      "profiles",
      (newValue, oldValue) => {
        this.profiles = newValue;
      }
    );
  }

  beforeDestroy() {
    this.unsubribeWatcher();
  }

  selectProfile(profile: Profile) {
    profilesService.changeActiveProfile(profile);

    this.activeProfile = profile;
  }
}
</script>

<style lang="css">
.dropdown:hover .dropdown-menu {
  display: block;
}
</style>
