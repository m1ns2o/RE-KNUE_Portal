// src/utils/tripUtils.ts
import { format } from 'date-fns';
import { Alert } from 'react-native';

// 외박 항목 인터페이스 정의
export interface TripItem {
    startDate: string;
    endDate: string;
    seq: string;
    status?: string;
    tripType?: string;
    tripTargetPlace?: string;
}

// DatePicker 결과를 위한 인터페이스 정의
export interface DateRange {
    startDate: Date | undefined;
    endDate: Date | undefined;
}

/**
 * HTML 응답에서 enteranceInfoSeq 값을 추출하는 함수
 * @param htmlContent HTML 응답 문자열
 * @returns 추출된 enteranceInfoSeq 값 또는 null
 */
export const extractEnteranceInfoSeq = (htmlContent: string): string | null => {
    const regex = /<input\s+type="hidden"\s+name="enteranceInfoSeq"\s+value="(\d+)"/i;
    const match = htmlContent.match(regex);
    return match && match[1] ? match[1] : null;
};

/**
 * HTML 응답에서 hakbeon 값을 추출하는 함수
 * @param htmlContent HTML 응답 문자열
 * @returns 추출된 hakbeon 값 또는 null
 */
export const extractHakbeon = (htmlContent: string): string | null => {
    const regex = /<input\s+type="hidden"\s+name="hakbeon"\s+value="(\d+)"/i;
    const match = htmlContent.match(regex);
    return match && match[1] ? match[1] : null;
};

/**
 * 날짜가 오늘인지 확인하는 함수
 * @param date 확인할 날짜
 * @returns boolean 오늘이면 true, 아니면 false
 */
export const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
};

/**
 * 현재 시간이 오후 11시 30분을 지났는지 확인하는 함수
 * @returns boolean 오후 11시 30분 지났으면 true, 아니면 false
 */
export const isPastCurfewTime = (): boolean => {
    const now = new Date();
    return now.getHours() >= 23 && now.getMinutes() >= 30;
};

/**
 * YY.MM.DD 형식의 날짜 문자열을 Date 객체로 변환
 * @param dateStr YY.MM.DD 형식의 날짜 문자열 (예: 25.03.15)
 * @returns Date 객체 또는 null (변환 실패시)
 */
export const parseTripDate = (dateStr: string): Date | null => {
    const parts = dateStr.split('.');
    if (parts.length !== 3) {
        return null;
    }
    return new Date(`20${parts[0]}-${parts[1]}-${parts[2]}`);
};

/**
 * 외박 신청 가능 시간인지 검증
 * @param startDate 외박 시작일
 * @returns boolean 신청 가능하면 true, 불가능하면 false
 */
export const validateTripRequestTime = (startDate: Date): boolean => {
    // 현재 날짜 (시간 제외)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 시작일이 오늘 이전인지 확인 (과거 날짜)
    if (startDate < today) {
        Alert.alert(
            "신청 불가",
            "과거 날짜에 대한 외박은 신청할 수 없습니다.",
            [{ text: "확인", style: "default" }]
        );
        return false;
    }
    
    // 시작일이 오늘이고 현재 시간이 23:30 이후면 신청 불가
    if (isToday(startDate) && isPastCurfewTime()) {
        Alert.alert(
            "신청 불가",
            "오후 11시 30분 이후에는 당일 외박을 신청할 수 없습니다.",
            [{ text: "확인", style: "default" }]
        );
        return false;
    }
    return true;
};

/**
 * 외박 취소 가능 여부 검증
 * @param item 취소할 외박 항목
 * @returns boolean 취소 가능하면 true, 불가능하면 false
 */
