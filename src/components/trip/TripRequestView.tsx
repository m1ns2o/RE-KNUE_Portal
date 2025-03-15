// src/components/trip/TripRequestView.tsx
import React from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { Button, Surface, useTheme } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 유틸리티 및 타입
import { DateRange, TripItem, formatDateSafely } from "../../utils/tripUtils";
// TripItem 컴포넌트 가져오기
import TripItemComponent from "./TripItem";

// 뷰 컴포넌트 Props 타입
interface TripRequestViewProps {
	range: DateRange;
	open: boolean;
	loading: boolean;
	listLoading: boolean;
	tripList: TripItem[];
	hasValidDateRange: boolean;
	onOpenDatePicker: () => void;
	onDismiss: () => void;
	onConfirm: (params: DateRange) => void;
	onSubmit: () => void;
	onCancelTrip: (item: TripItem) => void;
}

/**
 * 외박 신청 화면의 뷰를 담당하는 컴포넌트
 */
const TripRequestView: React.FC<TripRequestViewProps> = ({
	range,
	open,
	loading,
	listLoading,
	tripList,
	hasValidDateRange,
	onOpenDatePicker,
	onDismiss,
	onConfirm,
	onSubmit,
	onCancelTrip,
}) => {
	const theme = useTheme();
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<ScrollView style={styles.scrollView}>
				{/* 외박 신청 양식 */}
				<Surface style={styles.formContainer}>
					<Text style={[styles.title, { color: theme.colors.primary }]}>
						외박 신청
					</Text>

					{/* 기간 선택 버튼 */}
					<View style={styles.section}>
						<Button
							mode="outlined"
							onPress={onOpenDatePicker}
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
						onPress={onSubmit}
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

				{/* 외박 내역 섹션 */}
				<Surface style={styles.listContainer}>
					<Text style={[styles.listTitle, { color: theme.colors.primary }]}>
						외박 신청 내역
					</Text>

					{listLoading ? (
						<ActivityIndicator
							size="large"
							color={theme.colors.primary}
							style={styles.listLoadingIndicator}
						/>
					) : tripList.length > 0 ? (
						tripList.map((item) => (
							<TripItemComponent
								key={item.seq}
								item={item}
								onCancelTrip={onCancelTrip}
							/>
						))
					) : (
						<Text style={styles.emptyListText}>외박 신청 내역이 없습니다.</Text>
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
	},
	scrollView: {
		flex: 1,
	},
	formContainer: {
		margin: 16,
		padding: 16,
		borderRadius: 8,
		elevation: 4,
		backgroundColor: "#fff",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
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
	durationText: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 8,
		color: "#0090D6",
	},
	submitButton: {
		paddingVertical: 8,
		borderRadius: 8,
	},
	loadingIndicator: {
		marginTop: 20,
	},
	listContainer: {
		margin: 16,
		marginTop: 8,
		padding: 16,
		borderRadius: 8,
		elevation: 4,
		backgroundColor: "#fff",
		marginBottom: 32,
	},
	listTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 16,
		textAlign: "center",
	},
	listLoadingIndicator: {
		marginVertical: 30,
	},
	emptyListText: {
		fontSize: 16,
		color: "#757575",
		textAlign: "center",
		marginVertical: 30,
	},
});

export default TripRequestView;
