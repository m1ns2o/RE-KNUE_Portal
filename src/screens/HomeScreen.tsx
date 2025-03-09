// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { Appbar, Card, Button, FAB, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { StackNavigationProp } from "@react-navigation/stack";

// 네비게이션 타입 정의
type RootStackParamList = {
	Splash: undefined;
	Login: undefined;
	Home: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

type Props = {
	navigation: HomeScreenNavigationProp;
};

const HomeScreen = ({ navigation }: Props) => {
	const theme = useTheme();
	const [userNo, setUserNo] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// 사용자 정보 불러오기
		const loadUserInfo = async () => {
			try {
				const storedUserNo = await AsyncStorage.getItem("userNo");
				if (storedUserNo) {
					setUserNo(storedUserNo);
				}
			} catch (error) {
				console.error("사용자 정보 로딩 오류:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadUserInfo();
	}, []);

	const handleLogout = async () => {
		try {
			// 로그인 관련 모든 데이터 삭제
			await AsyncStorage.removeItem("authCookies");
			await AsyncStorage.removeItem("userNo");
			await AsyncStorage.removeItem("isLoggedIn");
			await SecureStore.deleteItemAsync("userNo");
			await SecureStore.deleteItemAsync("password");

			// 로그인 화면으로 이동
			navigation.reset({
				index: 0,
				routes: [{ name: "Login" }],
			});
		} catch (error) {
			console.error("로그아웃 중 오류 발생:", error);
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			<Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
				<Appbar.Content
					title="교원대학교 통합학사"
					titleStyle={{ color: "white" }}
				/>
				<Appbar.Action icon="logout" color="white" onPress={handleLogout} />
			</Appbar.Header>

			<ScrollView style={styles.content}>
				<Card style={styles.card} mode="elevated">
					<Card.Title title="환영합니다!" subtitle={`학번: ${userNo}`} />
					<Card.Content>
						<Text style={styles.paragraph}>
							교원대학교 비공식 통합학사 시스템입니다. 필요한 기능을 하단
							메뉴에서 선택하세요.
						</Text>
					</Card.Content>
				</Card>

				{/* 학사 일정 카드 */}
				<Card style={styles.card} mode="elevated">
					<Card.Title title="학사 일정" />
					<Card.Content>
						<Text style={styles.calendarItem}>3월 2일 - 개강</Text>
						<Text style={styles.calendarItem}>3월 15일 - 수강정정 마감</Text>
						<Text style={styles.calendarItem}>4월 20일 - 중간고사 시작</Text>
						<Text style={styles.calendarItem}>6월 15일 - 기말고사 시작</Text>
					</Card.Content>
				</Card>

				{/* 공지사항 카드 */}
				<Card style={styles.card} mode="elevated">
					<Card.Title title="공지사항" />
					<Card.Content>
						<Text style={styles.noticeItem}>
							[중요] 2025학년도 1학기 장학금 신청 안내
						</Text>
						<Text style={styles.noticeItem}>코로나19 예방접종 관련 안내</Text>
						<Text style={styles.noticeItem}>
							수강신청 시스템 일시 점검 안내
						</Text>
					</Card.Content>
					<Card.Actions>
						<Button>더보기</Button>
					</Card.Actions>
				</Card>
			</ScrollView>

			<FAB
				icon="help"
				style={[styles.fab, { backgroundColor: theme.colors.primary }]}
				color="white"
				onPress={() => console.log("도움말 버튼 클릭")}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		padding: 16,
	},
	card: {
		marginBottom: 16,
		elevation: 2,
	},
	paragraph: {
		marginBottom: 12,
		fontSize: 14,
		lineHeight: 20,
	},
	calendarItem: {
		marginBottom: 8,
		fontSize: 14,
	},
	noticeItem: {
		marginBottom: 12,
		fontSize: 14,
		fontWeight: "500",
	},
	fab: {
		position: "absolute",
		margin: 16,
		right: 0,
		bottom: 0,
	},
});

export default HomeScreen;
