import type { LinkingOptions } from '@react-navigation/native'
import type { RootStackParamList } from './types'

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['nestack://', 'https://app.nestack.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
        },
      },
      Onboarding: {
        screens: {
          InviteCode: 'invite/:code',
        },
      },
      Main: {
        screens: {
          MissionTab: {
            screens: {
              MissionDetail: 'missions/:id',
            },
          },
        },
      },
    },
  },
}
