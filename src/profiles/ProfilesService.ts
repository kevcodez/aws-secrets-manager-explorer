import { Profile } from "./Profile";
import store from "@/store";

export const SETTINGS_KEY_PROFILES = "profiles";
export const SETTINGS_KEY_ACTIVE_PROFILE = "activeProfile";

class ProfilesService {
  saveProfiles(profiles: Profile[]) {
    return store.set(SETTINGS_KEY_PROFILES, JSON.stringify(profiles));
  }

  getProfiles(): Profile[] {
    const profilesSetting = store.get(SETTINGS_KEY_PROFILES);
    if (!profilesSetting) {
      return [];
    }

    return JSON.parse(profilesSetting) as Profile[];
  }

  changeActiveProfile(profile: Profile) {
    store.set(SETTINGS_KEY_ACTIVE_PROFILE, profile.label);
  }

  getActiveProfile(): Profile | null {
    const activeProfileSetting = store.get(SETTINGS_KEY_ACTIVE_PROFILE);
    if (!activeProfileSetting) {
      return null;
    }

    const profiles = this.getProfiles();

    const activeProfileMatching: Profile[] = profiles.filter(
      it => it.label === activeProfileSetting
    );

    return activeProfileMatching?.[0];
  }
}

export const profilesService: ProfilesService = new ProfilesService();
