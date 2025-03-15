// import React, { useState, useEffect, useCallback } from "react";
// import {
// 	View,
// 	Text,
// 	StyleSheet,
// 	ScrollView,
// 	Alert,
// 	ActivityIndicator,
// 	FlatList,
// } from "react-native";
// import { Button, Surface, useTheme, Divider, Chip } from "react-native-paper";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { DatePickerModal } from "react-native-paper-dates";
// import { format } from "date-fns";
// import { useFocusEffect } from "@react-navigation/native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import apiService from "../apis/apiService"; // API 서비스 import
// import axios, { AxiosError } from "axios";

// // DatePicker 결과를 위한 인터페이스 정의
// interface DateRange {
// 	startDate: Date | undefined;
// 	endDate: Date | undefined;
// }

// // 외박 항목 인터페이스 정의
// interface TripItem {
// 	startDate: string;
// 	endDate: string;
// 	seq: string;
// 	status?: string;
// 	tripType?: string;
// 	tripTargetPlace?: string;
// }

// const TripRequestScreen = () => {
// 	const theme = useTheme();
// 	const insets = useSafeAreaInsets();
// 	const [range, setRange] = useState<DateRange>({
// 		startDate: undefined,
// 		endDate: undefined,
// 	});
// 	const [open, setOpen] = useState(false);
// 	const [hakbeon, setHakbeon] = useState("");
// 	const [loading, setLoading] = useState(false);
// 	const [tripList, setTripList] = useState<TripItem[]>([]);
// 	const [listLoading, setListLoading] = useState(false);

// 	// 화면에 포커스가 맞춰질 때마다 날짜를 초기화하는 함수
// 	const resetDateRange = useCallback(() => {
// 		const today = new Date();
// 		const tomorrow = new Date(today);
// 		tomorrow.setDate(tomorrow.getDate() + 1);
// 		setRange({ startDate: today, endDate: tomorrow });
// 	}, []);

// 	// HTML에서 외박 리스트를 파싱하는 함수
// 	const parseTripHistory = useCallback((htmlContent: string): TripItem[] => {
// 		try {
// 			const tripData: TripItem[] = [];

// 			// 정규식 패턴을 사용하여 필요한 데이터 추출
// 			const tripFormRegex =
// 				/<form id="tripCancelForm" class="tripCancelForm" data-ajax="false">[\s\S]*?<\/form>/g;
// 			const tripForms = htmlContent.match(tripFormRegex);

// 			if (!tripForms) {
// 				console.log("외박 신청 내역을 찾을 수 없습니다.");
// 				return tripData;
// 			}

// 			// 각 폼을 순회하며 데이터 추출
// 			tripForms.forEach((form) => {
// 				// 외박 구분 추출
// 				const tripTypeRegex = /<th>외박구분<\/th>\s*<td>(.*?)<\/td>/;
// 				const tripTypeMatch = form.match(tripTypeRegex);
// 				let tripType = tripTypeMatch ? tripTypeMatch[1] : "정보 없음";

// 				// 숫자와 마침표 제거 (예: "1. 주중외박" -> "주중외박")
// 				tripType = tripType.replace(/^\d+\.\s*/, "");

// 				// 외박 지역 추출
// 				const tripTargetPlaceRegex = /<th>외박지역<\/th>\s*<td>(.*?)<\/td>/;
// 				const tripTargetPlaceMatch = form.match(tripTargetPlaceRegex);
// 				const tripTargetPlace = tripTargetPlaceMatch
// 					? tripTargetPlaceMatch[1]
// 					: "정보 없음";

// 				// 출관일시 추출
// 				const startDateRegex =
// 					/<th>출관일시<\/th>\s*<td>[\s\S]*?(\d{2}\.\d{2}\.\d{2})[\s\S]*?<\/td>/;
// 				const startDateMatch = form.match(startDateRegex);
// 				const startDate = startDateMatch ? startDateMatch[1] : "날짜 없음";

// 				// 귀관일시 추출
// 				const endDateRegex =
// 					/<th>귀관일시<\/th>\s*<td>[\s\S]*?(\d{2}\.\d{2}\.\d{2})[\s\S]*?<\/td>/;
// 				const endDateMatch = form.match(endDateRegex);
// 				const endDate = endDateMatch ? endDateMatch[1] : "날짜 없음";

// 				// seq 값 추출
// 				const seqRegex = /<input type="hidden" name="seq" value="(\d+)">/;
// 				const seqMatch = form.match(seqRegex);
// 				const seq = seqMatch ? seqMatch[1] : "시퀀스 없음";

