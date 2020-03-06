import AWS, { SecretsManager } from 'aws-sdk'
import { profilesService } from './profiles/ProfilesService'

export async function getSecretsManager(): Promise<SecretsManager | null> {
    const activeProfile = profilesService.getActiveProfile()
    if (!activeProfile) {
        return null
    }

    let credentials
    
    let sessionToken
    
    if (activeProfile.assumeRoleArn) {
        const sts = new AWS.STS({
            accessKeyId: activeProfile.accessKeyId,
            secretAccessKey: activeProfile.accessKeySecret,
            region: activeProfile.region
        })
        
        const response = await sts.assumeRole({
            RoleArn: activeProfile.assumeRoleArn,
            RoleSessionName: 'GetSecrets'
        }).promise()
        
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