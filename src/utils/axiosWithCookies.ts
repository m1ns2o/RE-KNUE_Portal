import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { parse } from "cookie";

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

// iOS에서 사용할 쿠키 저장소 키
const COOKIES_STORAGE_KEY = "app_cookies";

// 쿠키 관리 유틸리티
const cookieManager = {
	// 쿠키 저장
	async saveCookies(cookies: Record<string, string>): Promise<void> {
		try {
			await AsyncStorage.setItem(COOKIES_STORAGE_KEY, JSON.stringify(cookies));
			console.log("쿠키 저장됨:", cookies);
		} catch (error) {
			console.error("쿠키 저장 중 오류:", error);
		}
	},

	// 저장된 쿠키 불러오기
	async loadCookies(): Promise<Record<string, string>> {
		try {
			const cookiesString = await AsyncStorage.getItem(COOKIES_STORAGE_KEY);
			const cookies = cookiesString ? JSON.parse(cookiesString) : {};
			console.log("저장된 쿠키 불러옴:", cookies);
			return cookies;
		} catch (error) {
			console.error("쿠키 불러오기 중 오류:", error);
			return {};
		}
	},

	// 쿠키 객체를 헤더 문자열로 변환
	cookiesToString(cookies: Record<string, string>): string {
		return Object.entries(cookies)
			.map(([name, value]) => `${name}=${value}`)
			.join("; ");
	},

	// 응답 헤더에서 쿠키 추출 및 저장
	async extractAndSaveCookies(headers: any): Promise<void> {
		try {
			// 현재 저장된 쿠키 불러오기
			const cookies = await this.loadCookies();

			// 'set-cookie' 헤더가 배열인 경우
			const setCookies = headers["set-cookie"] || [];

			// 모든 set-cookie 헤더 처리
			if (Array.isArray(setCookies)) {
				setCookies.forEach((cookieStr) => {
					// cookie-parser를 사용하여 쿠키 파싱
					const parsedCookie = parse(cookieStr);

					// 쿠키 이름과 값 추출
					Object.keys(parsedCookie).forEach((name) => {
						if (
							name !== "path" &&
							name !== "expires" &&
							name !== "domain" &&
							name !== "secure" &&
							name !== "httponly"
						) {
							cookies[name] = parsedCookie[name];
						}
					});
				});
			} else if (typeof setCookies === "string") {
				// 단일 쿠키 문자열인 경우
				const parsedCookie = parse(setCookies);
				Object.keys(parsedCookie).forEach((name) => {
					if (
						name !== "path" &&
						name !== "expires" &&
						name !== "domain" &&
						name !== "secure" &&
						name !== "httponly"
					) {
						cookies[name] = parsedCookie[name];
					}
				});
			}

			// 변경된 쿠키 저장
			await this.saveCookies(cookies);
		} catch (error) {
			console.error("쿠키 추출 및 저장 중 오류:", error);
		}
	},
};

// axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
	baseURL: "https://mpot.knue.ac.kr",
	headers: getDefaultHeaders(),
	withCredentials: true,
});

// 요청 인터셉터 추가
axiosInstance.interceptors.request.use(
	async (config) => {
		// 저장된 쿠키 불러오기
		const cookies = await cookieManager.loadCookies();

		// 쿠키가 있으면 요청 헤더에 추가
		if (Object.keys(cookies).length > 0) {
			const cookieString = cookieManager.cookiesToString(cookies);
			config.headers["Cookie"] = cookieString;
			console.log("요청에 쿠키 추가:", cookieString);
		}

		return config;
	},
	(error) => {
		console.error("요청 인터셉터 오류:", error);
		return Promise.reject(error);
	}
);

// 응답 인터셉터 추가
axiosInstance.interceptors.response.use(
	async (response) => {
		// 응답 헤더에서 쿠키 추출 및 저장
		if (
			response.headers &&
			(response.headers["set-cookie"] || response.headers["Set-Cookie"])
		) {
			await cookieManager.extractAndSaveCookies(response.headers);
		}

		// iOS에서는 응답 데이터에 쿠키가 포함될 수 있음
		if (Platform.OS === "ios" && response.data && response.data.cookies) {
			const dataCookies: Record<string, string> = {};

			// 응답 데이터의 쿠키 처리
			Object.entries(response.data.cookies).forEach(([name, value]) => {
				if (typeof value === "string") {
					dataCookies[name] = value;
				}
			});

			// 기존 쿠키와 병합하여 저장
			const currentCookies = await cookieManager.loadCookies();
			await cookieManager.saveCookies({ ...currentCookies, ...dataCookies });
		}

		return response;
	},
	(error) => {
		console.error("응답 오류:", error);

		// 오류 응답에서도 쿠키 추출 시도
		if (
			error.response &&
			error.response.headers &&
			(error.response.headers["set-cookie"] ||
				error.response.headers["Set-Cookie"])
		) {
			cookieManager.extractAndSaveCookies(error.response.headers);
		}

		return Promise.reject(error);
	}
);

// 쿠키 수동 관리 유틸리티 함수 export
export const cookieUtils = {
	// 쿠키 저장
	saveCookies: cookieManager.saveCookies.bind(cookieManager),

	// 쿠키 불러오기
	loadCookies: cookieManager.loadCookies.bind(cookieManager),

	// 쿠키 초기화
	clearCookies: async () => {
		await AsyncStorage.removeItem(COOKIES_STORAGE_KEY);
		console.log("쿠키 초기화됨");
	},
};

export default axiosInstance;
