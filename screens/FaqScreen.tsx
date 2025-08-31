
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { getFaq, FaqItem } from '../data/getFaq';

interface FaqSection {
  title: string;
  data: FaqItem[];
  icon: string;
}

export default function FaqScreen({ navigation }: any) {
  const [faqSections, setFaqSections] = useState<FaqSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFaqData();
  }, []);

  const loadFaqData = async () => {
    try {
      const data = await getFaq();

      // Group FAQ items by category
      const groupedFaqs = data.reduce((acc: Record<string, FaqItem[]>, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});

      // Convert to sections with icons
      const sections: FaqSection[] = Object.entries(groupedFaqs).map(([category, items]) => ({
        title: category,
        data: items,
        icon: getCategoryIcon(category)
      }));

      setFaqSections(sections);
    } catch (error) {
      console.error('Error loading FAQ data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('general')) return 'settings-outline';
    if (categoryLower.includes('technical') || categoryLower.includes('tech')) return 'construct-outline';
    if (categoryLower.includes('event') || categoryLower.includes('schedule')) return 'calendar-outline';
    if (categoryLower.includes('location') || categoryLower.includes('venue')) return 'location-outline';
    if (categoryLower.includes('audio') || categoryLower.includes('tour')) return 'headset-outline';
    if (categoryLower.includes('payment') || categoryLower.includes('money')) return 'card-outline';
    if (categoryLower.includes('food') || categoryLower.includes('dining')) return 'restaurant-outline';
    if (categoryLower.includes('transport') || categoryLower.includes('travel')) return 'car-outline';
    if (categoryLower.includes('contact') || categoryLower.includes('support')) return 'mail-outline';
    if (categoryLower.includes('safety') || categoryLower.includes('security')) return 'shield-outline';
    return 'help-circle-outline';
  };

  const renderFaqItem = ({ item, index, section }: { item: FaqItem; index: number; section: FaqSection }) => (
    <TouchableOpacity
      style={[
        styles.faqItem,
        index === 0 && styles.firstItem,
        index === section.data.length - 1 && styles.lastItem,
      ]}
      onPress={() => navigation.navigate('FaqDetail', { faqId: item.id })}
    >
      <View style={styles.faqContent}>
        <Text style={styles.faqTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.faqPreview} numberOfLines={1}>
          {item.description.replace(/<[^>]*>/g, '')}
        </Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={18} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: FaqSection }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={section.icon} size={20} color="white" />
        </View>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor={theme.colors.primary}
          barStyle="light-content"
          animated={true}
        />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading FAQ...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar
        translucent
        backgroundColor={theme.colors.primary}
        barStyle="light-content"
        animated={true}
      />
      <View style={{ backgroundColor: theme.colors.primary, flex: 1 }}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>FAQ</Text>
          </View>

          {/* Content */}
          <SectionList
            sections={faqSections}
            renderItem={renderFaqItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
          />
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 34,
    fontFamily: theme.fonts.heading,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    backgroundColor: '#F2F2F7',
    paddingTop: 35,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 29,
    height: 29,
    borderRadius: 6,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: theme.fonts.body,
    fontWeight: '400',
    color: '#000000',
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C6C6C8',
    marginHorizontal: 16,
  },
  firstItem: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  lastItem: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomWidth: 0,
  },
  faqContent: {
    flex: 1,
    marginRight: 12,
  },
  faqTitle: {
    fontSize: 17,
    fontFamily: theme.fonts.body,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 2,
  },
  faqPreview: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: '#8E8E93',
  },
});
