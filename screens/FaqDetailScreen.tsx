
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { getFaq, FaqItem } from '../data/getFaq';

export default function FaqDetailScreen({ route, navigation }: any) {
  const { faqId } = route.params;
  const [faqItem, setFaqItem] = useState<FaqItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFaqDetails();
  }, []);

  const loadFaqDetails = async () => {
    try {
      const faqData = await getFaq();
      const foundFaq = faqData.find((item: FaqItem) => item.id === faqId);
      
      if (foundFaq) {
        setFaqItem(foundFaq);
      }
    } catch (error) {
      console.error('Error loading FAQ details:', error);
      Alert.alert('Error', 'Failed to load FAQ details');
    } finally {
      setLoading(false);
    }
  };

  const generateHTML = (description: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            margin: 16px;
            background-color: #fff;
          }
          h1, h2, h3, h4, h5, h6 {
            color: #062c20;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          p {
            margin-bottom: 16px;
          }
          a {
            color: #f27d42;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          ul, ol {
            margin-bottom: 16px;
            padding-left: 20px;
          }
          li {
            margin-bottom: 8px;
          }
          strong, b {
            font-weight: 600;
          }
          em, i {
            font-style: italic;
          }
        </style>
      </head>
      <body>
        ${description}
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor={theme.colors.primary}
          barStyle="light-content"
          animated={true}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading FAQ...</Text>
        </View>
      </>
    );
  }

  if (!faqItem) {
    return (
      <>
        <StatusBar
          translucent
          backgroundColor={theme.colors.primary}
          barStyle="light-content"
          animated={true}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.muted} />
          <Text style={styles.errorText}>FAQ item not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.backIconButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="help-circle" size={24} color="white" />
              <Text style={styles.headerCategory}>{faqItem.category}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.faqTitle}>{faqItem.title}</Text>
            </View>
            
            <WebView
              style={styles.webview}
              source={{ html: generateHTML(faqItem.description) }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              bounces={false}
              scrollEnabled={true}
            />
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
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIconButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCategory: {
    color: 'white',
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  titleContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faqTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.heading,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 32,
  },
  webview: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
});
