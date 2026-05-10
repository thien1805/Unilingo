import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const setupHourlyReminders = async () => {
  if (Platform.OS === 'web') return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }

  // Clear existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule new hourly notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to practice! 🚀",
      body: "Don't break your streak! Complete a quick 5-minute IELTS practice session to keep your English sharp.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1 * 60, // 1 minu
      repeats: true,
    },
  });
  
  console.log('Hourly reminders scheduled successfully.');
};
