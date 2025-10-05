import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.4:8000/api/v1';

interface Message {
  id: number;
  subject: string;
  message: string;
  sender_name: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export default function MessagesScreen({ navigation }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/messages/inbox`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(response.data);
    } catch (error: any) {
      console.error('Error loading messages:', error.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMessages();
  }, []);

  const markAsRead = async (message: Message) => {
    if (message.is_read) return;

    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.put(
        `${API_BASE_URL}/messages/${message.id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setMessages(prev =>
        prev.map(msg =>
          msg.id === message.id ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMessagePress = (message: Message) => {
    setSelectedMessage(message);
    markAsRead(message);
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      style={[styles.messageCard, !item.is_read && styles.unreadMessage]}
      onPress={() => handleMessagePress(item)}
    >
      <View style={styles.messageHeader}>
        <View style={styles.messageInfo}>
          <Text style={[styles.senderName, !item.is_read && styles.boldText]}>
            {item.sender_name}
          </Text>
          <Text style={styles.messageDate}>{formatDate(item.created_at)}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadBadge} />}
      </View>
      <Text style={[styles.messageSubject, !item.is_read && styles.boldText]} numberOfLines={1}>
        {item.subject}
      </Text>
      <Text style={styles.messagePreview} numberOfLines={2}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  if (selectedMessage) {
    return (
      <View style={styles.container}>
        {/* Message Detail View */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToList} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Message</Text>
        </View>

        <View style={styles.messageDetail}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailSender}>{selectedMessage.sender_name}</Text>
            <Text style={styles.detailDate}>{formatDate(selectedMessage.created_at)}</Text>
          </View>
          <Text style={styles.detailSubject}>{selectedMessage.subject}</Text>
          <View style={styles.divider} />
          <Text style={styles.detailMessage}>{selectedMessage.message}</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>You'll see messages from school here</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMessage}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 48,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 14,
    color: '#1F2937',
  },
  boldText: {
    fontWeight: '600',
  },
  messageDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
    marginLeft: 8,
  },
  messageSubject: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  messageDetail: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailSender: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailSubject: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  detailMessage: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});
