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
          publish: {
            provider: "github",
            private: true,
            token: "token"
          },
          target: ["zip", "dmg"]
        }
      }
    }
  }
};
