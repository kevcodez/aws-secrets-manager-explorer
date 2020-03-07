<template>
  <div class="m-4">
    <span class="mb-4 font-bold">AWS Secrets Manager Explorer</span>

    <table class="w-full mt-6">
      <tbody class="w-full">
        <tr>
          <td>Application</td>
          <td>{{ appVersion }}</td>
        </tr>
        <tr>
          <td>Electron</td>
          <td>{{ processVersions.electron }}</td>
        </tr>
        <tr>
          <td>Node</td>
          <td>{{ processVersions.node }}</td>
        </tr>
        <tr>
          <td>Chrome</td>
          <td>{{ processVersions.chrome }}</td>
        </tr>
      </tbody>
    </table>

    <p class="mt-6">
      Found a bug?
      <a
        class="cursor-pointer text-blue-400"
        @click="
          openLink(
            'https://github.com/kevcodez/aws-secrets-manager-explorer/issues'
          )
        "
        >Open an Issue</a
      >
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
const app = require("electron").remote.app;
const { shell } = require("electron");

@Component({})
export default class About extends Vue {
  get appVersion() {
    return app.getVersion();
  }

  openLink(link) {
    shell.openExternal(link);
  }

  get processVersions(): Record<string, any> {
    return process.versions;
  }
}
</script>
