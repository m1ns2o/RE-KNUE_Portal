import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 리다이렉트 제한 및 쿠키 지원이 설정된 Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: 'https://mpot.knue.ac.kr',
  maxRedirects: 5, // 리다이렉트 최대 5회로 제한
  timeout: 15000, // 15초 타임아웃 설정
  withCredentials: true, // 쿠키 유지
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  }
});

// 리다이렉션 처리를 위한 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // 네트워크 오류나 타임아웃 처리
    if (!error.response) {
      console.log('네트워크 오류 또는 서버 응답 없음:', error.message);
      return Promise.reject(error);
    }

    // 리다이렉션 응답 처리 (300-399)
    if (error.response.status >= 300 && error.response.status < 400) {
      const newUrl = error.response.headers.location;
      if (newUrl) {
        console.log(`리다이렉션 감지: ${newUrl}`);
        const originalRequest = error.config;
        
        // 상대 경로인 경우 처리
        if (newUrl.startsWith('/')) {
          originalRequest.url = newUrl;
        } else {
          // 절대 URL인 경우 baseURL 무시하고 직접 설정
          originalRequest.baseURL = '';
          originalRequest.url = newUrl;
        }
        
        return axiosInstance(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * 인증 관련 서비스
 */
const authService = {
  /**
   * 로그인 함수
   * @param userNo 사용자 학번/교번
   * @param password 비밀번호
   * @param rememberCredentials 인증 정보 저장 여부
   * @returns 로그인 성공 시 응답 데이터, 실패 시 null
   */
  login: async (
    userNo: string,
    password: string,
    rememberCredentials: boolean = true
  ): Promise<string | null> => {
    try {
      console.log('로그인 시도 중...');
      
      // 로그인 요청 전송
      const response = await axiosInstance.post(
        '/common/login',
        new URLSearchParams({
          userNo,
          password,
          rememberMe: 'Y',
        }).toString(),
        {
          validateStatus: (status) => {
            // 200뿐만 아니라 리다이렉션 상태 코드도 성공으로 처리
            return (status >= 200 && status < 300) || (status >= 300 && status < 400);
          }
        }
      );

      // 로그인 성공 여부 확인 (2xx 상태 코드)
      const isLoginSuccess = response.status >= 200 && response.status < 300;

      if (isLoginSuccess) {
        console.log('로그인 성공');
        
        // 로그인 상태 저장
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('userNo', userNo);

        // 인증 정보 저장 (요청 시)
        if (rememberCredentials) {
          await SecureStore.setItemAsync('userNo', userNo);
          await SecureStore.setItemAsync('password', password);
        }

        return typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data);
      } else if (response.status >= 300 && response.status < 400) {
        // 리다이렉션이 발생했지만 처리됨
        console.log('로그인 중 리다이렉션 처리됨:', response.status);
        
        // 로그인 상태 저장
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('userNo', userNo);

        // 인증 정보 저장 (요청 시)
        if (rememberCredentials) {
          await SecureStore.setItemAsync('userNo', userNo);
          await SecureStore.setItemAsync('password', password);
        }

        return typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data);
      }

      console.log('로그인 실패:', response.status);
      return null;
    } catch (error: any) {
      // 오류 상세 정보 로깅
      console.error('로그인 중 오류 발생:', error);
      
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 헤더:', JSON.stringify(error.response.headers));
      } else if (error.request) {
        console.error('요청은 전송되었으나 응답 없음');
      } else {
        console.error('오류 메시지:', error.message);
      }
      
      return null;
    }
  },

  /**
   * 로그아웃 함수
   * @param clearCredentials 저장된 인증 정보도 삭제할지 여부
   * @returns 로그아웃 성공 여부
   */
  logout: async (clearCredentials: boolean = false): Promise<boolean> => {
    try {
      console.log('로그아웃 시도 중...');
      
      // 로그아웃 API 호출 (필요한 경우)
      try {
        await axiosInstance.get('/logout');
      } catch (logoutError) {
        console.warn('로그아웃 API 호출 중 오류 발생 (무시됨):', logoutError);
        // 로그아웃 API 호출 실패는 무시하고 계속 진행
      }

      // 로그인 상태 제거
      await AsyncStorage.removeItem('isLoggedIn');

      // 인증 정보 제거 (요청 시)
      if (clearCredentials) {
        await SecureStore.deleteItemAsync('userNo');
        await SecureStore.deleteItemAsync('password');
      }

      console.log('로그아웃 성공');
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
  getSavedCredentials: async (): Promise<{
    userNo: string;
    password: string;
  } | null> => {
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
  },
  
  /**
   * 세션 유효성 검사
   * @returns 세션이 유효하면 true, 아니면 false
   */
  validateSession: async (): Promise<boolean> => {
    try {
      // 간단한 API 호출로 세션 유효성 확인
      const response = await axiosInstance.get('/api/check-session', {
        timeout: 5000 // 짧은 타임아웃 설정
      });
      return response.status === 200;
    } catch (error) {
      console.warn('세션 유효성 검사 중 오류 발생:', error);
      return false; // 오류 발생 시 세션 무효로 간주
    }
  }
};

export default authService;