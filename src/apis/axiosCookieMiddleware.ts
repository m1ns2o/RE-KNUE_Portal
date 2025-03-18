import { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * iOS 플랫폼에서 저장된 쿠키를 요청 헤더에 추가하는 미들웨어
 * @param axiosInstance axios 인스턴스
 */
export const applyiOSCookieMiddleware = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (Platform.OS === "ios") {
        try {
          // AsyncStorage에서 저장된 쿠키 문자열 가져오기
          const cookiesStr = await AsyncStorage.getItem("cookies");
          
          if (cookiesStr) {
            const parsedCookies = JSON.parse(cookiesStr);
            
            // 쿠키를 Cookie 헤더에 설정
            if (Array.isArray(parsedCookies) && parsedCookies.length > 0) {
              // 쿠키 문자열 생성
              const cookieHeader = parsedCookies
                .map(cookie => `${cookie.name}=${cookie.value}`)
                .join("; ");
              
              // 헤더에 쿠키 설정
              config.headers = config.headers || {};
              config.headers.Cookie = cookieHeader;
              
              console.log("iOS: 저장된 쿠키를 요청에 적용했습니다.");
            }
          }
        } catch (error) {
          console.error("iOS 쿠키 적용 중 오류 발생:", error);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

/**
 * 모든 플랫폼에 적용할 쿠키 미들웨어 모음
 * @param axiosInstance axios 인스턴스
 */
export const applyAllCookieMiddleware = (axiosInstance: AxiosInstance) => {
  // iOS 쿠키 미들웨어 적용
  applyiOSCookieMiddleware(axiosInstance);
  
  // 여기에 필요한 다른 플랫폼 쿠키 미들웨어 추가 가능
};