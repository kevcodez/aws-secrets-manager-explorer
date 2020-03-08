import { Profile } from "./Profile";
import store from "@/store";

export const SETTINGS_KEY_PROFILES = "profiles";
export const SETTINGS_KEY_ACTIVE_PROFILE = "activeProfile";

class ProfilesService {
  private profiles: Profile[] = [];
  private activeProfile: Profile | null = null;

  constructor() {
    this.profiles = this.loadProfiles();
    this.activeProfile = this.loadActiveProfile();
  }

  deleteProfile(profile: Profile) {
    this.profiles = this.profiles.filter(it => it.id !== profile.id);

    if (this.activeProfile?.id === profile.id) {
      this.changeActiveProfile(null);
    }

    this.saveProfiles();
  }

  saveOrUpdateProfile(profile: Profile) {
    const isExistingProfile = this.profiles.some(it => it.id === profile.id);
    if (isExistingProfile) {
      const index = this.profiles.findIndex(it => it.id === profile.id);
      this.profiles[index] = profile;
    } else {
      this.profiles.push(profile);
    }

    this.saveProfiles();

    // set as active profile if it's the first one being added
    if (this.profiles.length === 1) {
      this.changeActiveProfile(profile);
    }
  }

  getProfiles(): Profile[] {
    return this.profiles;
  }

  getActiveProfile(): Profile | null {
    return this.activeProfile;
  }

  changeActiveProfile(profile: Profile | null) {
    if (profile == null) {
      store.delete(SETTINGS_KEY_ACTIVE_PROFILE);
    } else {
      store.set(SETTINGS_KEY_ACTIVE_PROFILE, profile.id);
    }
    this.activeProfile = profile;
  }

  private saveProfiles() {
    store.set(SETTINGS_KEY_PROFILES, JSON.stringify(this.profiles));
  }

  private loadProfiles(): Profile[] {
    const profilesSetting = store.get(SETTINGS_KEY_PROFILES);
    if (!profilesSetting) {
      return [];
    }

    return JSON.parse(profilesSetting) as Profile[];
  }

  private loadActiveProfile(): Profile | null {
    const activeProfileIdSetting = store.get(SETTINGS_KEY_ACTIVE_PROFILE);
    if (!activeProfileIdSetting) {
      return null;
    }

    const activeProfileMatching: Profile[] = this.profiles.filter(
      it => it.id === activeProfileIdSetting
    );

    return activeProfileMatching?.[0];
  }
}

export const profilesService: ProfilesService = new ProfilesService();
