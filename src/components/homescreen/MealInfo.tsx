import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Surface, Text, Divider, useTheme, ActivityIndicator } from "react-native-paper";
import axios from "axios";

// Define interfaces for our data structure
interface Meal {
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface MealData {
  staff: Meal;
  dormitory: Meal;
}

// Props interfaces for our components
interface MealItemProps {
  title: string;
  menu: string;
}

interface MealCardProps {
  title: string;
  meals: Meal;
}

// MealItem component to display individual meal details
const MealItem: React.FC<MealItemProps> = ({ title, menu }) => {
  return (
    <View style={styles.mealDetails}>
      <Text style={styles.detailLabel}>{title}:</Text>
      {menu ? (
        <Text style={styles.detailValue}>{menu}</Text>
      ) : (
        <Text style={styles.noMenu}>식단 정보가 없습니다</Text>
      )}
    </View>
  );
};

// MealCard component to display all meals for a location
const MealCard: React.FC<MealCardProps> = ({ title, meals }) => {
  const theme = useTheme();

  // Add default empty string for meals if undefined
  const safeBreakfast = meals?.breakfast || "";
  const safeLunch = meals?.lunch || "";
  const safeDinner = meals?.dinner || "";

  // Create a divider style with the theme color
  const dividerStyle = {
    ...styles.divider,
    backgroundColor: theme.colors.primary
  };

  return (
    <Surface style={styles.mealCard}>
      <View style={styles.mealCardHeader}>
        <Text style={styles.mealType}>{title}</Text>
      </View>

      <Divider style={dividerStyle} />

      <MealItem title="아침" menu={safeBreakfast} />
      <MealItem title="점심" menu={safeLunch} />
      <MealItem title="저녁" menu={safeDinner} />
    </Surface>
  );
};

// Main component that contains both MealCards and now handles data fetching
const MealInfoCards: React.FC = () => {
  const theme = useTheme();
  const [mealData, setMealData] = useState<MealData>({
    staff: { breakfast: "", lunch: "", dinner: "" },
    dormitory: { breakfast: "", lunch: "", dinner: "" }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMealData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/menu/day/today");
        setMealData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("식단 데이터를 불러오는 중 오류 발생:", err);
        setError("식단 정보를 불러올 수 없습니다.");
        setLoading(false);
      }
    };

    fetchMealData();
  }, []);

  // Add default empty objects for staff and dormitory if undefined
  const staff = mealData?.staff || { breakfast: "", lunch: "", dinner: "" };
  const dormitory = mealData?.dormitory || { breakfast: "", lunch: "", dinner: "" };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>식단 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <MealCard title="교직원 식당" meals={staff} />
      <MealCard title="기숙사 식당" meals={dormitory} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  mealCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: "#fff",
  },
  mealCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mealType: {
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 8,
    // The backgroundColor will be applied dynamically in the component
  },
  mealDetails: {
    flexDirection: "row",
    marginVertical: 6,
  },
  detailLabel: {
    width: 50,
    fontWeight: "bold",
  },
  detailValue: {
    flex: 1,
  },
  noMenu: {
    fontStyle: "italic",
    color: "gray",
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  }
});

export default MealInfoCards;