// 				// 상태 확인 (승인 여부)
// 				const isApproved = form.includes(
// 					"<font color=blue><b>외박신청이 승인되었습니다.</b></font>"
// 				);
// 				const hasCancelButton =
// 					form.includes('class="tripCancelBtn">신청취소</a>') &&
// 					!form.includes("<!-- <a");

// 				// 상태에 따라 다르게 설정
// 				let status;
// 				if (isApproved) {
// 					status = "승인됨";
// 				} else if (hasCancelButton) {
// 					status = "취소 가능";
// 				} else {
// 					status = "대기중"; // 승인되지 않고 취소 버튼도 없는 경우
// 				}

// 				// 데이터 배열에 추가
// 				tripData.push({
// 					startDate,
// 					endDate,
// 					seq,
// 					status,
// 					tripType,
// 					tripTargetPlace,
// 				});
// 			});

// 			return tripData;
// 		} catch (error) {
// 			if (error instanceof Error) {
// 				console.error("파싱 오류:", error.message);
// 			} else {
// 				console.error("알 수 없는 파싱 오류 발생");
// 			}
// 			return [];
// 		}
// 	}, []);

// 	// 외박 리스트 불러오기
// 	const fetchTripList = useCallback(async () => {
// 		try {
// 			setListLoading(true);

// 			// getHTML 메소드를 사용하여 HTML 응답을 직접 처리
// 			const htmlData = await apiService.getHTML(
// 				"/dormitory/student/trip?menuId=341&tab=2",
// 				{
// 					headers: {
// 						referer:
// 							"https://mpot.knue.ac.kr/dormitory/student/trip?menuId=341",
// 					},
// 				}
// 			);

// 			console.log("HTML 데이터 타입:", typeof htmlData);
// 			console.log("HTML 데이터 길이:", htmlData ? htmlData.length : 0);
// 			console.log(
// 				"HTML 데이터 일부:",
// 				htmlData ? htmlData.substring(0, 200) : "데이터 없음"
// 			);

// 			// HTML 응답 파싱
// 			if (
// 				htmlData &&
// 				typeof htmlData === "string" &&
// 				htmlData.includes('<form id="tripCancelForm"')
// 			) {
// 				const tripData = parseTripHistory(htmlData);
// 				setTripList(tripData);
// 				console.log("파싱된 데이터:", tripData.length, "개 항목");
// 			} else {
// 				console.log("외박 리스트 응답이 유효한 HTML이 아닙니다.");
// 				// 개발용 더미 데이터 설정 (실제 앱에서는 빈 배열로 변경하세요)
// 				setTripList([]);
// 			}
// 		} catch (error) {
// 			if (axios.isAxiosError(error)) {
// 				// 에러가 AxiosError 타입임을 확인
// 				const axiosError = error as AxiosError;
// 				console.error("외박 리스트 불러오기 실패:", axiosError);

// 				if (axiosError.response) {
// 					console.log("에러 상태:", axiosError.response.status);
// 					console.log("에러 데이터:", axiosError.response.data);
// 				} else if (axiosError.request) {
// 					console.log("요청 에러:", axiosError.request);
// 				}
// 			} else {
// 				// Axios 에러가 아닌 경우
// 				console.error(
// 					"일반 에러:",
// 					error instanceof Error ? error.message : "알 수 없는 에러"
// 				);
// 			}

// 			// 개발용 더미 데이터 설정 (실제 앱에서는 빈 배열로 변경하세요)
// 			setTripList([]);
// 		} finally {
// 			setListLoading(false);
// 		}
// 	}, [parseTripHistory]);

// 	// 화면에 포커스가 맞춰질 때마다 날짜 초기화 및 리스트 불러오기
// 	useFocusEffect(
// 		useCallback(() => {
// 			resetDateRange();
// 			fetchTripList();
// 			return () => {};
// 		}, [resetDateRange, fetchTripList])
// 	);

// 	// DatePicker 모달 관련 함수
// 	const onDismiss = useCallback(() => {
// 		setOpen(false);
// 	}, []);

// 	const onConfirm = useCallback((params: DateRange) => {
// 		setOpen(false);
// 		setRange(params);
// 	}, []);

// 	// 사용자 학번 불러오기
// 	useEffect(() => {
// 		const loadUserInfo = async () => {
// 			try {
// 				const userNo = await AsyncStorage.getItem("userNo");
// 				if (userNo) {
// 					setHakbeon(userNo);
// 				}
// 			} catch (error) {
// 				if (error instanceof Error) {
// 					console.error("사용자 정보 불러오기 실패:", error.message);
// 				} else {
// 					console.error("사용자 정보 불러오기 중 알 수 없는 오류 발생");
// 				}
// 			}
// 		};

