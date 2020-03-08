<template>
  <div class="mx-4">
    <nav class="container">
      <ol class="list-reset py-4 rounded flex bg-grey-light text-sm text-grey">
        <li class="px-2">
          <router-link
            to="/"
            class="no-underline text-indigo  text-center align-middle"
            >All secrets</router-link
          >
        </li>
        <li>/</li>
        <li class="px-2">
          <a
            disabled
            class="flex rounded-full bg-indigo-500 uppercase px-2 py-1 text-xs font-bold mr-3 text-white"
            v-if="secretValueResult"
            >{{ secretValueResult.Name }}</a
          >
        </li>
      </ol>
    </nav>

    <div v-if="secretValueResult && describeSecretResult">
      <div class="shadow rounded rounded w-full mb-4">
        <div
          class="font-bold text-lg mb-2 border-b-2 border-gray-200 py-3 px-4"
        >
          <font-awesome-icon icon="info-circle" />&nbsp;Info

          <font-awesome-icon
            icon="sync-alt"
            class="float-right cursor-pointer hover:text-indigo-500 text-lg"
            @click="refreshSecret()"
          />
        </div>
        <div class="p-4">
          <div class="mb-4">
            <span class="rounded-full bg-gray-600 text-white px-3 text-sm py-1"
              >Name</span
            >
            <p class="mt-2 pl-1">
              {{ secretValueResult.Name }}
              <font-awesome-icon
                class="float-right hover:text-indigo-500 cursor-pointer"
                icon="clipboard"
                @click="copyToClipboard(secretValueResult.Name)"
              />
            </p>
          </div>
          <div class="mb-4">
            <span class="rounded-full bg-gray-600 text-white px-3 py-1 text-sm"
              >ARN</span
            >
            <p class="mt-2 pl-1">
              {{ secretValueResult.ARN }}
              <font-awesome-icon
                class="float-right hover:text-indigo-500 cursor-pointer"
                icon="clipboard"
                @click="copyToClipboard(secretValueResult.ARN)"
              />
            </p>
          </div>

          <div class="mb-4">
            <span class="rounded-full bg-gray-600 text-white px-3 py-1 text-sm"
              >Description</span
            >
            <p class="mt-2 pl-1">
              {{ describeSecretResult.Description || " - " }}
            </p>
          </div>

          <div class="flex">
            <div class="w-1/2">
              <span
                class="rounded-full bg-gray-600 text-white px-3 py-1 text-sm"
                >Created Date</span
              >
              <p class="mt-2 pl-1">
                {{
                  secretValueResult.CreatedDate | dayjs("YYYY-MM-DD HH:mm:ss")
                }}
              </p>
            </div>

            <div class="w-1/2">
              <span
                class="rounded-full bg-gray-600 text-white px-3 py-1 text-sm"
                >Last Changed Date</span
              >
              <p class="mt-2 pl-1">
                {{
                  describeSecretResult.LastChangedDate
                    | dayjs("YYYY-MM-DD HH:mm:ss")
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="shadow rounded w-full">
        <div
          class="font-bold text-lg mb-2 rounded border-b-2 border-gray-200 py-3 px-4"
        >
          <font-awesome-icon icon="key" />&nbsp;Secret Value
          <font-awesome-icon
            icon="star"
            class="float-right cursor-pointer text-yellow-500 text-lg"
            v-if="favorite"
            @click="removeFromFavorites()"
          />
          <font-awesome-icon
            :icon="['far', 'star']"
            class="float-right cursor-pointer text-lg hover:text-indigo-500"
            @click="markAsFavorite()"
            v-else
          />
        </div>

        <div>
          <div v-if="jsonSecret">
            <div
              class="border-b-2 border-gray-100 p-4"
              v-for="key in Object.keys(jsonSecret)"
              :key="key"
            >
              <span
                class="rounded-full bg-indigo-500 text-white px-3 py-1 text-sm"
              >
                {{ key }}
              </span>
              <font-awesome-icon
                class="float-right hover:text-indigo-500 cursor-pointer"
                icon="clipboard"
                @click="copyToClipboard(jsonSecret[key])"
              />
              <p class="mt-2 px-2 break-words">{{ jsonSecret[key] }}</p>
            </div>
          </div>

          <div v-else>
            <p class="break-words">
              {{ secretValueResult.SecretString }}
              <font-awesome-icon
                class="float-right hover:text-indigo-500 cursor-pointer"
                icon="clipboard"
                @click="secretValueResult.SecretString"
              />
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="shadow-md rounded w-full mb-5 p-4">
      An error occured loading the secret.
      <p class="mt-4">{{ error }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { secretService } from "@/SecretService";
const { clipboard } = require("electron");
import store from "@/store";
import { favoriteService } from "@/favorites/FavoriteService";
import {
  DescribeSecretResponse,
  GetSecretValueResponse
} from "aws-sdk/clients/secretsmanager";
import { AWSError } from "aws-sdk";
import { SETTINGS_KEY_ACTIVE_PROFILE } from "../profiles/ProfilesService";

@Component({})
export default class SecretView extends Vue {
  describeSecretResult: DescribeSecretResponse | null = null;
  secretValueResult: GetSecretValueResponse | null = null;
  jsonSecret: Record<string, any> | null = null;
  loadingSecret = false;
  error: AWSError | null = null;
  unsubribeWatcher: any = null;
  favorite = false;

  copyToClipboard(text) {
    clipboard.writeText(text);
    this.$toasted.show("Copied to clipboard!", {
      type: "success",
      theme: "bubble",
      duration: 1000,
      position: "top-center"
    });
  }

  refreshSecret() {
    // @ts-ignore
    this.loadSecret(this.$route.params.arn);
  }

  async loadSecret(arn: string) {
    if (this.loadingSecret) return;

    this.error = null;
    this.loadingSecret = true;

    try {
      const describeSecretResult = await secretService.describeSecret(arn);

      const secretValueResult = await secretService.getSecretValue(arn);

      if (describeSecretResult?.Name) {
        this.favorite = favoriteService.isFavorite(describeSecretResult.Name);
      }

      if (secretValueResult && secretValueResult.SecretString) {
        const secretString = secretValueResult.SecretString as string;

        try {
          this.jsonSecret = JSON.parse(secretString);
        } catch (err) {
          this.jsonSecret = null;
        }
      }

      this.secretValueResult = secretValueResult;
      this.describeSecretResult = describeSecretResult;
    } catch (err) {
      this.error = err;
    }
    this.loadingSecret = false;
  }

  markAsFavorite() {
    if (this.describeSecretResult?.Name) {
      favoriteService.markAsFavorite(this.describeSecretResult.Name);
      this.favorite = true;
    }
  }

  removeFromFavorites() {
    if (this.describeSecretResult?.Name) {
      favoriteService.removeFromFavorites(this.describeSecretResult.Name);

      this.favorite = false;
    }
  }

  mounted() {
    // @ts-ignore
    const arn = this.$route.params.arn;

    this.loadSecret(arn);

    this.unsubribeWatcher = store.onDidChange(
      SETTINGS_KEY_ACTIVE_PROFILE,
      async () => {
        this.loadingSecret = true;

        // ARN will change, so we need to find the new ARN
        const allSecrets = await secretService.getAllSecrets();

        const matchingSecrets =
          allSecrets.filter(it => it.Name === this.secretValueResult?.Name) ??
          [];

        if (matchingSecrets.length) {
          const arn = matchingSecrets[0]!!.ARN!!;

          this.loadSecret(arn);
        } else {
          this.$router.push("/");
        }
      }
    );
  }

  beforeDestroy() {
    this.unsubribeWatcher();
  }
}
</script>
