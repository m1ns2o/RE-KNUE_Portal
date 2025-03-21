import React, { useRef, useEffect } from "react";
import {
	StyleSheet,
	View,
	Animated,
	TouchableWithoutFeedback,
	Dimensions,
	PanResponder,
} from "react-native";
import { useTheme, Divider, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";
import MenuItem, { createIoniconsIcon, createMaterialCommunityIcon, createMaterialIcon } from "./MenuItem";

const { width } = Dimensions.get("window");
const DRAWER_WIDTH = width * 0.8;
const SWIPE_THRESHOLD = width * 0.2; // 화면 너비의 20%를 임계값으로 설정

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

	// 드래그 상태 관리
	const dragX = useRef(new Animated.Value(0)).current;

	// PanResponder 설정
	const panResponder = useRef(
		PanResponder.create({
			// 터치 시작 시점에 항상 캡처
			onStartShouldSetPanResponder: () => true,

			// 이동 시작 시점에 Pan Responder 활성화 여부 결정
			onMoveShouldSetPanResponder: (_, gestureState) => {
				// 왼쪽으로 스와이프하는 경우만 (dx가 음수) 캡처
				return visible && gestureState.dx < -5;
			},

			// 제스처 시작 시 초기화
			onPanResponderGrant: () => {
				// 현재 translateX 값을 초기 dragX로 설정
				translateX.extractOffset();
				dragX.setValue(0);
			},

			// 드래그 중
			onPanResponderMove: Animated.event([null, { dx: dragX }], {
				useNativeDriver: false,
			}),

			// 제스처 종료 시
			onPanResponderRelease: (_, gestureState) => {
				translateX.flattenOffset();

				// 충분히 왼쪽으로 스와이프했으면 드로어 닫기
				if (gestureState.dx < -SWIPE_THRESHOLD) {
					onDismiss();
				} else {
					// 그렇지 않으면 원래 위치로 복귀
					Animated.spring(translateX, {
						toValue: 0,
						useNativeDriver: true,
						friction: 8,
					}).start();
				}
			},

			// 제스처 취소 시
			onPanResponderTerminate: () => {
				// 원래 위치로 복귀
				Animated.spring(translateX, {
					toValue: 0,
					useNativeDriver: true,
					friction: 8,
				}).start();
			},
		})
	).current;

	// dragX 값이 변경될 때마다 translateX 값 업데이트
	useEffect(() => {
		const id = dragX.addListener(({ value }) => {
			// 왼쪽으로만 이동하도록 제한 (값이 음수일 때만)
			if (value <= 0) {
				translateX.setValue(value);

				// translateX에 따라 배경 투명도 조정
				const newOpacity = 1 - Math.min(1, Math.abs(value) / DRAWER_WIDTH);
				backdropOpacity.setValue(newOpacity);
			}
		});

		return () => {
			dragX.removeListener(id);
		};
	}, [dragX, translateX, backdropOpacity]);

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
					pointerEvents: visible ? "auto" : "none",
					opacity: backdropOpacity,
				},
			]}
		>
			{/* 배경 백드롭 */}
			<TouchableWithoutFeedback onPress={onDismiss}>
				<View style={styles.backdrop} />
			</TouchableWithoutFeedback>

			{/* 드로어 컨텐츠 */}
			<Animated.View
				{...panResponder.panHandlers}
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

					{/* <MenuItem
						leftIcon={createIoniconsIcon("home", theme.colors.primary)}
						label="홈"
						onPress={() => navigateTo("Home")}
					/> */}

					<Divider style={styles.divider} />

					<MenuItem
						leftIcon={createIoniconsIcon("beer", theme.colors.primary)}
						label="외박 신청"
						onPress={() => navigateTo("Trip")}
					/>

					<Divider style={styles.divider} />

					<MenuItem
						leftIcon={createMaterialCommunityIcon("silverware-fork-knife", theme.colors.primary)}
						label="식단표"
						onPress={() => navigateTo("Trip")}
					/>

					<MenuItem
						leftIcon={createMaterialIcon("directions-bus", theme.colors.primary)}
						label="버스 시간표"
						onPress={() => navigateTo("Trip")}
					/>
				</View>

				{/* 메뉴 섹션 2 */}
				<View style={styles.menuSection}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>계정</Text>
					</View>

					<MenuItem
						leftIcon={createMaterialIcon("exit-to-app", theme.colors.primary)}
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