// 		loadUserInfo();
// 		// 초기 렌더링시에도 날짜 초기화
// 		resetDateRange();
// 	}, [resetDateRange]);

// 	// 폼 제출 핸들러
// 	const handleSubmit = async () => {
// 		// 필수 입력값 확인
// 		if (!hakbeon) {
// 			Alert.alert("입력 오류", "학번 정보가 없습니다. 다시 로그인해주세요.");
// 			return;
// 		}

// 		if (!range.startDate || !range.endDate) {
// 			Alert.alert("입력 오류", "시작일과 종료일을 모두 선택해주세요.");
// 			return;
// 		}

// 		// 날짜 형식 변환 (YYYY-MM-DD)
// 		const formattedStartDate = format(range.startDate, "yyyy-MM-dd");
// 		const formattedEndDate = format(range.endDate, "yyyy-MM-dd");

// 		setLoading(true);

// 		try {
// 			// 로그인 상태 확인
// 			const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");

// 			if (isLoggedIn !== "true") {
// 				Alert.alert(
// 					"로그인 오류",
// 					"로그인 정보가 만료되었습니다. 다시 로그인해주세요."
// 				);
// 				setLoading(false);
// 				return;
// 			}

// 			// 폼 데이터 준비
// 			const formData = new URLSearchParams();
// 			formData.append("tripType", "2"); // 외박은 2, 외출은 1
// 			formData.append("tripTargetPlace", "1"); // 타 지역은 1, 본가는 2
// 			formData.append("startDate", formattedStartDate);
// 			formData.append("endDate", formattedEndDate);
// 			formData.append("tripReason", "외박"); // 사유 필드 제거됨
// 			formData.append("menuId", "341");
// 			formData.append("enteranceInfoSeq", "1247"); // 필요에 따라 변경 가능
// 			formData.append("hakbeon", hakbeon);

// 			// API 서비스를 사용하여 API 호출
// 			const response = await apiService.post(
// 				"/dormitory/student/trip/apply",
// 				formData.toString(),
// 				{
// 					headers: {
// 						"content-type": "application/x-www-form-urlencoded",
// 						referer:
// 							"https://mpot.knue.ac.kr/dormitory/student/trip?menuId=341",
// 					},
// 				}
// 			);

// 			// 응답 확인 (apiService는 성공 시 데이터를 반환, 실패 시 예외를 발생시킴)
// 			Alert.alert("신청 완료", "외박 신청이 성공적으로 제출되었습니다.");
// 			// 폼 초기화 - 당일/익일로 다시 설정
// 			resetDateRange();
// 			// 리스트 새로고침
// 			fetchTripList();
// 		} catch (error) {
// 			if (axios.isAxiosError(error)) {
// 				// Axios 에러 처리
// 				const axiosError = error as AxiosError;
// 				console.error("API 호출 오류:", axiosError);

// 				if (axiosError.response) {
// 					console.log("에러 상태:", axiosError.response.status);
// 					console.log("에러 데이터:", axiosError.response.data);
// 				} else if (axiosError.request) {
// 					console.log("요청 에러:", axiosError.request);
// 				}
// 			} else {
// 				// 일반 에러 처리
// 				console.error(
// 					"API 호출 오류:",
// 					error instanceof Error ? error.message : "알 수 없는 오류"
// 				);
// 			}

// 			Alert.alert(
// 				"오류 발생",
// 				"외박 신청 중 오류가 발생했습니다. 다시 시도해주세요."
// 			);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	// 외박 취소 핸들러
// 	const handleCancelTrip = async (
// 		seq: string,
// 		startDate: string,
// 		endDate: string
// 	) => {
// 		try {
// 			setLoading(true);

// 			// 폼 데이터 준비
// 			const formData = new URLSearchParams();
// 			formData.append("seq", seq);
// 			formData.append("startDate", startDate.replace(/\./g, "-20"));
// 			formData.append("endDate", endDate.replace(/\./g, "-20"));
// 			formData.append("menuId", "341");

// 			// API 호출
// 			await apiService.post(
// 				"/dormitory/student/trip/cancel",
// 				formData.toString(),
// 				{
// 					headers: {
// 						"content-type": "application/x-www-form-urlencoded",
// 						referer:
// 							"https://mpot.knue.ac.kr/dormitory/student/trip?menuId=341&tab=2",
// 					},
// 				}
// 			);

