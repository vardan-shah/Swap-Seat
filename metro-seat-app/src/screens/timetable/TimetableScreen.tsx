import { View, StyleSheet, ScrollView, Image, Dimensions, SafeAreaView, Text } from 'react-native';
import { useAppStore } from '../../store/mockStore';
import { translations } from '../../i18n';

export default function TimetableScreen() {
  const lang = useAppStore((state) => state.language);
  const t = translations[lang];

  // Use a reasonable aspect ratio for the timetable image
  const screenWidth = Dimensions.get('window').width;
  const imageHeight = screenWidth * 1.414; // roughly A4 ratio

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{t.timetable || 'Official Timetable'}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        maximumZoomScale={3}
        minimumZoomScale={1}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
      >
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('../../../assets/Timetable2.png')}
          style={{ width: screenWidth, height: imageHeight }}
          resizeMode="contain"
        />
        <View style={styles.divider} />
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('../../../assets/Timetable.png')}
          style={{ width: screenWidth, height: imageHeight }}
          resizeMode="contain"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 15, backgroundColor: '#FF8200', alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  divider: { height: 20, width: '100%', backgroundColor: '#f0f0f0' },
});
