<template>
  <div class="mx-4">
    <nav class="container">
      <ol class="list-reset py-4 rounded flex bg-grey-light text-grey">
        <li>
          <a
            disabled
            class="flex rounded-full bg-indigo-500 uppercase px-2 py-1 text-xs font-bold mr-3 text-white"
            >All secrets</a
          >
        </li>
      </ol>
    </nav>

    <form class="w-full" style="top: 40px">
      <div class="flex flex-wrap">
        <div class="w-full">
          <label
            class="block uppercase tracking-wide text-gray-700 text-xs text-left font-bold mb-2"
            for="search"
            >Search</label
          >
          <input
            v-on:input="filterSecrets()"
            :disabled="loading"
            v-model="searchTerm"
            class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="search"
            type="text"
            placeholder="Search for secrets..."
          />
        </div>
      </div>
    </form>

    <table class="w-full">
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
              class="text-xl float-right mr-2 cursor-pointer"
              @click="loadSecrets()"
            />
          </th>
        </tr>
      </thead>
      <tbody
        class="flex flex-col items-center justify-between overflow-y-scroll w-full"
        style="height: 75vh;"
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
              class="float-right cursor-pointer text-orange-400"
              v-if="isFavorite(secret)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
// eslint-disable-next-line no-unused-vars
import { SecretListEntry } from "aws-sdk/clients/secretsmanager";
import { getSecretsManager } from "../aws-helper";
import store from "@/store";
import { favoriteService } from "@/favorites/FavoriteService";

@Component({})
export default class SecretsList extends Vue {
  secrets: SecretListEntry[] = [];
  filteredSecrets: SecretListEntry[] = [];
  searchTerm = "";
  loading = false;
  unsubribeWatcher: any = null;

  isFavorite(secret: SecretListEntry): boolean {
    return favoriteService.isFavorite(secret.Name!!);
  }

  mounted() {
    this.loadSecrets();

    this.unsubribeWatcher = store.onDidChange("activeProfile", () => {
      console.log("did change in list");
      this.loadSecrets();
    });
  }

  beforeDestroy() {
    this.unsubribeWatcher();
  }

  async loadSecrets() {
    if (this.loading) return;

    const secretsManager = await getSecretsManager();
    if (!secretsManager) {
      return;
    }

    this.loading = true;

    const result = await secretsManager
      .listSecrets({
        MaxResults: 100
      })
      .promise();

    this.loading = false;

    this.secrets = result.SecretList!!;
    this.filterSecrets();
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
    // @ts-ignore
    this.$router.push(`/secret/${encodeURIComponent(secret.ARN)}`);
  }
}
</script>
