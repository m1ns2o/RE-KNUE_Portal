import React, { useRef, useEffect } from "react";
import {
	StyleSheet,
	View,
	Animated,
	TouchableWithoutFeedback,
	Dimensions,
	Text as RNText,
} from "react-native";
import { useTheme, Divider, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";
import MenuItem from "./MenuItem"; // 새로 만든 MenuItem 컴포넌트 임포트

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.8;

interface PaperDrawerProps {
	visible: boolean;
	onDismiss: () => void;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const PaperDrawer: React.FC<PaperDrawerProps> = ({ visible, onDismiss }) => {
	const theme = useTheme();
	const navigation = useNavigation<NavigationProp>();

	// 애니메이션 값
	const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
	const backdropOpacity = useRef(new Animated.Value(0)).current;

	// visible 속성이 변경될 때 애니메이션 업데이트
	useEffect(() => {
		if (visible) {
			// 드로어 나타나는 애니메이션
			Animated.parallel([
				Animated.timing(translateX, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(backdropOpacity, {
					toValue: 1,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();
		} else {
			// 드로어 사라지는 애니메이션
			Animated.parallel([
				Animated.timing(translateX, {
					toValue: -DRAWER_WIDTH,
					duration: 300,
					useNativeDriver: true,
				}),
				Animated.timing(backdropOpacity, {
					toValue: 0,
					duration: 300,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [visible]);

	const navigateTo = (screen: keyof RootStackParamList) => {
		onDismiss();
		navigation.navigate(screen);
	};

	return (
		<Animated.View
			style={[
				styles.container,
				{
					// display 대신 포인터 이벤트로 터치 비활성화
					pointerEvents: visible ? "auto" : "none",
					opacity: backdropOpacity, // 전체 컨테이너의 opacity를 백드롭과 연결
				},
			]}
		>
			{/* 배경 백드롭 */}
			<TouchableWithoutFeedback onPress={onDismiss}>
				<View style={styles.backdrop} />
			</TouchableWithoutFeedback>

			{/* 드로어 컨텐츠 */}
			<Animated.View
				style={[
					styles.drawer,
					{
						transform: [{ translateX }],
						width: DRAWER_WIDTH,
					},
				]}
			>
				{/* 상단 헤더 */}
				<View style={styles.header}>
					{/* <Text style={styles.headerTitle}>메뉴</Text> */}
				</View>

				{/* 메뉴 섹션 1 */}
				<View style={styles.menuSection}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>메뉴</Text>
					</View>

					<MenuItem icon="home" label="홈" onPress={() => navigateTo("Home")} />

					<Divider style={styles.divider} />

					<MenuItem
						icon="flight"
						label="외박 신청"
						onPress={() => navigateTo("Trip")}
					/>

					<Divider style={styles.divider} />

					<MenuItem
						icon="history"
						label="외박 내역"
						onPress={() => navigateTo("Trip")}
					/>
				</View>

				{/* 메뉴 섹션 2 */}
				<View style={styles.menuSection}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>계정</Text>
					</View>

					<MenuItem
						icon="exit-to-app"
						label="로그아웃"
						onPress={() => navigateTo("Login")}
					/>
				</View>
			</Animated.View>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1000,
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	drawer: {
		height: "100%",
		backgroundColor: "#F8F8F8",
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		shadowColor: "#000",
		shadowOffset: {
			width: 2,
			height: 0,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	header: {
		padding: 16,
		paddingTop: 50, // 상태 표시줄 높이 고려
		paddingBottom: 16,
		backgroundColor: "#F8F8F8",
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
	},
	menuSection: {
		marginTop: 8,
		backgroundColor: "#FFFFFF",
	},
	sectionHeader: {
		paddingHorizontal: 20,
		paddingVertical: 12,
		backgroundColor: "#F8F8F8",
	},
	sectionTitle: {
		fontSize: 14,
		color: "#999999",
	},
	divider: {
		height: 0.5,
		backgroundColor: "#EEEEEE",
	},
});

export default PaperDrawer;
