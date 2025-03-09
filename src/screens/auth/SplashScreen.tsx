// src/screens/SplashScreen.tsx
import React, { useEffect } from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import { NavigationProps } from "../../types/navigation"; // 분리된 타입 파일에서 가져오기

const SplashScreen = () => {
	const theme = useTheme();
	const navigation = useNavigation<NavigationProps>();

	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				// SecureStorage에서 저장된 로그인 정보 가져오기
				const userNo = await SecureStore.getItemAsync("userNo");
				const password = await SecureStore.getItemAsync("password");

				// 저장된 정보가 있는지 확인
				if (userNo && password) {
					// 자동 로그인 시도
					const loginResult = await attemptAutoLogin(userNo, password);

					if (loginResult) {
						// 로그인 성공 시 홈 화면으로 이동
						navigation.reset({
							index: 0,
							routes: [{ name: "Home" }],
						});
					} else {
						// 로그인 실패 시 로그인 화면으로 이동
						navigation.reset({
							index: 0,
							routes: [{ name: "Login" }],
						});
					}
				} else {
					// 저장된 정보가 없으면 로그인 화면으로 이동
					navigation.reset({
						index: 0,
						routes: [{ name: "Login" }],
					});
				}
			} catch (error) {
				console.error("자동 로그인 중 오류 발생:", error);
				// 오류 발생 시 로그인 화면으로 이동
				navigation.reset({
					index: 0,
					routes: [{ name: "Login" }],
				});
			}
		};

		// 2초 후 로그인 상태 확인 (스플래시 화면 표시를 위한 딜레이)
		const timer = setTimeout(() => {
			checkLoginStatus();
		}, 2000);

		return () => clearTimeout(timer);
	}, [navigation]);

	// 자동 로그인 함수
	const attemptAutoLogin = async (
		userNo: string,
		password: string
	): Promise<boolean> => {
		try {
			// KNUE 통합학사 시스템 로그인 API 호출
			const response = await fetch("https://mpot.knue.ac.kr/common/login", {
				method: "POST",
				headers: {
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
					referer: "https://mpot.knue.ac.kr/common/login",
					"accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
					"x-requested-with": "kr.acanet.knueapp",
				},
				body: new URLSearchParams({
					userNo: userNo,
					password: password,
					rememberMe: "N",
				}).toString(),
			});

			// 응답 헤더 확인
			const setCookieHeader = response.headers.get("set-cookie");

			// 로그인 성공 판단: 쿠키 헤더가 있으면 성공, 없으면 실패
			const isLoginSuccess = setCookieHeader !== null;

			if (isLoginSuccess) {
				// 쿠키 저장
				await AsyncStorage.setItem("authCookies", setCookieHeader || "");

				// 사용자 정보 저장
				await AsyncStorage.setItem("userNo", userNo);
				await AsyncStorage.setItem("isLoggedIn", "true");

				return true;
			} else {
				// 로그인 실패
				return false;
			}
		} catch (error) {
			console.error("자동 로그인 API 호출 중 오류:", error);
			return false;
		}
	};

	return (
		<View
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<Image
				source={require("../../../assets/images/symbol.png")}
				style={styles.logo}
				resizeMode="contain"
			/>
			<ActivityIndicator
				size="large"
				color={theme.colors.primary}
				style={styles.loading}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	logo: {
		width: 180,
		height: 150,
		marginBottom: 30,
	},
	loading: {
		marginTop: 20,
	},
});

export default SplashScreen;
