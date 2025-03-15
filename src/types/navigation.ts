// src/types/navigation.ts
import { NavigationProp, RouteProp } from "@react-navigation/native";

// 앱의 모든 화면 매개변수 타입 정의
export type RootStackParamList = {
	Splash: undefined;
	Login: undefined;
	Home: undefined;
	Trip: undefined;
	// 필요한 다른 화면들과 각 화면에 전달되는 파라미터 타입 추가
	// 예시:
	// Profile: { userId: string };
	// Settings: undefined;
	// CourseDetails: { courseId: string; courseName: string };
};

// 네비게이션 속성 타입
export type NavigationProps = NavigationProp<RootStackParamList>;

// 라우트 속성 타입 - 특정 화면의 파라미터에 접근할 때 사용
export type RouteProps<RouteName extends keyof RootStackParamList> = RouteProp<
	RootStackParamList,
	RouteName
>;

// 네비게이션 훅을 위한 타입 헬퍼
export interface ScreenProps<RouteName extends keyof RootStackParamList> {
	navigation: NavigationProp<RootStackParamList, RouteName>;
	route: RouteProp<RootStackParamList, RouteName>;
}
