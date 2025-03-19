import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Animated, 
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { 
  Text, 
  useTheme, 
  Avatar,
  Divider
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');
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
          pointerEvents: visible ? 'auto' : 'none',
          opacity: backdropOpacity // 전체 컨테이너의 opacity를 백드롭과 연결
        }
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
          }
        ]}
      >
        {/* 상단 사용자 프로필 영역 */}
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <Avatar.Image 
            source={{ uri: 'https://via.placeholder.com/60' }} 
            size={60}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>사용자 이름</Text>
            <Text style={styles.userEmail}>user@email.com</Text>
          </View>
        </View>
        
        {/* 메뉴 아이템 목록 */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateTo('Home')}
          >
            <MaterialIcons name="home" size={24} color={theme.colors.primary} />
            <Text style={styles.menuText}>홈</Text>
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateTo('Trip')}
          >
            <MaterialIcons name="flight" size={24} color={theme.colors.primary} />
            <Text style={styles.menuText}>외박 신청</Text>
          </TouchableOpacity>
          
          <Divider />
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => navigateTo('Login')}
          >
            <MaterialIcons name="exit-to-app" size={24} color={theme.colors.primary} />
            <Text style={styles.menuText}>로그아웃</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    height: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
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
    paddingTop: 40, // 상태 표시줄 높이 고려
    paddingBottom: 20,
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: 'white',
    marginBottom: 10,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 32,
  },
});

export default PaperDrawer;