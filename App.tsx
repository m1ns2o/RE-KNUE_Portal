// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

// 로그인 화면 가져오기
import LoginScreen from "./src/screens/auth/LoginScreen";

// 테마 정의 - #0090D6를 메인 컬러로 설정
const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: "#0090D6", // 메인 컬러로 변경
		accent: "#033D94", // 강조 컬러
		background: "#FFFFFF",
		surface: "#FFFFFF",
	},
};

// 스택 네비게이션 타입 정의
type RootStackParamList = {
	Login: undefined;
	// 나중에 필요한 다른 화면들을 여기에 추가할 수 있습니다
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
	return (
		<SafeAreaProvider>
			<PaperProvider theme={theme}>
				<NavigationContainer>
					<StatusBar style="light" />
					<Stack.Navigator
						initialRouteName="Login"
						screenOptions={{
							headerShown: false,
						}}
					>
						<Stack.Screen name="Login" component={LoginScreen} />
					</Stack.Navigator>
				</NavigationContainer>
			</PaperProvider>
		</SafeAreaProvider>
	);
}
