import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

interface MenuItemProps {
	icon: keyof typeof MaterialIcons.glyphMap;
	label: string;
	onPress: () => void;
	rightContent?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({
	icon,
	label,
	onPress,
	rightContent,
}) => {
	const theme = useTheme();

	return (
		<TouchableOpacity onPress={onPress} style={styles.menuItem}>
			<View style={styles.leftContent}>
				<View style={styles.iconContainer}>
					<MaterialIcons name={icon} size={24} color={theme.colors.primary} />
				</View>
				<Text style={styles.menuText}>{label}</Text>
			</View>

			{rightContent || (
				<MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 16,
		paddingHorizontal: 20,
		backgroundColor: "white",
	},
	leftContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	iconContainer: {
		width: 28,
		height: 28,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	menuText: {
		fontSize: 16,
		fontWeight: "400",
	},
});

export default MenuItem;
