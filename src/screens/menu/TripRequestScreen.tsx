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
import TripRequestView from "./TripRequestView";

// 유틸리티 및 타입
import { DateRange, TripItem, parseTripHistory } from "../../utils/tripUtils";
import { RootStackParamList } from "../../types/navigation";

type TripScreenProps = StackScreenProps<RootStackParamList, "Trip">;

/**
 * 외박 신청 화면의 로직을 처리하는 컴포넌트
 */
const TripRequestScreen: React.FC<TripScreenProps> = ({ navigation }) => {
	// 상태 관리
	const [range, setRange] = useState<DateRange>({
		startDate: undefined,
		endDate: undefined,
	});
	const [open, setOpen] = useState<boolean>(false);
	const [hakbeon, setHakbeon] = useState<string>("");
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
			fetchTripList();
			return () => {};
		}, [resetDateRange, fetchTripList])
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

		if (!range.startDate || !range.endDate) {
			alert("시작일과 종료일을 모두 선택해주세요.");
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
			formData.append("enteranceInfoSeq", "1247");
			formData.append("hakbeon", hakbeon);

			// API 호출
			await apiService.post(
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

			alert("외박 신청이 성공적으로 제출되었습니다.");
			resetDateRange();
			fetchTripList();
		} catch (error) {
			console.error(
				"API 호출 오류:",
				error instanceof Error ? error.message : "알 수 없는 오류"
			);
			alert("외박 신청 중 오류가 발생했습니다. 다시 시도해주세요.");
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

			// 폼 데이터 준비
			const formData = new URLSearchParams();
			formData.append("seq", seq);
			formData.append("startDate", startDate.replace(/\./g, "-20"));
			formData.append("endDate", endDate.replace(/\./g, "-20"));
			formData.append("menuId", "341");

			// API 호출
			await apiService.post(
				"/dormitory/student/trip/cancel",
				formData.toString(),
				{
					headers: {
						"content-type": "application/x-www-form-urlencoded",
						referer:
							"https://mpot.knue.ac.kr/dormitory/student/trip?menuId=341&tab=2",
					},
				}
			);

			alert("외박 신청이 성공적으로 취소되었습니다.");
			fetchTripList();
		} catch (error) {
			console.error(
				"외박 취소 오류:",
				error instanceof Error ? error.message : "알 수 없는 오류"
			);
			alert("외박 취소 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
		}
	};

	// 외박 취소 확인
	const confirmCancelTrip = (item: TripItem) => {
		const confirmMessage = `${item.startDate} ~ ${item.endDate} 외박을 취소하시겠습니까?`;

		if (confirm(confirmMessage)) {
			handleCancelTrip(item.seq, item.startDate, item.endDate);
		}
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
