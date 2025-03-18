// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ko, registerTranslation } from 'react-native-paper-dates'

import { RootStackParamList } from "./src/types/navigation"; 

// 화면 가져오기
import LoginScreen from "./src/screens/auth/LoginScreen";
import SplashScreen from "./src/screens/auth/SplashScreen";
// import HomeScreen from "./src/screens/HomeScreen";
import TripScreen from "./src/screens/menu/TripRequestScreen"

// 앱의 진입점(예: index.js 또는 App.js)에 추가


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

registerTranslation('ko', ko); // datepicker 한국어 설정

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
	return (
		<SafeAreaProvider>
			<PaperProvider theme={theme}>
				<NavigationContainer>
					<StatusBar style="light" />
					<Stack.Navigator
						initialRouteName="Splash"
						screenOptions={{
							headerShown: false,
						}}
					>
						<Stack.Screen name="Splash" component={SplashScreen} />
						<Stack.Screen name="Login" component={LoginScreen} />
						{/* <Stack.Screen name="Home" component={HomeScreen} /> */}
						<Stack.Screen name="Trip"	component={TripScreen}/>
					</Stack.Navigator>
				</NavigationContainer>
			</PaperProvider>
		</SafeAreaProvider>
	);
}
