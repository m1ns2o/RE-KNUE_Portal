// src/types/tripTypes.ts

// DatePicker 결과를 위한 인터페이스 정의
export interface DateRange {
	startDate: Date | undefined;
	endDate: Date | undefined;
}

// 외박 항목 인터페이스 정의
export interface TripItem {
	startDate: string;
	endDate: string;
	seq: string;
	status?: string;
	tripType?: string;
	tripTargetPlace?: string;
}
