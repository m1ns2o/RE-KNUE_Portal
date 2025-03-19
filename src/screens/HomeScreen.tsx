import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { Text, useTheme, Appbar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import PaperDrawer from "../components/drawer/Drawer";

const HomeScreen = () => {
	const theme = useTheme();
	const [drawerVisible, setDrawerVisible] = useState(false);

	const toggleDrawer = () => {
		setDrawerVisible((prevState) => !prevState);
	};

	const closeDrawer = () => {
		setDrawerVisible(false);
	};

	return (
		<View style={styles.container}>
			{/* 커스텀 헤더 (앱바) */}
			<Appbar.Header>
				<TouchableOpacity onPress={toggleDrawer} style={styles.menuButton}>
					<MaterialIcons name="menu" size={24} color={theme.colors.primary} />
				</TouchableOpacity>
				<Appbar.Content title="홈" color="white" />
			</Appbar.Header>

			<View style={styles.content}>
				<Text style={[styles.text, { color: theme.colors.primary }]}>
					홈 화면입니다
				</Text>
				<Text style={styles.subText}>홈 화면입니다</Text>
			</View>

			{/* 드로어 */}
			<PaperDrawer visible={drawerVisible} onDismiss={closeDrawer} />
		</View>
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
	menuButton: {
		marginLeft: 10,
		padding: 8,
	},
});

export default HomeScreen;
