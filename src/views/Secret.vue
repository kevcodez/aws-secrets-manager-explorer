<template>
  <div class="mx-4">
    <nav class="container">
      <ol class="list-reset py-4 rounded flex bg-grey-light text-grey">
        <li class="px-2">
          <router-link to="/" class="no-underline text-indigo"
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
      <div class="shadow-md rounded w-full mb-5 p-4">
        <div class="font-bold text-xl mb-2">
          <font-awesome-icon icon="info-circle" />&nbsp;Info
        </div>
        <div class="mb-4">
          <span class="rounded-full bg-gray-200 px-3 py-1">Name</span>
          <p class="mt-2 pl-2">
            {{ secretValueResult.Name }}
            <font-awesome-icon
              class="float-right"
              icon="clipboard"
              @click="copyToClipboard(secretValueResult.Name)"
            />
          </p>
        </div>
        <div class="mb-4">
          <span class="rounded-full bg-gray-200 px-3 py-1">ARN</span>
          <p class="mt-2 pl-2">
            {{ secretValueResult.ARN }}
            <font-awesome-icon
              class="float-right"
              icon="clipboard"
              @click="copyToClipboard(secretValueResult.ARN)"
            />
          </p>
        </div>

        <div class="mb-4">
          <span class="rounded-full bg-gray-200 px-3 py-1">Description</span>
          <p class="mt-2 pl-2">
            {{ describeSecretResult.Description || " - " }}
          </p>
        </div>

        <div class="flex">
          <div class="w-1/2">
            <span class="rounded-full bg-gray-200 px-3 py-1">Created Date</span>
            <p class="mt-2 pl-2">
              {{ secretValueResult.CreatedDate | dayjs("YYYY-MM-DD HH:mm:ss") }}
            </p>
          </div>

          <div class="w-1/2">
            <span class="rounded-full bg-gray-200 px-3 py-1"
              >Last Changed Date</span
            >
            <p class="mt-2 pl-2">
              {{
                describeSecretResult.LastChangedDate
                  | dayjs("YYYY-MM-DD HH:mm:ss")
              }}
            </p>
          </div>
        </div>
      </div>
      <div class="shadow-md rounded w-full p-4">
        <div class="font-bold text-xl mb-2">
          <font-awesome-icon icon="key" />&nbsp;Secret Value
          <font-awesome-icon
            icon="star"
            class="float-right cursor-pointer text-orange-400 text-xl"
            v-if="favorite"
            @click="removeFromFavorites()"
          />
          <font-awesome-icon
            :icon="['far', 'star']"
            class="float-right cursor-pointer text-xl"
            @click="markAsFavorite()"
            v-else
          />
        </div>

        <div v-if="jsonSecret">
          <div
            class="border-b-2 border-gray-100 py-4"
            v-for="key in Object.keys(jsonSecret)"
            :key="key"
          >
            <span class="rounded-full bg-gray-200 px-3 py-1">{{ key }}</span>
            <font-awesome-icon
              class="float-right"
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
              class="float-right"
              icon="clipboard"
              @click="secretValueResult.SecretString"
            />
          </p>
        </div>
      </div>
    </div>

    <div v-if="error" class="shadow-md rounded w-full mb-5 p-4">
      An error occured loading the secret.
      <p class="mt-4">{{ error }}</p>
    </div>

    <div v-else-if="loadingSecret" class="shadow-md rounded w-full mb-5 p-4">
      Loading ...
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { getSecretsManager } from "../aws-helper";
const { clipboard } = require("electron");
import store from "@/store";
import { favoriteService } from "@/favorites/FavoriteService";
import {
  DescribeSecretResponse,
  GetSecretValueResponse
} from "aws-sdk/clients/secretsmanager";
import { AWSError } from "aws-sdk";

@Component({})
export default class SecretsList extends Vue {
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
      duration: 1000,
      position: "top-center"
    });
  }

  async loadSecret(arn: string) {
    const secretsManager = await getSecretsManager();
    if (!secretsManager) {
      return;
    }

    this.error = null;
    this.loadingSecret = true;

    try {
      const describeSecretResult = await secretsManager
        .describeSecret({
          SecretId: arn
        })
        .promise();

      const secretValueResult = await secretsManager
        .getSecretValue({
          SecretId: arn
        })
        .promise();

      if (describeSecretResult.Name) {
        this.favorite = favoriteService.isFavorite(describeSecretResult.Name);
      }

      const secretString = secretValueResult.SecretString as string;

      try {
        this.jsonSecret = JSON.parse(secretString);
      } catch (err) {
        this.jsonSecret = null;
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

    this.unsubribeWatcher = store.onDidChange("activeProfile", async () => {
      this.loadingSecret = true;

      // ARN will change, so we need to find the new ARN
      const secretsManager = await getSecretsManager();
      const secretsResponse = await secretsManager
        ?.listSecrets({
          MaxResults: 100
        })
        .promise();

      const matchingSecrets =
        secretsResponse?.SecretList?.filter(
          it => it.Name === this.secretValueResult?.Name
        ) ?? [];

      if (matchingSecrets.length) {
        const arn = matchingSecrets[0]!!.ARN!!;

        this.loadSecret(arn);
      } else {
        // @ts-ignore
        // self.$router.push('/')
      }
    });
  }

  beforeDestroy() {
    this.unsubribeWatcher();
  }
}
</script>
