<template>
  <div>
    <nav class="mb-2">
      <ol
        class="list-reset pl-6 py-4 rounded text-sm flex bg-grey-light text-grey"
      >
        <li>
          <router-link to="/" class="no-underline text-indigo select-none"
            >&lt; Back to all secrets</router-link
          >
        </li>
      </ol>
    </nav>

    <div class="flex">
      <div class="w-2/5 pr-3 text-center pt-2">
        <a
          class="bg-indigo-500 text-white py-1 rounded hover:bg-indigo-800 cursor-pointer px-4 py-2 mb-5"
          @click="initNewProfile()"
          >Add new profile
        </a>

        <div class="mt-4 text-left">
          <div
            v-for="profile in profiles"
            :key="profile.id"
            class="hover:bg-gray-200 py-2 px-4 cursor-pointer"
            :class="{
              'font-bold text-indigo-700':
                selectedProfile && selectedProfile.id === profile.id
            }"
            @click="selectProfile(profile)"
          >
            {{ profile.label }}
            <span
              v-if="activeProfile && activeProfile.id === profile.id"
              class="font-bold text-sm"
              >&nbsp;(Active)</span
            >
          </div>
        </div>
      </div>
      <div class="w-3/5">
        <div class="w-full pr-4 pl-2">
          <div
            class="flex items-center rounded bg-blue-500 text-white text-sm px-4 py-3 mb-4"
            role="alert"
          >
            <svg
              class="fill-current w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"
              />
            </svg>
            <p>
              The data will only be saved
              <strong>locally.</strong>
            </p>
          </div>

          <div class="text-lg font-bold mb-2">
            <span v-if="selectedProfile"
              >Editing profile {{ selectedProfile.label }}</span
            >
            <span v-else>Adding new profile</span>
          </div>

          <ValidationObserver v-slot="{ passes }">
            <form method="post" @submit.prevent="passes(save)">
              <div class="flex flex-wrap h-full">
                <div class="w-full">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-xs text-left font-bold mb-2"
                    for="Label"
                    >Label</label
                  >
                  <ValidationProvider rules="required" v-slot="{ errors }">
                    <input
                      v-model="label"
                      class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      id="label"
                      name="Label"
                      type="text"
                      placeholder="Enter a label for display purposes"
                    />
                    <p class="text-red-500 mb-4">{{ errors[0] }}</p>
                  </ValidationProvider>
                </div>

                <div class="w-full">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-xs text-left font-bold mb-2"
                    for="region"
                    >Region</label
                  >
                  <ValidationProvider rules="required" v-slot="{ errors }">
                    <input
                      v-model="region"
                      class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      id="region"
                      name="Region"
                      type="text"
                      placeholder="AWS region, i.e. eu-central-1"
                    />
                    <p class="text-red-500 mb-4">{{ errors[0] }}</p>
                  </ValidationProvider>
                </div>

                <div class="w-full">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-xs text-left font-bold mb-2"
                    for="awsAccessKeyId"
                    >AWS Access Key ID</label
                  >
                  <ValidationProvider rules="required" v-slot="{ errors }">
                    <input
                      v-model="accessKeyId"
                      class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      id="awsAccessKeyId"
                      name="AWS Access Key ID"
                      type="text"
                    />
                    <p class="text-red-500 mb-4">{{ errors[0] }}</p>
                  </ValidationProvider>
                </div>

                <div class="w-full">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-xs text-left font-bold mb-2"
                    for="awsAccessKeySecret"
                    >AWS Access Key Secret</label
                  >
                  <ValidationProvider rules="required" v-slot="{ errors }">
                    <input
                      v-model="accessKeySecret"
                      class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      id="awsAccessKeySecret"
                      name="AWS Access Key Secret"
                      type="text"
                    />
                    <p class="text-red-500 mb-4">{{ errors[0] }}</p>
                  </ValidationProvider>
                </div>

                <div class="w-full">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-xs text-left font-bold mb-2"
                    for="assumeRoleArn"
                    >AWS Assume Role ARN (optional)</label
                  >
                  <input
                    v-model="assumeRoleArn"
                    class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="assumeRoleArn"
                    name="AWS Assume Role ARN"
                    type="text"
                  />
                </div>
              </div>

              <button
                @click="deleteProfile()"
                type="button"
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                v-if="selectedProfile"
              >
                <font-awesome-icon icon="trash" />&nbsp;Delete
              </button>

              <button
                type="submit"
                class="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded self-end align-middle float-right"
              >
                Save
              </button>
            </form>
          </ValidationObserver>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { Profile } from "@/profiles/Profile";
import { profilesService } from "@/profiles/ProfilesService";
import {
  setInteractionMode,
  extend,
  ValidationProvider,
  ValidationObserver
} from "vee-validate";
import { required } from "vee-validate/dist/rules";
import { v4 as uuidv4 } from "uuid";

@Component({
  components: {
    ValidationProvider,
    ValidationObserver
  }
})
export default class ProfilesView extends Vue {
  label = "";
  region = "";
  accessKeySecret = "";
  accessKeyId = "";
  assumeRoleArn = "";

  profiles: Profile[] = profilesService.getProfiles();
  activeProfile: Profile | null = profilesService.getActiveProfile();
  selectedProfile: Profile | null = null;

  get regions(): Map<string, string> {
    return new Map<string, string>([
      ["us-east-1", "US East (North-Viginia)"],
      ["us-east-1", "US East (Ohio)"]
    ]);
  }

  initNewProfile() {
    this.resetData();
  }

  resetData() {
    this.selectedProfile = null;
    this.label = "";
    this.region = "";
    this.accessKeySecret = "";
    this.accessKeyId = "";
    this.assumeRoleArn = "";
  }

  deleteProfile() {
    profilesService.deleteProfile(this.selectedProfile!!);
    this.profiles = profilesService.getProfiles();
    this.activeProfile = profilesService.getActiveProfile();
  }

  save() {
    const profile: Profile = {
      id: this.selectedProfile?.id || uuidv4(),
      label: this.label,
      region: this.region,
      accessKeyId: this.accessKeyId,
      accessKeySecret: this.accessKeySecret,
      assumeRoleArn: this.assumeRoleArn
    };

    profilesService.saveOrUpdateProfile(profile);
    this.selectedProfile = profile;
    this.profiles = profilesService.getProfiles();
    this.activeProfile = profilesService.getActiveProfile();
  }

  selectProfile(profile) {
    this.selectedProfile = profile;

    this.label = profile.label;
    this.region = profile.region;
    this.accessKeySecret = profile.accessKeySecret;
    this.accessKeyId = profile.accessKeyId;
    this.assumeRoleArn = profile.assumeRoleArn || "";
  }

  mounted() {
    extend("required", required);
    setInteractionMode("eager");
  }
}
</script>
