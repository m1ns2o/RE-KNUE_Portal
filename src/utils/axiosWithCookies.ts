import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

// 기본 헤더 설정
const getDefaultHeaders = () => ({
  "Content-Type": "application/x-www-form-urlencoded",
  host: "mpot.knue.ac.kr",
  connection: "keep-alive",
  pragma: "no-cache",
  "cache-control": "no-cache",
  origin: "https://mpot.knue.ac.kr",
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (Linux; Android 5.1.1; SM-G977N Build/LMY48Z; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 acanet/knue",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
  "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
  "x-requested-with": "kr.acanet.knueapp",
});

// CookieJar 인스턴스 생성
const jar = new CookieJar();

// axios 인스턴스 생성 및 쿠키 지원 추가
const axiosInstance = wrapper(axios.create({
  baseURL: 'https://mpot.knue.ac.kr',
  jar, // 쿠키 자동 관리를 위한 jar 설정
  headers: getDefaultHeaders(),
  withCredentials: true, 
}));

// axios 오류 처리를 위한 인터셉터 설정
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // 오류 상세 로깅
    if (error.response) {
      // 서버가 응답을 반환했지만 오류 상태 코드를 보냄
      console.error('응답 오류:', error.response.status, error.response.statusText);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      console.error('요청 오류: 응답 없음', error.request);
    } else {
      // 요청 설정 중 오류 발생
      console.error('요청 설정 오류:', error.message);
    }
    return Promise.reject(error);
  }
);

// HTML 응답을 처리하기 위한 유틸리티 함수
export const parseHtmlResponse = (htmlString: string) => {
  // HTML 파싱 로직 (필요시 cheerio 등 이용)
  return htmlString;
};

// axios 인스턴스 내보내기
export default axiosInstance;