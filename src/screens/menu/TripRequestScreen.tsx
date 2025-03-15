// src/screens/menu/TripRequestScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import axios, { AxiosError } from "axios";
import { Alert } from "react-native";

// API 서비스
import apiService from "../../apis/apiService";

// 화면 컴포넌트
import TripRequestView from "../../components/trip/TripRequestView";

// 유틸리티 및 타입
import {
	DateRange,
	TripItem,
	parseTripHistory,
	extractEnteranceInfoSeq,
	validateTripRequestTime,
	validateTripCancelTime,
} from "../../utils/tripUtils";
import { RootStackParamList } from "../../types/navigation";

/**
 * 외박 신청 화면의 로직을 처리하는 컴포넌트
 */

type TripScreenProps = StackScreenProps<RootStackParamList, "Trip">;

const TripRequestScreen: React.FC<TripScreenProps> = ({ navigation }) => {
	// 상태 관리
	const [range, setRange] = useState<DateRange>({
		startDate: undefined,
		endDate: undefined,
	});
	const [open, setOpen] = useState<boolean>(false);
	const [hakbeon, setHakbeon] = useState<string>("");
	const [enteranceInfoSeq, setEnteranceInfoSeq] = useState<string>(""); // 추가: enteranceInfoSeq 상태
	const [loading, setLoading] = useState<boolean>(false);
	const [tripList, setTripList] = useState<TripItem[]>([]);
	const [listLoading, setListLoading] = useState<boolean>(false);

	// 날짜 초기화 함수
	const resetDateRange = useCallback(() => {
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);
		setRange({ startDate: today, endDate: tomorrow });
	}, []);

	// 외박 신청 페이지 불러오기 및 필요한 값 추출
	const fetchTripRequestPage = useCallback(async () => {
		try {
			setLoading(true);

			// 외박 신청 페이지 HTML 불러오기
			const htmlData = await apiService.getHTML(
				"/dormitory/student/trip?menuId=341&tab=1",
				{
					headers: {
						referer:
							"https://mpot.knue.ac.kr/dormitory/student/trip?menuId=341",
					},
				}
			);

			console.log(
				"신청 페이지 HTML 데이터 길이:",
				htmlData ? htmlData.length : 0
			);

			if (htmlData && typeof htmlData === "string") {
				// enteranceInfoSeq 값 추출
				const infoSeq = extractEnteranceInfoSeq(htmlData);
				if (infoSeq) {
					console.log("추출된 enteranceInfoSeq:", infoSeq);
					setEnteranceInfoSeq(infoSeq);
					await AsyncStorage.setItem("enteranceInfoSeq", infoSeq);
				}

				// 학번은 AsyncStorage에서 불러온 값을 계속 사용
			} else {
				console.log("유효한 HTML 응답이 없습니다.");
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const axiosError = error as AxiosError;
				console.error("외박 신청 페이지 불러오기 실패:", axiosError);
			} else {
				console.error(
					"일반 에러:",
					error instanceof Error ? error.message : "알 수 없는 에러"
				);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	// 외박 리스트 불러오기
	const fetchTripList = useCallback(async () => {
		try {
			setListLoading(true);

			// HTML 응답 가져오기
			const htmlData = await apiService.getHTML(
				"/dormitory/student/trip?menuId=341&tab=2",
				{
					headers: {
						referer:
							"https://mpot.knue.ac.kr/dormitory/student/trip?menuId=341",
					},
				}
			);

			console.log("HTML 데이터 타입:", typeof htmlData);
			console.log("HTML 데이터 길이:", htmlData ? htmlData.length : 0);

			// HTML 응답 파싱
			if (
				htmlData &&
				typeof htmlData === "string" &&
				htmlData.includes('<form id="tripCancelForm"')
			) {
				const tripData = parseTripHistory(htmlData);
				setTripList(tripData);
				console.log("파싱된 데이터:", tripData.length, "개 항목");
			} else {
				console.log("외박 리스트 응답이 유효한 HTML이 아닙니다.");
				console.log("응답 데이터:", htmlData);
				setTripList([]);
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const axiosError = error as AxiosError;
				console.error("외박 리스트 불러오기 실패:", axiosError);
			} else {
				console.error(
					"일반 에러:",
					error instanceof Error ? error.message : "알 수 없는 에러"
				);
			}
			setTripList([]);
		} finally {
			setListLoading(false);
		}
	}, []);

	// 화면에 포커스가 맞춰질 때마다 날짜 초기화 및 리스트 불러오기
	useFocusEffect(
		useCallback(() => {
			resetDateRange();
			fetchTripRequestPage(); // 외박 신청 페이지를 먼저 불러와 필요한 값들 추출
			fetchTripList();
			return () => {};
		}, [resetDateRange, fetchTripRequestPage, fetchTripList])
	);

	// DatePicker 모달 관련 함수
	const onDismiss = useCallback(() => {
		setOpen(false);
	}, []);

	const onConfirm = useCallback((params: DateRange) => {
		setOpen(false);
		setRange(params);
	}, []);

	const onOpenDatePicker = useCallback(() => {
		setOpen(true);
	}, []);

	// 사용자 학번 불러오기
	useEffect(() => {
		const loadUserInfo = async () => {
			try {
				const userNo = await AsyncStorage.getItem("userNo");
				if (userNo) {
					setHakbeon(userNo);
				}

				// enteranceInfoSeq 값이 있는지 확인하고 없으면 신청 페이지 로드
				const savedEnteranceInfoSeq = await AsyncStorage.getItem(
					"enteranceInfoSeq"
				);
				if (savedEnteranceInfoSeq) {
					setEnteranceInfoSeq(savedEnteranceInfoSeq);
				}
			} catch (error) {
				console.error(
					"사용자 정보 불러오기 실패:",
					error instanceof Error ? error.message : "알 수 없는 오류"
				);
			}
		};

		loadUserInfo();
		resetDateRange();
	}, [resetDateRange]);

	// 폼 제출 핸들러
	const handleSubmit = async () => {
		// 입력값 검증
		if (!hakbeon) {
			alert("학번 정보가 없습니다. 다시 로그인해주세요.");
			return;
		}

		if (!enteranceInfoSeq) {
			alert("입사 정보를 가져올 수 없습니다. 다시 시도해주세요.");
			await fetchTripRequestPage(); // 다시 시도
			return;
		}

		if (!range.startDate || !range.endDate) {
			alert("시작일과 종료일을 모두 선택해주세요.");
			return;
		}

		// 시간 제약 검증
		if (!validateTripRequestTime(range.startDate)) {
			return;
		}

		setLoading(true);

		try {
			// 로그인 상태 확인
			const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
			if (isLoggedIn !== "true") {
				alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
				setLoading(false);
				return;
			}

			// 날짜 형식 변환
			const formattedStartDate = format(range.startDate, "yyyy-MM-dd");
			const formattedEndDate = format(range.endDate, "yyyy-MM-dd");

			// 폼 데이터 준비
			const formData = new URLSearchParams();
			formData.append("tripType", "2"); // 외박은 2, 외출은 1
			formData.append("tripTargetPlace", "1"); // 타 지역은 1, 본가는 2
			formData.append("startDate", formattedStartDate);
			formData.append("endDate", formattedEndDate);
			formData.append("tripReason", "외박");
			formData.append("menuId", "341");
			formData.append("enteranceInfoSeq", enteranceInfoSeq); // 동적으로 가져온 값 사용
			formData.append("hakbeon", hakbeon);

			console.log("제출할 데이터:", formData.toString());

			// API 호출 및 HTML 응답 받기
			const response = await apiService.post(
				"/dormitory/student/trip/apply",
				formData.toString(),
				{
					headers: {
						"content-type": "application/x-www-form-urlencoded",
						referer:
							"https://mpot.knue.ac.kr/dormitory/student/trip?menuId=341",
					},
				}
			);

			// HTML 응답 파싱하여 외박 리스트 업데이트
			if (response && typeof response === "string") {
				// 외박 리스트 파싱
				const tripData = parseTripHistory(response);
				setTripList(tripData);

				// 신청한 외박이 리스트에 있는지 확인
				const isRegistered = tripData.some(
					(trip) =>
						trip.startDate.includes(
							formattedStartDate.substring(5).replace(/-/g, ".")
						) &&
						trip.endDate.includes(
							formattedEndDate.substring(5).replace(/-/g, ".")
						)
				);

				if (isRegistered) {
					alert("외박 신청이 성공적으로 제출되었습니다.");
				} else {
					alert(
						"외박 신청이 처리되었으나, 신청 목록에서 확인되지 않습니다. 다시 확인해주세요."
					);
				}
			} else {
				// 응답이 문자열이 아닌 경우, 리스트 직접 불러오기
				console.log(
					"응답이 HTML 형식이 아닙니다. 외박 리스트를 다시 불러옵니다."
				);
				await fetchTripList();
				alert("외박 신청이 처리되었습니다. 외박 목록을 확인해주세요.");
			}

			resetDateRange();
		} catch (error) {
			console.error(
				"API 호출 오류:",
				error instanceof Error ? error.message : "알 수 없는 오류"
			);
			alert("외박 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
			await fetchTripList(); // 에러 발생 시 최신 상태 확인을 위해 목록 갱신
		} finally {
			setLoading(false);
		}
	};

	// 외박 취소 핸들러
	const handleCancelTrip = async (
		seq: string,
		startDate: string,
		endDate: string
	) => {
		try {
			setLoading(true);

			console.log("취소 요청 정보:", { seq, startDate, endDate });

			// 날짜 형식 변환 (10.03.12 -> 2025-03-12 형식으로)
			// startDate와 endDate가 "10.03.12" 형식인 경우 "2025-03-12" 형식으로 변환
			const formatDate = (dateStr: string): string => {
				const parts = dateStr.split(".");
				if (parts.length === 3) {
					// YY.MM.DD 형식인 경우 20YY-MM-DD 형식으로 변환
					return `20${parts[0]}-${parts[1]}-${parts[2]}`;
				}
				return dateStr; // 이미 변환된 형식이거나 다른 형식인 경우 그대로 반환
			};

			// 폼 데이터 준비
			const formData = new URLSearchParams();
			formData.append("seq", seq);
			formData.append("startDate", formatDate(startDate));
			formData.append("endDate", formatDate(endDate));
			formData.append("menuId", "341");

			console.log("취소 요청 데이터:", formData.toString());

			// API 호출 및 HTML 응답 받기
			const response = await apiService.post(
				"/dormitory/student/trip/cancel?menuId=341",
				formData.toString(),
				{
					headers: {
						"content-type": "application/x-www-form-urlencoded",
						origin: "https://mpot.knue.ac.kr",
						referer:
							"https://mpot.knue.ac.kr/dormitory/student/trip?menuId=341&tab=2",
						"upgrade-insecure-requests": "1",
					},
				}
			);

			// HTML 응답 파싱하여 외박 리스트 업데이트
			if (response && typeof response === "string") {
				// 외박 리스트 파싱
				const tripData = parseTripHistory(response);
				setTripList(tripData);

				// 취소된 외박이 리스트에서 사라졌는지 확인
				const isCanceled = !tripData.some((trip) => trip.seq === seq);

				if (isCanceled) {
					alert("외박 신청이 성공적으로 취소되었습니다.");
				} else {
					alert(
						"외박 취소가 처리되었으나, 취소된 항목이 아직 목록에 있습니다. 다시 확인해주세요."
					);
				}
			} else {
				// 응답이 문자열이 아닌 경우, 리스트 직접 불러오기
				console.log(
					"응답이 HTML 형식이 아닙니다. 외박 리스트를 다시 불러옵니다."
				);
				await fetchTripList();
				alert("외박 취소가 처리되었습니다. 외박 목록을 확인해주세요.");
			}
		} catch (error) {
			console.error(
				"외박 취소 오류:",
				error instanceof Error ? error.message : "알 수 없는 오류"
			);
			alert("외박 취소 중 오류가 발생했습니다.");
			await fetchTripList(); // 에러 발생 시 최신 상태 확인을 위해 목록 갱신
		} finally {
			setLoading(false);
		}
	};

	// 외박 취소 확인
	const confirmCancelTrip = (item: TripItem) => {
		// 취소 가능 여부 검증
		if (!validateTripCancelTime(item)) {
			return;
		}

		// 모든 검증을 통과한 경우 취소 확인 창 표시
		Alert.alert(
			"외박 취소",
			`${item.startDate} ~ ${item.endDate} 외박을 취소하시겠습니까?`,
			[
				{
					text: "취소",
					style: "cancel",
				},
				{
					text: "확인",
					onPress: () =>
						handleCancelTrip(item.seq, item.startDate, item.endDate),
				},
			]
		);
	};

	// 뷰 렌더링을 위한 props
	const viewProps = {
		range,
		open,
		loading,
		listLoading,
		tripList,
		hasValidDateRange: !!range.startDate && !!range.endDate,
		onOpenDatePicker,
		onDismiss,
		onConfirm,
		onSubmit: handleSubmit,
		onCancelTrip: confirmCancelTrip,
	};

	return <TripRequestView {...viewProps} />;
};

export default TripRequestScreen;
