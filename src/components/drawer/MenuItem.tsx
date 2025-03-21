import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

// 아이콘 컴포넌트 직접 전달하는 방식
interface MenuItemProps {
  // 왼쪽 아이콘 (컴포넌트로 전달)
  leftIcon: React.ReactNode;
  
  // 라벨과 onPress는 그대로 유지
  label: string;
  onPress: () => void;
  
  // 오른쪽 컨텐츠 (선택적)
  rightContent?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({
  leftIcon,
  label,
  onPress,
  rightContent,
}) => {
  const theme = useTheme();
  
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          {leftIcon}
        </View>
        <Text style={styles.menuText}>{label}</Text>
      </View>

      {rightContent || (
        <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
      )}
    </TouchableOpacity>
  );
};

// 헬퍼 함수로 아이콘 생성을 쉽게 함
export const createIoniconsIcon = (name: keyof typeof Ionicons.glyphMap, color?: string, size?: number) => {
  return <Ionicons name={name} size={size || 24} color={color || "#000000"} />;
};

export const createMaterialIcon = (name: keyof typeof MaterialIcons.glyphMap, color?: string, size?: number) => {
  return <MaterialIcons name={name} size={size || 24} color={color || "#000000"} />;
};

// Material Community Icons를 위한 헬퍼 함수 추가
export const createMaterialCommunityIcon = (name: keyof typeof MaterialCommunityIcons.glyphMap, color?: string, size?: number) => {
  return <MaterialCommunityIcons name={name} size={size || 24} color={color || "#000000"} />;
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