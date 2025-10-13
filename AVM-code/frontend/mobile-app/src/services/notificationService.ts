import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('✅ Expo Push Token:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  // Android-specific setup
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
    });
  }

  return token;
}

export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void
) {
  // Listen for notifications received while app is foregrounded
  const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);

  // Listen for user tapping on notifications
  const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);

  // Cleanup function
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}

export async function scheduleLocalNotification(title: string, body: string, data?: any) {
  // Ensure we have the notification channel set up for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Show immediately
  });
}

// Helper to extract navigation data from notification
export function getNotificationNavigationData(response: Notifications.NotificationResponse): {
  type: string | null;
  action: string | null;
  targetScreen: string | null;
} {
  const data = response.notification.request.content.data;

  let targetScreen: string | null = null;

  if (data.type === 'attendance' && data.action === 'open_attendance') {
    targetScreen = 'AttendanceHistory';
  } else if (data.type === 'message' && data.action === 'open_messages') {
    targetScreen = 'Messages';
  }

  return {
    type: (typeof data.type === 'string' ? data.type : null),
    action: (typeof data.action === 'string' ? data.action : null),
    targetScreen,
  };
}
