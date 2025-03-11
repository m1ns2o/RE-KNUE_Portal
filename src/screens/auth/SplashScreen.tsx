import React, { useEffect } from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import { NavigationProps } from "../../types/navigation";
import authService from "../../apis/authService";

const SplashScreen = () => {
	const theme = useTheme();
	const navigation = useNavigation<NavigationProps>();

	useEffect(() => {
		const checkLoginStatus = async () => {
			try {
				// 저장된 인증 정보 확인
				const savedCredentials = await authService.getSavedCredentials();

				// 저장된 인증 정보가 있는지 확인
				if (savedCredentials) {
					// 자동 로그인 시도
					const { userNo, password } = savedCredentials;
					const isLoginSuccess = await authService.login(userNo, password);

					if (isLoginSuccess) {
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