export const validateTripCancelTime = (item: TripItem): boolean => {
    // 시작일 파싱
    const startDate = parseTripDate(item.startDate);
    if (!startDate) {
        Alert.alert(
            "날짜 오류",
            "외박 날짜 형식이 올바르지 않습니다.",
            [{ text: "확인", style: "default" }]
        );
        return false;
    }
    
    // 오늘 이전인지 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = startDate < today;
    
    // 취소 가능한 상태인지 확인
    if (item.status !== "취소 가능" && item.status !== "대기중") {
        Alert.alert(
            "취소 불가",
            "이미 승인된 외박은 취소할 수 없습니다.",
            [{ text: "확인", style: "default" }]
        );
        return false;
    }
    
    // 날짜가 이미 지난 경우
    if (isPastDate) {
        Alert.alert(
            "취소 불가",
            "이미 지난 날짜의 외박은 취소할 수 없습니다.",
            [{ text: "확인", style: "default" }]
        );
        return false;
    }
    
    // 오늘이고 시간이 23:30 이후인 경우
    if (isToday(startDate) && isPastCurfewTime()) {
        Alert.alert(
            "취소 불가",
            "오후 11시 30분 이후에는 당일 외박을 취소할 수 없습니다.",
            [{ text: "확인", style: "default" }]
        );
        return false;
    }
    
    return true;
};

// HTML에서 외박 리스트를 파싱하는 함수
export const parseTripHistory = (htmlContent: string): TripItem[] => {
    try {
        const tripData: TripItem[] = [];

        // 정규식 패턴을 사용하여 필요한 데이터 추출
        const tripFormRegex =
            /<form(?:[^>]*?)class="tripCancelForm"(?:[^>]*?)data-ajax="false"[\s\S]*?<\/form>/g;
        const tripForms = htmlContent.match(tripFormRegex);

        if (!tripForms) {
            console.log("외박 신청 내역을 찾을 수 없습니다.");
            return tripData;
        }

        // 각 폼을 순회하며 데이터 추출
        tripForms.forEach((form) => {
            // 외박 구분 추출
            const tripTypeRegex = /<th>외박구분<\/th>\s*<td>(.*?)<\/td>/;
            const tripTypeMatch = form.match(tripTypeRegex);
            let tripType = tripTypeMatch ? tripTypeMatch[1] : "정보 없음";

            // 숫자와 마침표 제거 (예: "1. 주중외박" -> "주중외박")
            tripType = tripType.replace(/^\d+\.\s*/, "");

            // 외박 지역 추출
            const tripTargetPlaceRegex = /<th>외박지역<\/th>\s*<td>(.*?)<\/td>/;
            const tripTargetPlaceMatch = form.match(tripTargetPlaceRegex);
            const tripTargetPlace = tripTargetPlaceMatch
                ? tripTargetPlaceMatch[1]
                : "정보 없음";

            // 출관일시 추출
            const startDateRegex =
                /<th>출관일시<\/th>\s*<td>[\s\S]*?(\d{2}\.\d{2}\.\d{2})[\s\S]*?<\/td>/;
            const startDateMatch = form.match(startDateRegex);
            const startDate = startDateMatch ? startDateMatch[1] : "날짜 없음";

            // 귀관일시 추출
            const endDateRegex =
                /<th>귀관일시<\/th>\s*<td>[\s\S]*?(\d{2}\.\d{2}\.\d{2})[\s\S]*?<\/td>/;
            const endDateMatch = form.match(endDateRegex);
            const endDate = endDateMatch ? endDateMatch[1] : "날짜 없음";

            // seq 값 추출
            const seqRegex = /<input type="hidden" name="seq" value="(\d+)">/;
            const seqMatch = form.match(seqRegex);
            const seq = seqMatch ? seqMatch[1] : "시퀀스 없음";

            // 상태 확인 (승인 여부)
            const isApproved = form.includes(
                "<font color=blue><b>외박신청이 승인되었습니다.</b></font>"
            );
            const hasCancelButton = 
                form.includes('class="tripCancelBtn">신청취소</a>') ||
                form.includes('class="tripCancelBtn" >신청취소</a>');

            // 상태에 따라 다르게 설정
            let status;
            if (isApproved) {
                status = "승인됨";
            } else if (hasCancelButton) {
                status = "취소 가능";
            } else {
                status = "대기중"; // 승인되지 않고 취소 버튼도 없는 경우
            }

            // 데이터 배열에 추가
            tripData.push({
                startDate,
                endDate,
                seq,
                status,
                tripType,
                tripTargetPlace,
            });
        });

        return tripData;
    } catch (error) {
        if (error instanceof Error) {
            console.error("파싱 오류:", error.message);
        } else {
            console.error("알 수 없는 파싱 오류 발생");
        }
        return [];
    }
};

// 날짜 형식화 함수
export const formatDateSafely = (date: Date | undefined, formatString: string): string => {
    return date ? format(date, formatString) : "";
};