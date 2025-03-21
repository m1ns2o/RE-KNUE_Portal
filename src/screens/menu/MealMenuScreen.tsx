import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Surface, Text, Divider, useTheme, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

// Define interfaces for our data structure
interface Meal {
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface DayMeals {
  monday: Meal;
  tuesday: Meal;
  wednesday: Meal;
  thursday: Meal;
  friday: Meal;
  saturday: Meal;
  sunday: Meal;
  [key: string]: Meal; // 인덱스 시그니처 추가
}

interface MealData {
  staff: DayMeals;
  dormitory: DayMeals;
  lastUpdated: string;
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

interface DaySelectorProps {
  selectedDay: string;
  onDayChange: (day: string) => void;
}

// Korean day names mapping
const dayNames: {[key: string]: string} = {
  monday: "월요일",
  tuesday: "화요일", 
  wednesday: "수요일",
  thursday: "목요일",
  friday: "금요일",
  saturday: "토요일",
  sunday: "일요일"
};

// Short Korean day names for tabs
const shortDayNames: {[key: string]: string} = {
  monday: "월",
  tuesday: "화", 
  wednesday: "수",
  thursday: "목",
  friday: "금",
  saturday: "토",
  sunday: "일"
};

// Day selector component
const DaySelector: React.FC<DaySelectorProps> = ({ selectedDay, onDayChange }) => {
  const theme = useTheme();
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  
  return (
    <View style={styles.daySelector}>
      {days.map((day) => (
        <TouchableOpacity
          key={day}
          onPress={() => onDayChange(day)}
          style={[
            styles.dayTab,
            selectedDay === day ? styles.selectedDayTab : null
          ]}
        >
          <Text 
            style={[
              styles.dayTabText, 
              selectedDay === day ? { color: theme.colors.primary, fontWeight: 'bold' } : { color: '#777' }
            ]}
          >
            {shortDayNames[day]}
          </Text>
          {selectedDay === day && <View style={[styles.indicator, { backgroundColor: theme.colors.primary }]} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

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

// Main component that contains both MealCards and handles data fetching
const WeeklyMealMenu: React.FC = () => {
  const theme = useTheme();
  const [mealData, setMealData] = useState<MealData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    // Default to current day of week
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date().getDay();
    return days[today];
  });

  useEffect(() => {
    const fetchMealData = async () => {
      try {
        setLoading(true);
        // API에서 주간 식단표 데이터 가져오기
        const response = await axios.get("http://localhost:3000/menu");
        
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

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.mainContainer, { backgroundColor: '#ffffff' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>식단 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.mainContainer, { backgroundColor: '#ffffff' }]}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!mealData) {
    return (
      <SafeAreaView style={[styles.mainContainer, { backgroundColor: '#ffffff' }]}>
        <Text style={styles.errorText}>데이터를 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  // Get meals for the selected day
  const staffMeals = mealData.staff[selectedDay];
  const dormitoryMeals = mealData.dormitory[selectedDay];

  // Format the last updated date
  const lastUpdated = new Date(mealData.lastUpdated);
  const formattedDate = `${lastUpdated.getFullYear()}-${String(lastUpdated.getMonth() + 1).padStart(2, '0')}-${String(lastUpdated.getDate()).padStart(2, '0')}`;

  return (
    <SafeAreaView style={[styles.mainContainer, { backgroundColor: '#ffffff' }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>주간 식단표</Text>
        <Text style={styles.updateDate}>최종 업데이트: {formattedDate}</Text>
      </View>
      
      <DaySelector selectedDay={selectedDay} onDayChange={handleDayChange} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.selectedDayHeader}>
            <Text style={styles.selectedDayText}>{dayNames[selectedDay]} 메뉴</Text>
          </View>
          
          <MealCard title="교직원 식당" meals={staffMeals} />
          <MealCard title="기숙사 식당" meals={dormitoryMeals} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  updateDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  daySelector: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  dayTab: {
    flex: 1,
    minWidth: 50,
    maxWidth: 55,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  selectedDayTab: {
    backgroundColor: '#f8f8f8',
  },
  dayTabText: {
    fontSize: 15,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scrollContainer: {
    flex: 1,
  },
  selectedDayHeader: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  selectedDayText: {
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
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
    flex: 1,
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
    padding: 16,
  }
});

export default WeeklyMealMenu;