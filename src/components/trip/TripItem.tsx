// src/components/trip/TripItem.tsx
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Surface, useTheme, Divider, Button } from "react-native-paper";
import { TripItem as TripItemType } from "../../utils/tripUtils";

interface TripItemProps {
	item: TripItemType;
	onCancelTrip: (item: TripItemType) => void;
}

const TripItem: React.FC<TripItemProps> = ({ item, onCancelTrip }) => {
	const theme = useTheme();

	// 상태에 따라 색상 결정
	let statusColor = theme.colors.primary;
	if (item.status === "승인됨") {
		statusColor = "#4CAF50"; // 초록색
	} else if (item.status === "취소 가능") {
		statusColor = "#FF9800"; // 주황색
	}

	return (
		<Surface style={styles.tripItemCard}>
			<View style={styles.tripItemHeader}>
				<Text style={styles.tripType}>{item.tripType}</Text>
				{/* 커스텀 Chip 대체 */}
				<View style={[styles.customChip, { borderColor: statusColor }]}>
					<Text
						style={[
							styles.customChipText,
							{ color: statusColor },
							Platform.OS === "android" && styles.androidTextFix, // 안드로이드 전용 스타일
						]}
					>
						{item.status}
					</Text>
				</View>
			</View>

			<Divider style={styles.divider} />

			<View style={styles.tripDetails}>
				<Text style={styles.detailLabel}>외박지역:</Text>
				<Text style={styles.detailValue}>{item.tripTargetPlace}</Text>
			</View>

			<View style={styles.tripDetails}>
				<Text style={styles.detailLabel}>기간:</Text>
				<Text
					style={styles.detailValue}
				>{`${item.startDate} ~ ${item.endDate}`}</Text>
			</View>

			{/* 취소 가능 상태일 때만 버튼 표시 */}
			{item.status === "취소 가능" && (
				<Button
					mode="outlined"
					onPress={() => onCancelTrip(item)}
					style={styles.cancelButton}
					icon="close"
					textColor="#FF5722"
				>
					신청 취소
				</Button>
			)}
		</Surface>
	);
};

const styles = StyleSheet.create({
	tripItemCard: {
		marginBottom: 16,
		padding: 16,
		borderRadius: 8,
		elevation: 2,
		backgroundColor: "#fff",
	},
	tripItemHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	tripType: {
		fontSize: 18,
		fontWeight: "bold",
	},
	customChip: {
		height: 28,
		borderWidth: 1,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 12,
	},
	customChipText: {
		fontSize: 14,
		lineHeight: 14,
		textAlignVertical: "center",
		includeFontPadding: false,
	},
	androidTextFix: {
		lineHeight: 18, // 안드로이드에서만 lineHeight 조정
	},
	divider: {
		marginVertical: 8,
	},
	tripDetails: {
		flexDirection: "row",
		marginVertical: 4,
	},
	detailLabel: {
		width: 80,
		fontWeight: "bold",
	},
	detailValue: {
		flex: 1,
	},
	cancelButton: {
		marginTop: 12,
		borderColor: "#FF5722",
		borderWidth: 1,
	},
});

export default TripItem;
