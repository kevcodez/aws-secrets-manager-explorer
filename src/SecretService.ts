import { profilesService } from "./profiles/ProfilesService";
import AWS, { SecretsManager } from "aws-sdk";
import {
  DescribeSecretResponse,
  GetSecretValueResponse,
  SecretListEntry
} from "aws-sdk/clients/secretsmanager";
import { Profile } from "./profiles/Profile";

class SecretService {
  secrets = new Map<string, SecretListEntry[]>();
  assumeRoleCredentials = new Map<string, AWS.Credentials>();

  private async getSecretsManager(): Promise<SecretsManager | null> {
    const activeProfile = profilesService.getActiveProfile();
    if (!activeProfile) {
      return null;
    }

    let credentials: AWS.Credentials | null;

    if (activeProfile.assumeRoleArn) {
      credentials = await this.getCredentialsWithAssumeRole(activeProfile);
    } else {
      credentials = new AWS.Credentials({
        accessKeyId: activeProfile.accessKeyId,
        secretAccessKey: activeProfile.accessKeySecret
      });
    }

    if (!credentials) {
      return null;
    }

    AWS.config.credentials = credentials;

    return new AWS.SecretsManager({
      region: activeProfile.region,
      sessionToken: credentials.sessionToken
    });
  }

  private async getCredentialsWithAssumeRole(
    profile: Profile
  ): Promise<AWS.Credentials | null> {
    if (this.assumeRoleCredentials.has(profile.label)) {
      const credentialsFromCache = this.assumeRoleCredentials.get(
        profile.label
      )!!;

      if (credentialsFromCache.expireTime > new Date()) {
        return credentialsFromCache;
      }
    }

    const sts = new AWS.STS({
      accessKeyId: profile.accessKeyId,
      secretAccessKey: profile.accessKeySecret,
      region: profile.region
    });

    const response = await sts
      .assumeRole({
        RoleArn: profile.assumeRoleArn!!,
        RoleSessionName: "GetSecrets"
      })
      .promise();

    if (response.Credentials) {
      const credentials = new AWS.Credentials({
        accessKeyId: response.Credentials.AccessKeyId!!,
        secretAccessKey: response.Credentials.SecretAccessKey!!,
        sessionToken: response.Credentials.SessionToken
      });
      credentials.expireTime = response.Credentials.Expiration;

      this.assumeRoleCredentials.set(profile.label, credentials);

      return credentials;
    } else {
      return null;
    }
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

    const maxResults = 100;

    do {
      const result = await secretsManager
        .listSecrets({
          MaxResults: maxResults,
          NextToken: nextToken
        })
        .promise();

      if (result && result.SecretList) {
        secretEntries.push(...result.SecretList);
        nextToken = result.NextToken;
        hasMore =
          result.SecretList.length === maxResults &&
          result.NextToken !== undefined;
      } else {
        hasMore = false;
      }
    } while (hasMore);

    this.secrets.set(activeProfile.label, secretEntries);

    return secretEntries;
  }
}

export const secretService = new SecretService();
