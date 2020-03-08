<template>
  <div class="mx-4">
    <nav class="container">
      <ol class="list-reset py-4 rounded flex bg-grey-light text-grey">
        <li>
          <a
            disabled
            class="flex rounded-full bg-indigo-500 px-2 py-1 text-white text-sm"
            >All secrets</a
          >
        </li>
      </ol>
    </nav>

    <form class="w-full" style="top: 40px" v-if="!error">
      <div class="flex flex-wrap">
        <div class="w-full">
          <label
            class="block uppercase tracking-wide text-gray-700 text-xs text-left font-bold mb-2"
            for="search"
            >Search</label
          >
          <input
            v-on:input="filterSecrets()"
            :disabled="loading || !activeProfile"
            v-model="searchTerm"
            class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="search"
            type="text"
            placeholder="Search for secrets..."
          />
        </div>
      </div>
    </form>

    <div v-if="error" class="shadow-md rounded w-full mb-5 p-4">
      An error occured loading the secret.
      <p class="mt-4">{{ error }}</p>
    </div>

    <table class="w-full" v-if="activeProfile && !error">
      <thead class="flex w-full">
        <tr class="flex w-full">
          <th
            class="w-5/12 py-3 text-left border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-800 uppercase tracking-wider"
          >
            Secret
          </th>
          <th
            class="w-6/12 py-3 text-left border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-800 uppercase tracking-wider"
          >
            Description
          </th>
          <th class="w-1/12 py-3 border-b border-gray-200">
            <font-awesome-icon
              icon="sync-alt"
              class="text-xl float-right mr-3 cursor-pointer hover:text-indigo-500"
              v-if="activeProfile"
              @click="loadSecrets(true)"
            />
          </th>
        </tr>
      </thead>
      <tbody
        class="flex flex-col items-center overflow-y-scroll w-full"
        style="height: 70vh;"
        v-if="!loading"
      >
        <tr
          v-for="secret in filteredSecrets"
          class="text-left hover:bg-gray-100 cursor-pointer flex w-full"
          :key="secret.arn"
          @click="selectSecret(secret)"
        >
          <td class="w-5/12 py-2 px-2 border-b border-gray-200">
            {{ secret.Name }}
          </td>
          <td class="w-6/12 py-2 px-2 border-b border-gray-200">
            {{ secret.Description || " - " }}
          </td>
          <td class="w-1/12 p-2 border-b border-gray-200">
            <font-awesome-icon
              icon="star"
              class="float-right mr- cursor-pointer text-yellow-500"
              v-if="isFavorite(secret)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!activeProfile" class="mt-5">
      You haven't selected a profile. In case you have not configured one yet,
      please
      <router-link
        to="/profiles"
        class="text-indigo-500 font-bold cursor-pointer"
        >create one here</router-link
      >.
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { SecretListEntry } from "aws-sdk/clients/secretsmanager";
import { secretService } from "@/SecretService";
import store from "@/store";
import { favoriteService } from "@/favorites/FavoriteService";
import { AWSError } from "aws-sdk";
import {
  SETTINGS_KEY_ACTIVE_PROFILE,
  profilesService
} from "@/profiles/ProfilesService";
import { Profile } from "../profiles/Profile";

@Component({})
export default class SecretListView extends Vue {
  secrets: SecretListEntry[] = [];
  filteredSecrets: SecretListEntry[] = [];
  searchTerm = "";
  loading = false;
  error: AWSError | null = null;
  unsubribeWatcher: any = null;
  activeProfile: Profile | null = null;

  isFavorite(secret: SecretListEntry): boolean {
    return favoriteService.isFavorite(secret.Name!!);
  }

  mounted() {
    this.activeProfile = profilesService.getActiveProfile();
    this.loadSecrets();

    this.unsubribeWatcher = store.onDidChange(
      SETTINGS_KEY_ACTIVE_PROFILE,
      newVal => {
        this.activeProfile = newVal;

        this.loadSecrets();
      }
    );
  }

  beforeDestroy() {
    this.unsubribeWatcher();
  }

  async loadSecrets(forceRefresh = false) {
    if (this.loading) return;

    this.loading = true;
    this.error = null;

    try {
      this.secrets = await secretService.getAllSecrets(forceRefresh);
      this.filterSecrets();
    } catch (err) {
      this.error = err;
    }

    this.loading = false;
  }

  filterSecrets() {
    const favorites = favoriteService.getFavorites();

    let filteredSecrets;

    if (!this.searchTerm) {
      filteredSecrets = this.secrets.concat();
    } else {
      filteredSecrets = this.secrets.filter(it => {
        return it.Name?.includes(this.searchTerm);
      });
    }

    this.filteredSecrets = filteredSecrets.sort(
      (a: SecretListEntry, b: SecretListEntry) => {
        const favoriteA: boolean = favorites.includes(a.Name!!);
        const favoriteB: boolean = favorites.includes(b.Name!!);
        return (
          (favoriteA === favoriteB ? 0 : favoriteA ? -1 : 1) ||
          a.Name!!.localeCompare(b.Name!!)
        );
      }
    );
  }

  selectSecret(secret) {
    this.$router.push(`/secret/${encodeURIComponent(secret.ARN)}`);
  }
}
</script>
