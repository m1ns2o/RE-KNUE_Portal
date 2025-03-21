import React, { useState } from "react";
import {
	View,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { useTheme, Appbar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import PaperDrawer from "../components/drawer/Drawer";
import MealInfoCards from "../components/homescreen/MealInfo";

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
				{/* <Appbar.Content title="홈" color="white" /> */}
			</Appbar.Header>

			<ScrollView style={styles.scrollView}>
				<View style={styles.content}>
					{/* 식단 정보 카드 - 이제 MealInfoCards에서 직접 데이터를 가져옴 */}
					<MealInfoCards />
				</View>
			</ScrollView>

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
	scrollView: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingVertical: 5,
		paddingHorizontal: 22,
	},
	welcomeContainer: {
		alignItems: "center",
		justifyContent: "center",
		marginTop: 24,
		marginBottom: 16,
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
	}
});

export default HomeScreen;