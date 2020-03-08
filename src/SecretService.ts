import { profilesService } from "./profiles/ProfilesService";
import AWS, { SecretsManager } from "aws-sdk";
import {
  DescribeSecretResponse,
  GetSecretValueResponse,
  SecretListEntry
} from "aws-sdk/clients/secretsmanager";

class SecretService {
  secrets = new Map<string, SecretListEntry[]>();

  private async getSecretsManager(): Promise<SecretsManager | null> {
    const activeProfile = profilesService.getActiveProfile();
    if (!activeProfile) {
      return null;
    }

    let credentials;

    let sessionToken;

    if (activeProfile.assumeRoleArn) {
      const sts = new AWS.STS({
        accessKeyId: activeProfile.accessKeyId,
        secretAccessKey: activeProfile.accessKeySecret,
        region: activeProfile.region
      });

      const response = await sts
        .assumeRole({
          RoleArn: activeProfile.assumeRoleArn,
          RoleSessionName: "GetSecrets"
        })
        .promise();

      if (response.Credentials) {
        credentials = new AWS.Credentials({
          accessKeyId: response.Credentials.AccessKeyId!!,
          secretAccessKey: response.Credentials.SecretAccessKey!!,
          sessionToken: response.Credentials?.SessionToken
        });
      }
    } else {
      credentials = new AWS.Credentials({
        accessKeyId: activeProfile.accessKeyId,
        secretAccessKey: activeProfile.accessKeySecret
      });
    }

    AWS.config.credentials = credentials;

    return new AWS.SecretsManager({
      region: activeProfile.region,
      sessionToken: sessionToken
    });
  }

  async describeSecret(arn: string): Promise<DescribeSecretResponse | null> {
    const secretsManager = await this.getSecretsManager();
    if (!secretsManager) return null;
    return secretsManager
      .describeSecret({
        SecretId: arn
      })
      .promise();
  }

  async getSecretValue(arn: string): Promise<GetSecretValueResponse | null> {
    const secretsManager = await this.getSecretsManager();
    if (!secretsManager) return null;
    return secretsManager
      .getSecretValue({
        SecretId: arn
      })
      .promise();
  }

  async getAllSecrets(forceRefresh = false): Promise<SecretListEntry[]> {
    const activeProfile = profilesService.getActiveProfile()!!;
    if (!activeProfile) {
      return [];
    }

    if (this.secrets.has(activeProfile.label) && !forceRefresh) {
      return this.secrets.get(activeProfile.label)!!;
    }

    const secretsManager = await this.getSecretsManager();
    if (!secretsManager) return [];

    const secretEntries: SecretListEntry[] = [];
    let hasMore = true;
    let nextToken;

    do {
      const result = await secretsManager
        .listSecrets({
          MaxResults: 100,
          NextToken: nextToken
        })
        .promise();

      if (result && result.SecretList) {
        secretEntries.push(...result.SecretList);
        nextToken = result.NextToken;
        hasMore =
          result.SecretList.length === 100 && result.NextToken !== undefined;
      } else {
        hasMore = false;
      }
    } while (hasMore);

    this.secrets.set(activeProfile.label, secretEntries);

    return secretEntries;
  }
}

export const secretService = new SecretService();
