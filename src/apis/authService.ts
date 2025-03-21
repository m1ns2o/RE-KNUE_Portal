import axios from "axios";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import axiosInstance from "./axiosWithCookies";
/**
 * 인증 관련 서비스
 */

const LOGIN_SERVER_URL =
	Platform.OS === "android"
		? "http://10.0.2.2:3000" // 안드로이드 에뮬레이터용
		: // ? "http://192.168.1.100:3000"  // 실제 기기용 (해당 IP로 변경 필요)
		  "http://localhost:3000"; // iOS용

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
			// axios 인스턴스 대신 기본 axios를 사용하여 직접 URL로 요청
			const response = await axiosInstance.post(
				`${LOGIN_SERVER_URL}/login`,
				new URLSearchParams({
					userNo,
					password,
					rememberMe: "N",
				}).toString(),
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
					withCredentials: true, // 쿠키 전송을 위해 필요한 경우
				}
			);

			// 로그인 성공 여부 확인 (응답 상태로 확인)
			const isLoginSuccess = response.status === 200;

			if (isLoginSuccess) {
				// 로그인 상태 저장
				await AsyncStorage.setItem("isLoggedIn", "true");
				await AsyncStorage.setItem("userNo", userNo);

				// iOS 플랫폼일 경우 쿠키 데이터 처리
				if (Platform.OS === "ios") {
					// 응답 바디에서 parsedCookies 가져오기
					const parsedCookies = response.data?.parsedCookies;

					if (parsedCookies) {
						// 쿠키 정보를 JSON 문자열로 저장
						const cookiesStr = JSON.stringify(parsedCookies);
						await AsyncStorage.setItem("cookies", cookiesStr);
						console.log("iOS: 쿠키 정보가 저장되었습니다.");
					} else {
						console.warn("iOS: 저장할 쿠키 정보가 없습니다.");
					}
				}

				// 인증 정보 저장 (요청 시)
				if (rememberCredentials) {
					await SecureStore.setItemAsync("userNo", userNo);
					await SecureStore.setItemAsync("password", password);
				}
			}

			return isLoginSuccess;
		} catch (error) {
			console.error("로그인 중 오류 발생:", error);
			return false;
		}
	},

	/**
	 * 로그아웃 함수
	 * @returns 로그아웃 성공 여부
	 */
	logout: async (): Promise<boolean> => {
		try {
			// 로그아웃 API 호출 (필요한 경우)
			// await axios.get(`${LOGIN_SERVER_URL}/logout`, { withCredentials: true });

			// 로그인 상태 제거
			await AsyncStorage.removeItem("isLoggedIn");

			// iOS 플랫폼일 경우 저장된 쿠키 정보 제거
			if (Platform.OS === "ios") {
				// 쿠키 문자열 삭제
				await AsyncStorage.removeItem("cookies");
			}

			// 인증 정보 제거
			await SecureStore.deleteItemAsync("userNo");
			await SecureStore.deleteItemAsync("password");

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
	 * 저장된 쿠키 정보 가져오기 (iOS용)
	 * @returns 저장된 쿠키 JSON 문자열 또는 null
	 */
	getSavedCookies: async (): Promise<string | null> => {
		try {
			// iOS 플랫폼일 경우에만 처리
			if (Platform.OS === "ios") {
				return await AsyncStorage.getItem("cookies");
			}
			return null;
		} catch (error) {
			console.error("저장된 쿠키 정보 가져오기 중 오류 발생:", error);
			return null;
		}
	},
};

export default authService;
