// src/components/trip/TripItem.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Surface, useTheme, Divider, Chip, Button } from "react-native-paper";
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
				<Chip
					mode="outlined"
					style={[styles.statusChip, { borderColor: statusColor }]}
					textStyle={{
						color: statusColor,
						fontSize: 14,
						lineHeight: 14,
						textAlign: "center",
					}}
				>
					{item.status}
				</Chip>
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

			{(item.status === "취소 가능" || item.status === "대기중") && (
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
	statusChip: {
		height: 28,
		alignItems: "center",
		justifyContent: "center",
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
