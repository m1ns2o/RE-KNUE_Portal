import React, { useState } from "react";
import {
	View,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { Text, useTheme, Appbar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import PaperDrawer from "../components/drawer/Drawer";
import MealInfoCards from "../components/homescreen/MealInfo";

const HomeScreen = () => {
	const theme = useTheme();
	const [drawerVisible, setDrawerVisible] = useState(false);

	// Mock meal data (in a real app, this would come from an API or state management)
	const mealData = {
		staff: {
			breakfast: "",
			lunch:
				"백미밥,조랭이떡국,묵은지돈육찜,비빔당면,부추겉절이,깍두기,흑미밥,김자반볶음,양상추그린샐러드,식빵,딸기잼,셀프계란후라이,음료",
			dinner:
				"마파두부덮밥,계란파국,칠리돈육강정,브로콜리맛살볶음,단무지무침,포기김치,식빵,딸기잼,셀프계란후라이,조미김",
		},
		dormitory: {
			breakfast: "사골파국,비엔나양송이볶음,진미채무침,취나물들기름볶음,김치",
			lunch: "애호박된장국,청양풍찜닭,청포묵무침,마늘쫑견과류볶음,김치",
			dinner: "순살감자탕,떡갈비조림,잡채,오이양파무침,깍두기",
		},
	};

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
					{/* 식단 정보 카드 */}
					<MealInfoCards mealData={mealData} />
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
		// padding: 16,
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
	},
});

export default HomeScreen;
