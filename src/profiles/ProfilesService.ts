import { Profile } from './Profile';
import store from '@/store'

class ProfilesService {

    saveProfiles(profiles: Profile[]) {
        return store.set('profiles', JSON.stringify(profiles))
    }

    getProfiles(): Profile[] {
        const profilesSetting = store.get('profiles')
        if (!profilesSetting) {
            return []
        }

        return JSON.parse(profilesSetting) as Profile[]
    }

    changeActiveProfile(profile: Profile) {
        store.set('activeProfile', profile.label)
    }

    getActiveProfile(): Profile | null {
        const activeProfileSetting = store.get('activeProfile')
        if (!activeProfileSetting) {
            return null
        }

        const profiles = this.getProfiles()

        const activeProfileMatching: Profile[] = profiles.filter(it => it.label === activeProfileSetting)

        return activeProfileMatching?.[0]
    }

}

export const profilesService: ProfilesService = new ProfilesService()