// 			Alert.alert("취소 완료", "외박 신청이 성공적으로 취소되었습니다.");
// 			// 리스트 업데이트
// 			fetchTripList();
// 		} catch (error) {
// 			if (axios.isAxiosError(error)) {
// 				// Axios 에러 처리
// 				const axiosError = error as AxiosError;
// 				console.error("외박 취소 오류:", axiosError);

// 				if (axiosError.response) {
// 					console.log("에러 상태:", axiosError.response.status);
// 					console.log("에러 데이터:", axiosError.response.data);
// 				} else if (axiosError.request) {
// 					console.log("요청 에러:", axiosError.request);
// 				}
// 			} else {
// 				// 일반 에러 처리
// 				console.error(
// 					"외박 취소 오류:",
// 					error instanceof Error ? error.message : "알 수 없는 오류"
// 				);
// 			}

// 			Alert.alert("오류 발생", "외박 취소 중 오류가 발생했습니다.");
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	// 외박 취소 확인 다이얼로그
// 	const confirmCancelTrip = (item: TripItem) => {
// 		Alert.alert(
// 			"외박 신청 취소",
// 			`${item.startDate} ~ ${item.endDate} 외박을 취소하시겠습니까?`,
// 			[
// 				{ text: "취소", style: "cancel" },
// 				{
// 					text: "확인",
// 					onPress: () =>
// 						handleCancelTrip(item.seq, item.startDate, item.endDate),
// 				},
// 			]
// 		);
// 	};

// 	// 렌더링 전 날짜 존재 여부 확인
// 	const hasValidDateRange = range.startDate && range.endDate;

// 	// 날짜 형식화
// 	const formatDateSafely = (
// 		date: Date | undefined,
// 		formatString: string
// 	): string => {
// 		return date ? format(date, formatString) : "";
// 	};

// 	// 외박 항목 렌더링 함수
// 	const renderTripItem = ({ item }: { item: TripItem }) => {
// 		// 상태에 따라 색상 결정
// 		let statusColor = theme.colors.primary;
// 		if (item.status === "승인됨") {
// 			statusColor = "#4CAF50"; // 초록색
// 		} else if (item.status === "취소 가능") {
// 			statusColor = "#FF9800"; // 주황색
// 		}

// 		return (
// 			<Surface style={styles.tripItemCard}>
// 				<View style={styles.tripItemHeader}>
// 					<Text style={styles.tripType}>{item.tripType}</Text>
// 					<Chip
// 						mode="outlined"
// 						style={[styles.statusChip, { borderColor: statusColor }]}
// 						textStyle={{
// 							color: statusColor,
// 							fontSize: 14,
// 							lineHeight: 14,
// 							textAlign: "center",
// 						}}
// 					>
// 						{item.status}
// 					</Chip>
// 				</View>

// 				<Divider style={styles.divider} />

// 				<View style={styles.tripDetails}>
// 					<Text style={styles.detailLabel}>외박지역:</Text>
// 					<Text style={styles.detailValue}>{item.tripTargetPlace}</Text>
// 				</View>

// 				<View style={styles.tripDetails}>
// 					<Text style={styles.detailLabel}>기간:</Text>
// 					<Text
// 						style={styles.detailValue}
// 					>{`${item.startDate} ~ ${item.endDate}`}</Text>
// 				</View>

// 				{(item.status === "취소 가능" || item.status === "대기중") && (
// 					<Button
// 						mode="outlined"
// 						onPress={() => confirmCancelTrip(item)}
// 						style={styles.cancelButton}
// 						icon="close"
// 						textColor="#FF5722"
// 					>
// 						신청 취소
// 					</Button>
// 				)}
// 			</Surface>
// 		);
// 	};

// 	return (
// 		<View style={[styles.container, { paddingTop: insets.top }]}>
// 			<ScrollView style={styles.scrollView}>
// 				{/* 외박 신청 양식 */}
// 				<Surface style={styles.formContainer}>
// 					<Text style={[styles.title, { color: theme.colors.primary }]}>
// 						외박 신청
// 					</Text>

// 					{/* 기간 선택 버튼 */}
// 					<View style={styles.section}>
// 						<Button
// 							mode="outlined"
// 							onPress={() => setOpen(true)}
// 							style={styles.dateRangeButton}
// 							icon="calendar"
// 						>
// 							{hasValidDateRange
// 								? `${formatDateSafely(
// 										range.startDate,
// 										"yyyy/MM/dd"
// 								  )} - ${formatDateSafely(range.endDate, "yyyy/MM/dd")}`
// 								: "날짜를 선택하세요"}
// 						</Button>

