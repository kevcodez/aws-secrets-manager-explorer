module.exports = {
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: ["github"],
        appId: "de.kevcodez.AwsSecretsManagerExplorer",
        productName: "AWS Secrets Manager Explorer",
        mac: {
          category: "public.app-category.developer-tools",
          target: ["zip", "dmg"]
        },
        linux: {
          target: "AppImage"
        }
      }
    }
  }
};
