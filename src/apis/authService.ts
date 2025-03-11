import axiosInstance from '../utils/axiosWithCookies';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 인증 관련 서비스
 */
const authService = {
  /**
   * 로그인 함수
   * @param userNo 사용자 학번/교번
   * @param password 비밀번호
   * @param rememberCredentials 인증 정보 저장 여부
   * @returns 로그인 성공 여부
   */
  login: async (
    userNo: string, 
    password: string, 
    rememberCredentials: boolean = true
  ): Promise<boolean> => {
    try {
      const response = await axiosInstance.post(
        '/common/login',
        new URLSearchParams({
          userNo,
          password,
          rememberMe: 'N',
        }).toString()
      );

      // 로그인 성공 여부 확인 (응답 상태로 확인)
      const isLoginSuccess = response.status === 200;

      if (isLoginSuccess) {
        // 로그인 상태 저장
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('userNo', userNo);

        // 인증 정보 저장 (요청 시)
        if (rememberCredentials) {
          await SecureStore.setItemAsync('userNo', userNo);
          await SecureStore.setItemAsync('password', password);
        }
      }

      return isLoginSuccess;
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      return false;
    }
  },

  /**
   * 로그아웃 함수
   * @param clearCredentials 저장된 인증 정보도 삭제할지 여부
   * @returns 로그아웃 성공 여부
   */
  logout: async (clearCredentials: boolean = false): Promise<boolean> => {
    try {
      // 로그아웃 API 호출 (필요한 경우)
      // await axiosInstance.get('/logout');

      // 로그인 상태 제거
      await AsyncStorage.removeItem('isLoggedIn');

      // 인증 정보 제거 (요청 시)
      if (clearCredentials) {
        await SecureStore.deleteItemAsync('userNo');
        await SecureStore.deleteItemAsync('password');
      }

      return true;
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      return false;
    }
  },

  /**
   * 로그인 상태 확인
   * @returns 로그인 상태 여부
   */
  isLoggedIn: async (): Promise<boolean> => {
    try {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      return isLoggedIn === 'true';
    } catch (error) {
      console.error('로그인 상태 확인 중 오류 발생:', error);
      return false;
    }
  },

  /**
   * 저장된 인증 정보 확인
   * @returns 저장된 인증 정보 또는 null
   */
  getSavedCredentials: async (): Promise<{ userNo: string, password: string } | null> => {
    try {
      const userNo = await SecureStore.getItemAsync('userNo');
      const password = await SecureStore.getItemAsync('password');

      if (userNo && password) {
        return { userNo, password };
      }
      
      return null;
    } catch (error) {
      console.error('저장된 인증 정보 확인 중 오류 발생:', error);
      return null;
    }
  }
};

export default authService;