// 						<DatePickerModal
// 							locale="ko"
// 							mode="range"
// 							visible={open}
// 							onDismiss={onDismiss}
// 							startDate={range.startDate}
// 							endDate={range.endDate}
// 							onConfirm={onConfirm}
// 							// 추가 옵션
// 							saveLabel="저장"
// 							label="날짜 범위 선택"
// 							startLabel="시작일"
// 							endLabel="종료일"
// 							animationType="slide"
// 						/>
// 					</View>

// 					{/* 제출 버튼 */}
// 					<Button
// 						mode="contained"
// 						onPress={handleSubmit}
// 						style={styles.submitButton}
// 						disabled={loading || !hasValidDateRange}
// 						icon="check"
// 					>
// 						{loading ? "제출 중..." : "외박 신청하기"}
// 					</Button>

// 					{loading && (
// 						<ActivityIndicator
// 							size="large"
// 							color={theme.colors.primary}
// 							style={styles.loadingIndicator}
// 						/>
// 					)}
// 				</Surface>

// 				{/* 외박 내역 섹션 */}
// 				<Surface style={styles.listContainer}>
// 					<Text style={[styles.listTitle, { color: theme.colors.primary }]}>
// 						외박 신청 내역
// 					</Text>

// 					{listLoading ? (
// 						<ActivityIndicator
// 							size="large"
// 							color={theme.colors.primary}
// 							style={styles.listLoadingIndicator}
// 						/>
// 					) : tripList.length > 0 ? (
// 						tripList.map((item, index) => (
// 							<View key={item.seq || `trip-item-${index}`}>
// 								{renderTripItem({ item })}
// 							</View>
// 						))
// 					) : (
// 						<Text style={styles.emptyListText}>외박 신청 내역이 없습니다.</Text>
// 					)}
// 				</Surface>
// 			</ScrollView>
// 		</View>
// 	);
// };

// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
// 		backgroundColor: "#f5f5f5",
// 	},
// 	scrollView: {
// 		flex: 1,
// 	},
// 	formContainer: {
// 		margin: 16,
// 		padding: 16,
// 		borderRadius: 8,
// 		elevation: 4,
// 		backgroundColor: "#fff",
// 	},
// 	title: {
// 		fontSize: 20,
// 		fontWeight: "bold",
// 		marginBottom: 16,
// 		textAlign: "center",
// 	},
// 	section: {
// 		marginBottom: 20,
// 		alignItems: "center",
// 	},
// 	dateRangeButton: {
// 		width: "100%",
// 		paddingVertical: 10,
// 		borderRadius: 8,
// 	},
// 	durationText: {
// 		fontSize: 18,
// 		fontWeight: "bold",
// 		marginTop: 8,
// 		color: "#0090D6",
// 	},
// 	submitButton: {
// 		paddingVertical: 8,
// 		borderRadius: 8,
// 	},
// 	loadingIndicator: {
// 		marginTop: 20,
// 	},
// 	listContainer: {
// 		margin: 16,
// 		marginTop: 8,
// 		padding: 16,
// 		borderRadius: 8,
// 		elevation: 4,
// 		backgroundColor: "#fff",
// 		marginBottom: 32,
// 	},
// 	listTitle: {
// 		fontSize: 20,
// 		fontWeight: "bold",
// 		marginBottom: 16,
// 		textAlign: "center",
// 	},
// 	listLoadingIndicator: {
// 		marginVertical: 30,
// 	},
// 	tripItemCard: {
// 		marginBottom: 16,
// 		padding: 16,
// 		borderRadius: 8,
// 		elevation: 2,
// 		backgroundColor: "#fff",
// 	},
// 	tripItemHeader: {
// 		flexDirection: "row",
// 		justifyContent: "space-between",
// 		alignItems: "center",
// 		marginBottom: 8,
// 	},
// 	tripType: {
// 		fontSize: 18,
// 		fontWeight: "bold",
// 	},
// 	statusChip: {
// 		height: 28,
// 		alignItems: "center",
// 		justifyContent: "center",
// 	},
// 	divider: {
// 		marginVertical: 8,
// 	},
// 	tripDetails: {
// 		flexDirection: "row",
// 		marginVertical: 4,
// 	},
// 	detailLabel: {
// 		width: 80,
// 		fontWeight: "bold",
// 	},
// 	detailValue: {
// 		flex: 1,
// 	},
// 	cancelButton: {
// 		marginTop: 12,
// 		borderColor: "#FF5722",
// 		borderWidth: 1,
// 	},
// 	emptyListText: {
// 		fontSize: 16,
// 		color: "#757575",
// 		textAlign: "center",
// 		marginVertical: 30,
// 	},
// });

// export default TripRequestScreen;
