// src/screens/auth/LoginScreen.tsx
import React, { useState } from "react";
import {
	StyleSheet,
	View,
	KeyboardAvoidingView,
	Platform,
	Image,
	Text,
} from "react-native";
import {
	TextInput,
	Button,
	HelperText,
	Snackbar,
	useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NavigationProps } from "../../types/navigation"; // 외부 타입 파일에서 가져오기
import authService from "../../apis/authService"; // 새로 만든 인증 서비스 import

const LoginScreen: React.FC = () => {
	const theme = useTheme();
	const navigation = useNavigation<NavigationProps>();
	const [studentId, setStudentId] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [secureTextEntry, setSecureTextEntry] = useState<boolean>(true);
	const [studentIdError, setStudentIdError] = useState<string>("");
	const [passwordError, setPasswordError] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
	const [snackbarMessage, setSnackbarMessage] = useState<string>("");

	const validateStudentId = (): boolean => {
		// 학번 유효성 검사 - 숫자로만 구성되고 길이가 적절한지 확인
		const studentIdRegex = /^\d{8}$/;
		if (!studentId) {
			setStudentIdError("학번을 입력해주세요");
			return false;
		} else if (!studentIdRegex.test(studentId)) {
			setStudentIdError("유효한 학번을 입력해주세요 (8자리 숫자)");
			return false;
		}
		setStudentIdError("");
		return true;
	};

	const validatePassword = (): boolean => {
		if (!password) {
			setPasswordError("비밀번호를 입력해주세요");
			return false;
		} else if (password.length < 6) {
			setPasswordError("비밀번호는 최소 6자 이상이어야 합니다");
			return false;
		}
		setPasswordError("");
		return true;
	};

	const handleLogin = async (): Promise<void> => {
		const isStudentIdValid = validateStudentId();
		const isPasswordValid = validatePassword();

		if (isStudentIdValid && isPasswordValid) {
			setIsLoading(true);
			try {
				// 새로운 authService를 사용하여 로그인
				const isLoginSuccess = await authService.login(
					studentId,
					password,
					true // 자동 로그인을 위해 인증 정보 저장
				);

				console.log("로그인 결과:", isLoginSuccess ? "성공" : "실패");

				if (isLoginSuccess) {
					// 로그인 성공
					setSnackbarMessage("로그인에 성공했습니다!");
					setSnackbarVisible(true);

					// 홈 화면으로 이동
					navigation.navigate("Trip");
				} else {
					// 로그인 실패
					setSnackbarMessage(
						"로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요."
					);
					setSnackbarVisible(true);
				}
			} catch (error) {
				console.error("로그인 오류:", error);
				setSnackbarMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
				setSnackbarVisible(true);
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.colors.background }]}
		>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.keyboardAvoidingView}
			>
				<View style={styles.formContainer}>
					{/* PNG 이미지 로고 */}
					<View style={styles.logoContainer}>
						<Image
							source={require("../../../assets/images/symbol.png")}
							style={styles.logo}
							resizeMode="contain"
						/>
					</View>

					<View style={styles.inputsContainer}>
						<TextInput
							label="학번"
							value={studentId}
							onChangeText={setStudentId}
							onBlur={validateStudentId}
							style={styles.input}
							mode="outlined"
							keyboardType="number-pad"
							maxLength={8}
							autoCapitalize="none"
							error={!!studentIdError}
							disabled={isLoading}
							left={<TextInput.Icon icon="account" />}
							theme={{ colors: { primary: theme.colors.primary } }}
						/>
						{!!studentIdError && (
							<HelperText type="error">{studentIdError}</HelperText>
						)}

						<TextInput
							label="비밀번호"
							value={password}
							onChangeText={setPassword}
							onBlur={validatePassword}
							style={styles.input}
							mode="outlined"
							secureTextEntry={secureTextEntry}
							error={!!passwordError}
							disabled={isLoading}
							left={<TextInput.Icon icon="lock" />}
							right={
								<TextInput.Icon
									icon={secureTextEntry ? "eye" : "eye-off"}
									onPress={() => setSecureTextEntry(!secureTextEntry)}
								/>
							}
							theme={{ colors: { primary: theme.colors.primary } }}
						/>
						{!!passwordError && (
							<HelperText type="error">{passwordError}</HelperText>
						)}
					</View>

					<Button
						mode="contained"
						onPress={handleLogin}
						style={styles.button}
						loading={isLoading}
						disabled={isLoading}
					>
						로그인
					</Button>

					{/* 푸터 메시지 추가 */}
					<View style={styles.footerContainer}>
						<Text style={styles.footerText}>
							교원대학교 비공식 통합학사 시스템
						</Text>
					</View>
				</View>
			</KeyboardAvoidingView>

			<Snackbar
				visible={snackbarVisible}
				onDismiss={() => setSnackbarVisible(false)}
				duration={3000}
				action={{
					label: "닫기",
					onPress: () => setSnackbarVisible(false),
				}}
			>
				{snackbarMessage}
			</Snackbar>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	keyboardAvoidingView: {
		flex: 1,
	},
	formContainer: {
		flex: 1,
		justifyContent: "center",
		paddingHorizontal: 30,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	logo: {
		width: 150,
		height: 120,
	},
	inputsContainer: {
		marginBottom: 10,
	},
	input: {
		marginBottom: 12,
		backgroundColor: "white",
	},
	button: {
		marginTop: 10,
		paddingVertical: 8,
		borderRadius: 8,
	},
	// 푸터 스타일 추가
	footerContainer: {
		marginTop: 50,
		alignItems: "center",
	},
	footerText: {
		fontSize: 12,
		color: "#666",
	},
});

export default LoginScreen;
