/**
 * Firebase Cloud Messaging Service
 * Replaces Expo Push Notifications with native Firebase FCM
 */
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

/**
 * Request notification permissions and get FCM token
 * @returns FCM token string or null if permission denied
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    // Request permission (required for iOS 10+, Android 13+)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('❌ Push notification permission denied');
      console.log('Authorization status:', authStatus);
      return null;
    }

    console.log('✅ Push notification permission granted');

    // Get FCM token
    const fcmToken = await messaging().getToken();

    if (fcmToken) {
      console.log('✅ FCM Token generated successfully!');
      console.log('Token:', fcmToken);
      return fcmToken;
    } else {
      console.log('❌ Failed to get FCM token');
      return null;
    }
  } catch (error) {
    console.log('❌ Error getting FCM token:', error);
    console.log('Error details:', JSON.stringify(error, null, 2));
    return null;
  }
}

/**
 * Set up notification listeners for foreground and background messages
 */
export function setupNotificationListeners(
  onNotificationReceived: (notification: any) => void,
  onNotificationTapped: (notification: any) => void
) {
  // Handle foreground messages
  const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
    console.log('📨 Foreground notification received:', remoteMessage);
    onNotificationReceived(remoteMessage);
  });

  // Handle notification opened (user tapped on notification)
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('📨 Notification opened app:', remoteMessage);
    onNotificationTapped(remoteMessage);
  });

  // Check if app was opened from a notification (when app was quit)
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('📨 App opened from quit state by notification:', remoteMessage);
        onNotificationTapped(remoteMessage);
      }
    });

  // Handle background messages (optional - for data-only messages)
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('📨 Background message handled:', remoteMessage);
  });

  // Return cleanup function
  return () => {
    unsubscribeForeground();
  };
}

/**
 * Helper to extract navigation data from Firebase notification
 */
export function getNotificationNavigationData(notification: any): {
  type: string | null;
  action: string | null;
  targetScreen: string | null;
} {
  const data = notification.data || {};

  let targetScreen: string | null = null;

  if (data.type === 'attendance' && data.action === 'open_attendance') {
    targetScreen = 'AttendanceHistory';
  } else if (data.type === 'message' && data.action === 'open_messages') {
    targetScreen = 'Messages';
  }

  return {
    type: data.type || null,
    action: data.action || null,
    targetScreen,
  };
}

/**
 * Subscribe to a topic (useful for broadcast notifications)
 */
export async function subscribeToTopic(topic: string): Promise<void> {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`✅ Subscribed to topic: ${topic}`);
  } catch (error) {
    console.log(`❌ Failed to subscribe to topic ${topic}:`, error);
  }
}

/**
 * Unsubscribe from a topic
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`✅ Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.log(`❌ Failed to unsubscribe from topic ${topic}:`, error);
  }
}

/**
 * Delete the FCM token (useful for logout)
 */
export async function deleteFCMToken(): Promise<void> {
  try {
    await messaging().deleteToken();
    console.log('✅ FCM token deleted');
  } catch (error) {
    console.log('❌ Failed to delete FCM token:', error);
  }
}
