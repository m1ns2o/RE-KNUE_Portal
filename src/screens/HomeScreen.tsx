import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Alert,
	ActivityIndicator,
} from "react-native";
import { Button, Surface, useTheme } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DatePickerModal } from "react-native-paper-dates";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// DatePicker 결과를 위한 인터페이스 정의
interface DateRange {
	startDate: Date | undefined;
	endDate: Date | undefined;
}

const TripRequestScreen = () => {
	const theme = useTheme();
	const insets = useSafeAreaInsets();
	const [range, setRange] = useState<DateRange>({
		startDate: undefined,
		endDate: undefined,
	});
	const [open, setOpen] = useState(false);
	const [hakbeon, setHakbeon] = useState("");
	const [loading, setLoading] = useState(false);

	// 화면에 포커스가 맞춰질 때마다 날짜를 초기화하는 함수
	const resetDateRange = useCallback(() => {
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		setRange({ startDate: today, endDate: tomorrow });
	}, []);

	// 화면에 포커스가 맞춰질 때마다 날짜 초기화
	useFocusEffect(
		useCallback(() => {
			resetDateRange();
			return () => {};
		}, [resetDateRange])
	);

	// DatePicker 모달 관련 함수
	const onDismiss = useCallback(() => {
		setOpen(false);
	}, []);

	const onConfirm = useCallback((params: DateRange) => {
		setOpen(false);
		setRange(params);
	}, []);

	// 사용자 학번 불러오기
	useEffect(() => {
		const loadUserInfo = async () => {
			try {
				const userNo = await AsyncStorage.getItem("userNo");
				if (userNo) {
					setHakbeon(userNo);
				}
			} catch (error) {
				console.error("사용자 정보 불러오기 실패:", error);
			}
		};

		loadUserInfo();
		// 초기 렌더링시에도 날짜 초기화
		resetDateRange();
	}, [resetDateRange]);

	// 폼 제출 핸들러
	const handleSubmit = async () => {
		// 필수 입력값 확인
		if (!hakbeon) {
			Alert.alert("입력 오류", "학번 정보가 없습니다. 다시 로그인해주세요.");
			return;
		}

		if (!range.startDate || !range.endDate) {
			Alert.alert("입력 오류", "시작일과 종료일을 모두 선택해주세요.");
			return;
		}

		// 날짜 형식 변환 (YYYY-MM-DD)
		const formattedStartDate = format(range.startDate, "yyyy-MM-dd");
		const formattedEndDate = format(range.endDate, "yyyy-MM-dd");

		setLoading(true);

		try {
			// 쿠키 가져오기
			const authCookies = await AsyncStorage.getItem("authCookies");

			if (!authCookies) {
				Alert.alert(
					"로그인 오류",
					"로그인 정보가 만료되었습니다. 다시 로그인해주세요."
				);
				setLoading(false);
				return;
			}

			// 폼 데이터 준비
			const formData = new URLSearchParams();
			formData.append("tripType", "2"); // 외박은 2, 외출은 1
			formData.append("tripTargetPlace", "1"); // 타 지역은 1, 본가는 2
			formData.append("startDate", formattedStartDate);
			formData.append("endDate", formattedEndDate);
			formData.append("tripReason", ""); // 사유 필드 제거됨
			formData.append("menuId", "341");
			formData.append("enteranceInfoSeq", "1247"); // 필요에 따라 변경 가능
			formData.append("hakbeon", hakbeon);

			// API 호출
			const response = await fetch(
				"https://mpot.knue.ac.kr/dormitory/student/trip/apply",
				{
					method: "POST",
					headers: {
						host: "mpot.knue.ac.kr",
						connection: "keep-alive",
						pragma: "no-cache",
						"cache-control": "no-cache",
						origin: "https://mpot.knue.ac.kr",
						"upgrade-insecure-requests": "1",
						"user-agent":
							"Mozilla/5.0 (Linux; Android 5.1.1; SM-G977N Build/LMY48Z; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.136 Mobile Safari/537.36 acanet/knue",
						"content-type": "application/x-www-form-urlencoded",
						accept:
							"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
						referer:
							"https://mpot.knue.ac.kr/dormitory/student/trip?menuId=341&popupTitle=%EC%99%B8%EB%B0%95%EC%8B%A0%EC%B2%AD&popupType=0",
						"accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
						"x-requested-with": "kr.acanet.knueapp",
						cookie: authCookies,
					},
					body: formData.toString(),
				}
			);

			// 응답 확인
			if (response.ok) {
				Alert.alert("신청 완료", "외박 신청이 성공적으로 제출되었습니다.");
				// 폼 초기화 - 당일/익일로 다시 설정
				resetDateRange();
			} else {
				const responseText = await response.text();
				console.error("신청 실패:", responseText);
				Alert.alert(
					"신청 실패",
					"외박 신청 중 오류가 발생했습니다. 다시 시도해주세요."
				);
			}
		} catch (error) {
			console.error("API 호출 오류:", error);
			Alert.alert(
				"오류 발생",
				"네트워크 오류가 발생했습니다. 다시 시도해주세요."
			);
		} finally {
			setLoading(false);
		}
	};

	// 렌더링 전 날짜 존재 여부 확인
	const hasValidDateRange = range.startDate && range.endDate;

	// 날짜 형식화를
	const formatDateSafely = (
		date: Date | undefined,
		formatString: string
	): string => {
		return date ? format(date, formatString) : "";
	};

	// 체류 기간 계산
	const calculateDuration = (): number => {
		if (range.startDate && range.endDate) {
			return (
				Math.ceil(
					(range.endDate.getTime() - range.startDate.getTime()) /
						(1000 * 60 * 60 * 24)
				) + 1
			);
		}
		return 0;
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<ScrollView style={styles.scrollView}>
				<Surface style={styles.formContainer}>
					<Text style={[styles.title, { color: theme.colors.primary }]}>
						외박 신청
					</Text>

					{/* 기간 선택 버튼 */}
					<View style={styles.section}>
						<Button
							mode="outlined"
							onPress={() => setOpen(true)}
							style={styles.dateRangeButton}
							icon="calendar"
						>
							{hasValidDateRange
								? `${formatDateSafely(
										range.startDate,
										"yyyy/MM/dd"
								  )} - ${formatDateSafely(range.endDate, "yyyy/MM/dd")}`
								: "날짜를 선택하세요"}
						</Button>

						<DatePickerModal
							locale="ko"
							mode="range"
							visible={open}
							onDismiss={onDismiss}
							startDate={range.startDate}
							endDate={range.endDate}
							onConfirm={onConfirm}
							// 추가 옵션
							saveLabel="저장"
							label="날짜 범위 선택"
							startLabel="시작일"
							endLabel="종료일"
							animationType="slide"
						/>
					</View>

					{/* 제출 버튼 */}
					<Button
						mode="contained"
						onPress={handleSubmit}
						style={styles.submitButton}
						disabled={loading || !hasValidDateRange}
						icon="check"
					>
						{loading ? "제출 중..." : "외박 신청하기"}
					</Button>

					{loading && (
						<ActivityIndicator
							size="large"
							color={theme.colors.primary}
							style={styles.loadingIndicator}
						/>
					)}
				</Surface>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		// SafeArea 인셋을 사용하므로 하드코딩된 paddingTop 제거
	},
	scrollView: {
		flex: 1,
	},
	formContainer: {
		margin: 16,
		padding: 16,
		borderRadius: 8,
		elevation: 4,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 24,
		textAlign: "center",
	},
	section: {
		marginBottom: 20,
		alignItems: "center",
	},
	dateRangeButton: {
		width: "100%",
		paddingVertical: 10,
		borderRadius: 8,
	},
	dateRangeSummary: {
		backgroundColor: "#f0f0f0",
		padding: 16,
		borderRadius: 8,
		marginBottom: 20,
		alignItems: "center",
	},
	dateRangeSummaryText: {
		fontSize: 16,
		textAlign: "center",
		lineHeight: 24,
	},
	durationText: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 8,
		color: "#0090D6",
	},
	submitButton: {
		marginTop: 20,
		paddingVertical: 8,
		borderRadius: 8,
	},
	loadingIndicator: {
		marginTop: 20,
	},
});

export default TripRequestScreen;
