import { useState, useCallback, useEffect } from 'react'
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import Toast from 'react-native-toast-message'

// Google Web Client ID - ID 토큰 발급을 위해 필요
// Google Cloud Console에서 Web Application 타입으로 생성된 Client ID를 사용
const WEB_CLIENT_ID = '739566547309-k8jdh55t8n0fmv8c1p64552l6fskb6pg.apps.googleusercontent.com'

export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const { setTokens, setUser } = useAuthStore()

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
    })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true)

    try {
      // Google Play Services 확인
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })

      // Google 로그인 실행
      const response = await GoogleSignin.signIn()

      if (!isSuccessResponse(response)) {
        throw new Error('Google 로그인에 실패했습니다')
      }

      const { idToken } = response.data
      if (!idToken) {
        throw new Error('Google ID 토큰을 받지 못했습니다')
      }

      // 백엔드로 ID 토큰 전송
      const { data } = await authApi.googleLogin({ idToken })

      // 토큰 저장
      setTokens(data.tokens.accessToken, data.tokens.refreshToken)

      // 사용자 정보 저장
      setUser({
        id: data.userId,
        email: data.email,
        name: data.name,
        emailVerified: true,
        familyGroupId: null,
      })

      Toast.show({
        type: 'success',
        text1: '로그인 성공',
        text2: `${data.name}님, 환영합니다!`,
      })
    } catch (error) {
      let errorMessage = '로그인 중 오류가 발생했습니다'

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            errorMessage = '로그인이 취소되었습니다'
            break
          case statusCodes.IN_PROGRESS:
            errorMessage = '로그인이 이미 진행 중입니다'
            break
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            errorMessage = 'Google Play 서비스를 사용할 수 없습니다'
            break
          default:
            errorMessage = error.message || '알 수 없는 오류가 발생했습니다'
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      Toast.show({
        type: 'error',
        text1: '로그인 실패',
        text2: errorMessage,
      })

      console.error('Google Sign-In Error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [setTokens, setUser])

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.signOut()
    } catch (error) {
      console.error('Google Sign-Out Error:', error)
    }
  }, [])

  return {
    signInWithGoogle,
    signOut,
    isLoading,
  }
}
