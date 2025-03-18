import axios from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

// 플랫폼에 따른 서버 URL 설정
const LOGIN_SERVER_URL =
	Platform.OS === "android"
		? "http://10.0.2.2:3000" // 안드로이드 에뮬레이터용
		: // ? "http://192.168.1.100:3000"  // 실제 기기용 (해당 IP로 변경 필요)
		  "http://localhost:3000"; // iOS용

// 플랫폼에 따른 Axios 인스턴스 생성
const createAxiosInstance = () => {
	// iOS의 경우 기존 방식 사용 (쿠키 수동 관리)
	if (Platform.OS === "ios") {
		return axios.create({
			timeout: 15000,
			withCredentials: true,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
				"Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
				"Cache-Control": "no-cache",
				Pragma: "no-cache",
			},
		});
	}
	// Android의 경우 CookieJar 사용
	else {
		const jar = new CookieJar();
		return wrapper(
			axios.create({
				timeout: 15000,
				jar,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Accept:
						"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
					"Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
				},
			})
		);
	}
};

// 쿠키 저장 함수 (iOS용)
const saveCookies = async (cookies: string | undefined) => {
	if (!cookies || Platform.OS !== "ios") return;

	try {
		await AsyncStorage.setItem("cookies", cookies);
		console.log("쿠키 저장됨");
	} catch (error) {
		console.error("쿠키 저장 중 오류:", error);
	}
};

// 쿠키 불러오기 함수 (iOS용)
const loadCookies = async () => {
	if (Platform.OS !== "ios") return null;

	try {
		return await AsyncStorage.getItem("cookies");
	} catch (error) {
		console.error("쿠키 불러오기 중 오류:", error);
		return null;
	}
};

// 초기 인스턴스 생성
let axiosInstance = createAxiosInstance();

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
			console.log("로그인 시도 중...");
			console.log(`서버 URL: ${LOGIN_SERVER_URL}`);

			// iOS인 경우 저장된 쿠키 불러오기
			if (Platform.OS === "ios") {
				const savedCookies = await loadCookies();
				if (savedCookies) {
					axiosInstance.defaults.headers.Cookie = savedCookies;
				}
			}

			// 로그인 요청 전송
			console.log("로그인 요청 전송 중...");
			const response = await axiosInstance.post(
				`${LOGIN_SERVER_URL}/login`,
				new URLSearchParams({
					userNo,
					password,
				}).toString(),
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				}
			);

			console.log("로그인 응답:", response.status);

			// iOS의 경우 쿠키 수동 저장
			if (Platform.OS === "ios" && response.headers["set-cookie"]) {
				await saveCookies(response.headers["set-cookie"].join("; "));
			}

			// 로그인 성공 여부 확인
			const isLoginSuccess = response.status === 200;

			if (isLoginSuccess) {
				console.log("로그인 성공");

				// 로그인 상태 저장
				await AsyncStorage.setItem("isLoggedIn", "true");
				await AsyncStorage.setItem("userNo", userNo);

				// 인증 정보 저장 (요청 시)
				if (rememberCredentials) {
					await SecureStore.setItemAsync("userNo", userNo);
					await SecureStore.setItemAsync("password", password);
				}

				return true;
			}

			console.log("로그인 실패:", response.data);
			return false;
		} catch (error: any) {
			// 오류 상세 정보 로깅
			console.error("로그인 중 오류 발생:", error);

			if (error.response) {
				console.error("응답 상태:", error.response.status);
				console.error("응답 헤더:", JSON.stringify(error.response.headers));
				console.error("응답 데이터:", error.response.data);
			} else if (error.request) {
				console.error("요청은 전송되었으나 응답 없음");
				console.error("요청 URL:", `${LOGIN_SERVER_URL}/login`);
				console.error("요청 정보:", error.request);
			} else {
				console.error("오류 메시지:", error.message);
			}

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
			console.log("로그아웃 시도 중...");

			// 로그아웃 API 호출 (필요한 경우)
			try {
				await axiosInstance.get(`${LOGIN_SERVER_URL}/logout`);
			} catch (logoutError) {
				console.warn("로그아웃 API 호출 중 오류 발생 (무시됨):", logoutError);
				// 로그아웃 API 호출 실패는 무시하고 계속 진행
			}

			// iOS의 경우 저장된 쿠키 삭제
			if (Platform.OS === "ios") {
				await AsyncStorage.removeItem("cookies");
				delete axiosInstance.defaults.headers.Cookie;
			}
			// Android의 경우 CookieJar 재생성
			else {
				axiosInstance = createAxiosInstance();
			}

			// 로그인 상태 제거
			await AsyncStorage.removeItem("isLoggedIn");

			// 인증 정보 제거 (요청 시)
			if (clearCredentials) {
				await SecureStore.deleteItemAsync("userNo");
				await SecureStore.deleteItemAsync("password");
			}

			console.log("로그아웃 성공");
			return true;
		} catch (error) {
			console.error("로그아웃 중 오류 발생:", error);
			return false;
		}
	},

	/**
	 * 로그인 상태 확인
	 * @returns 로그인 상태 여부
	 */
	isLoggedIn: async (): Promise<boolean> => {
		try {
			const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
			return isLoggedIn === "true";
		} catch (error) {
			console.error("로그인 상태 확인 중 오류 발생:", error);
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
			const userNo = await SecureStore.getItemAsync("userNo");
			const password = await SecureStore.getItemAsync("password");

			if (userNo && password) {
				return { userNo, password };
			}

			return null;
		} catch (error) {
			console.error("저장된 인증 정보 확인 중 오류 발생:", error);
			return null;
		}
	},

	/**
	 * 세션 유효성 검사
	 * @returns 세션이 유효하면 true, 아니면 false
	 */
	validateSession: async (): Promise<boolean> => {
		try {
			console.log("세션 유효성 검사 중...");

			// iOS인 경우 저장된 쿠키 불러오기
			if (Platform.OS === "ios") {
				const savedCookies = await loadCookies();
				if (savedCookies) {
					axiosInstance.defaults.headers.Cookie = savedCookies;
				}
			}

			// 간단한 API 호출로 세션 유효성 확인
			const response = await axiosInstance.get(
				`${LOGIN_SERVER_URL}/api/check-session`,
				{
					timeout: 5000, // 짧은 타임아웃 설정
				}
			);

			console.log("세션 검사 응답:", response.status);
			return response.status === 200;
		} catch (error) {
			console.warn("세션 유효성 검사 중 오류 발생:", error);
			return false; // 오류 발생 시 세션 무효로 간주
		}
	},

	/**
	 * Axios 인스턴스 가져오기 (다른 API 요청에서 사용)
	 */
	getAxiosInstance: () => {
		return axiosInstance;
	},
};

export default authService;
