import React from "react";
import { View, StyleSheet } from "react-native";
import { Surface, Text, Divider, useTheme } from "react-native-paper";

// MealItem component to display individual meal details
const MealItem = ({ title, menu }) => {
	return (
		<View style={styles.mealDetails}>
			<Text style={styles.detailLabel}>{title}:</Text>
			{menu ? (
				<Text style={styles.detailValue}>{menu}</Text>
			) : (
				<Text style={styles.noMenu}>식단 정보가 없습니다</Text>
			)}
		</View>
	);
};

// MealCard component to display all meals for a location
const MealCard = ({ title, meals = {} }) => {
	const theme = useTheme();

	// Add default empty string for meals if undefined
	const safeBreakfast = meals?.breakfast || "";
	const safeLunch = meals?.lunch || "";
	const safeDinner = meals?.dinner || "";

	return (
		<Surface style={styles.mealCard}>
			<View style={styles.mealCardHeader}>
				<Text style={styles.mealType}>{title}</Text>
			</View>

			<Divider
				style={[styles.divider, { backgroundColor: theme.colors.primary }]}
			/>

			<MealItem title="아침" menu={safeBreakfast} />
			<MealItem title="점심" menu={safeLunch} />
			<MealItem title="저녁" menu={safeDinner} />
		</Surface>
	);
};

// Main component that contains both MealCards
const MealInfoCards = ({ mealData = {} }) => {
	// Add default empty objects for staff and dormitory if undefined
	const staff = mealData?.staff || {};
	const dormitory = mealData?.dormitory || {};

	return (
		<View style={styles.container}>
			{/* <Text style={styles.dateText}>오늘의 식단</Text> */}
			<MealCard title="교직원 식당" meals={staff} />
			<MealCard title="기숙사 식당" meals={dormitory} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		// padding: 16,
		// paddingHorizontal: 6,
		gap: 10,
	},
	dateText: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
	},
	mealCard: {
		marginBottom: 16,
		padding: 16,
		borderRadius: 8,
		elevation: 2,
		backgroundColor: "#fff",
	},
	mealCardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	mealType: {
		fontSize: 18,
		fontWeight: "bold",
	},
	divider: {
		marginVertical: 8,
		// backgroundColor: theme.colors.primary, // 이 부분이 타입 에러 발생 원인
	},
	mealDetails: {
		flexDirection: "row",
		marginVertical: 6,
	},
	detailLabel: {
		width: 50,
		fontWeight: "bold",
	},
	detailValue: {
		flex: 1,
	},
	noMenu: {
		fontStyle: "italic",
		color: "gray",
		flex: 1,
	},
});

export default MealInfoCards;