// HomeScreen.tsx
import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { Text, useTheme } from "react-native-paper";

const HomeScreen = () => {
	const theme = useTheme();

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<Text style={[styles.text, { color: theme.colors.primary }]}>
					홈 화면입니다
				</Text>
				<Text style={styles.subText}>
					React Native Paper를 사용한 간단한 홈 화면입니다.
				</Text>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	text: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
	},
	subText: {
		fontSize: 16,
		textAlign: "center",
	},
});

export default HomeScreen;
