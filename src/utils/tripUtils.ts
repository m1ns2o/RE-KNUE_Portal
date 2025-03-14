// src/utils/tripUtils.ts
import { format } from 'date-fns';

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

// HTML에서 외박 리스트를 파싱하는 함수
export const parseTripHistory = (htmlContent: string): TripItem[] => {
    try {
        const tripData: TripItem[] = [];

        // 정규식 패턴을 사용하여 필요한 데이터 추출
        const tripFormRegex =
            /<form id="tripCancelForm" class="tripCancelForm" data-ajax="false">[\s\S]*?<\/form>/g;
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
                form.includes('class="tripCancelBtn">신청취소</a>') &&
                !form.includes("<!-- <a");

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