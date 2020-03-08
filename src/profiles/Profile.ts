export interface Profile {
  id: string;
  label: string;
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  assumeRoleArn?: string;
}
