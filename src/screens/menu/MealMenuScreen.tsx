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
const dayNames = {
  monday: "월요일",
  tuesday: "화요일", 
  wednesday: "수요일",
  thursday: "목요일",
  friday: "금요일",
  saturday: "토요일",
  sunday: "일요일"
};

// Short Korean day names for tabs
const shortDayNames = {
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
        // Ideally this would hit a weekly endpoint, but we'll use the sample data you provided
        // const response = await axios.get("http://localhost:3000/menu/week");
        
        // Using the sample data you provided
        const sampleData = {
          staff: {
            monday: {
              breakfast: "",
              lunch: "표고콩나물밥,양념장,얼갈이된장국,돈육장조림,꼬마돈까스,무말랭이무침,포기김치,흑미밥,오이고추쌈장무침,도시락김,식빵,딸기잼,셀프계란후라이,음료",
              dinner: "백미밥,순두부찌개,와사비청양마요미트볼,느타리버섯볶음,마늘쫑알마늘무침,포기김치,식빵,딸기잼,셀프계란후라이,조미김"
            },
            tuesday: {
              breakfast: "",
              lunch: "김치볶음밥,맑은콩나물국,치킨가라아게,감자튀김,건새우호박볶음,망고주스(팩),깍두기,흑미밥,마늘쫑양념무침,양상추그린샐러드,식빵,딸기잼,셀프계란후라이,알새우칩",
              dinner: "백미밥,청국장찌개,고등어카레튀김,소떡소떡강정,유부겨자냉채,깍두기,식빵,딸기잼,셀프계란후라이,조미김"
            },
            wednesday: {
              breakfast: "",
              lunch: "백미밥,참치김치찌개,치즈알떡함박,국물떡볶이,레몬청치커리무침,포기김치,흑미밥,청경채굴소스볶음,알새우칩,식빵,딸기잼,셀프계란후라이,음료",
              dinner: "백미밥,시골된장찌개,미나리고추장불고기,고구마누룽지맛탕,연근참깨무침,포기김치,식빵,딸기잼,셀프계란후라이,조미김"
            },
            thursday: {
              breakfast: "",
              lunch: "백미밥,조랭이떡국,묵은지돈육찜,비빔당면,부추겉절이,깍두기,흑미밥,김자반볶음,양상추그린샐러드,식빵,딸기잼,셀프계란후라이,음료",
              dinner: "마파두부덮밥,계란파국,칠리돈육강정,브로콜리맛살볶음,단무지무침,포기김치,식빵,딸기잼,셀프계란후라이,조미김"
            },
            friday: {
              breakfast: "",
              lunch: "백미밥,김치말이국수,단호박부꾸미,볼어묵야채볶음,얼갈이겉절이,깍두기,흑미밥,가지볶음,양상추그린샐러드,식빵,딸기잼,셀프계란후라이,음료",
              dinner: "백미밥,맑은미역국,청양풍닭갈비,새우깡야채튀김,미나리무생채,포기김치,식빵,딸기잼,셀프계란후라이,조미김"
            },
            saturday: {
              breakfast: "",
              lunch: "",
              dinner: ""
            },
            sunday: {
              breakfast: "",
              lunch: "",
              dinner: ""
            }
          },
          dormitory: {
            monday: {
              breakfast: "돈육고추장찌개,맛살계란찜,브로콜리감자볶음,세발나물무침",
              lunch: "스파게티,닭봉오븐구이,그린샐러드,흑임자드레싱,수제피클,콜라,사이다",
              dinner: "도토리묵국,육전,참나물겉절이,꽈리고추어묵볶음,깍두기"
            },
            tuesday: {
              breakfast: "아욱된장국,돈육김치볶음,온두부,도라지생채,김치",
              lunch: "닭백숙,건새우부추전,야채스틱,쌈장,배추겉절이,깍두기",
              dinner: "유부맑은국,단호박범벅,돼지갈비후라이드,숙주나물,김치"
            },
            wednesday: {
              breakfast: "모닝빵,씨리얼,우유,야채샐러드,베이컨구이,소고기야채죽",
              lunch: "콩나물국,돈사태족발(마왕족발st),보쌈무,상추쌈,쌈장,김치",
              dinner: "순두부찌개,임연수구이,매콤계란조림,미니새송이볶음,김치"
            },
            thursday: {
              breakfast: "사골파국,비엔나양송이볶음,진미채무침,취나물들기름볶음,김치",
              lunch: "애호박된장국,청양풍찜닭,청포묵무침,마늘쫑견과류볶음,김치",
              dinner: "순살감자탕,떡갈비조림,잡채,오이양파무침,깍두기"
            },
            friday: {
              breakfast: "북엇국,돈육청경채볶음,연근조림,구운김,김치",
              lunch: "나가사키짬뽕,타코야끼,치커리유자청무침,꼬들단무지,김치,오렌지",
              dinner: "버섯매운국,들깨백불고기,소시지콩나물찜,상추겉절이,김치"
            },
            saturday: {
              breakfast: "모카빵,씨리얼,우유,감자샐러드,방울토마토",
              lunch: "돈육김치찌개,삼치구이,계란말이,미역줄기볶음,김치",
              dinner: "소고기뭇국,고기속깻잎튀김,데리야끼볶음우동,열무고추장무침,김치"
            },
            sunday: {
              breakfast: "호밀식빵,씨리얼,우유,계란후라이,사과",
              lunch: "마파두부덮밥,유부맑은국,목화솜탕수육,양배추샐러드,김치,요구르트",
              dinner: "근대된장국,닭볶음탕,옥수수계란전,청경채겉절이,김치"
            }
          },
          lastUpdated: "2025-03-20T06:43:26.562Z"
        };
        
        setMealData(sampleData);
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
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>식단 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.mainContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!mealData) {
    return (
      <SafeAreaView style={styles.mainContainer}>
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
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>주간 식단표</Text>
        <Text style={styles.updateDate}>최종 업데이트: {formattedDate}</Text>
      </View>
      
      <DaySelector selectedDay={selectedDay} onDayChange={handleDayChange} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.selectedDayHeader}>
          <Text style={styles.selectedDayText}>{dayNames[selectedDay]} 메뉴</Text>
        </View>
        
        <View style={styles.container}>
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
    fontSize: 20,
    fontWeight: "bold",
  },
  updateDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  selectedDayText: {
    fontSize: 18,
    fontWeight: "600",
    color: '#333',
  },
  container: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 24,
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