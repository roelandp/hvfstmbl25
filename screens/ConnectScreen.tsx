
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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { getFaq, FaqItem } from '../data/getFaq';

export default function ConnectScreen({ navigation }: any) {
  const [faqData, setFaqData] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredFaqs, setFilteredFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    loadFaqData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = faqData.filter(item => item.category === selectedCategory);
      setFilteredFaqs(filtered);
    }
  }, [selectedCategory, faqData]);

  const loadFaqData = async () => {
    try {
      const data = await getFaq();
      setFaqData(data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
      setCategories(uniqueCategories);
      
      // Set the first category as selected by default
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }
    } catch (error) {
      console.error('Error loading FAQ data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFaqItem = ({ item }: { item: FaqItem }) => (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => navigation.navigate('FaqDetail', { faqId: item.id })}
    >
      <View style={styles.faqContent}>
        <Text style={styles.faqTitle}>{item.title}</Text>
        <Text style={styles.faqPreview} numberOfLines={2}>
          {item.description.replace(/<[^>]*>/g, '')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
    </TouchableOpacity>
  );

  const renderCategoryTab = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === category && styles.selectedCategoryTabText,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
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
            <View style={styles.headerTitleContainer}>
              <Ionicons name="help-circle" size={24} color="white" />
              <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
            </View>
          </View>

          {/* Category Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}
            >
              {categories.map(renderCategoryTab)}
            </ScrollView>
          </View>

          {/* FAQ List */}
          <View style={styles.content}>
            {filteredFaqs.length > 0 ? (
              <FlatList
                data={filteredFaqs}
                renderItem={renderFaqItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Ionicons name="document-text-outline" size={64} color={theme.colors.muted} />
                <Text style={styles.noDataText}>No FAQ items found</Text>
                <Text style={styles.noDataSubtext}>
                  Try selecting a different category
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
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
    paddingVertical: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    marginLeft: 12,
  },
  tabsContainer: {
    backgroundColor: theme.colors.primary,
    paddingBottom: 8,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedCategoryTab: {
    backgroundColor: '#f27d42',
  },
  categoryTabText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
  },
  selectedCategoryTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faqContent: {
    flex: 1,
    marginRight: 12,
  },
  faqTitle: {
    fontSize: 16,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  faqPreview: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.muted,
    lineHeight: 20,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noDataText: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
});
