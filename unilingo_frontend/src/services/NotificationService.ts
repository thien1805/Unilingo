import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { notificationsAPI, NotificationSettings } from '../api/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DEFAULT_SETTINGS: NotificationSettings = {
  daily_reminder: true,
  reminder_time: '09:00:00',
  new_words_reminder: true,
  streak_reminder: true,
  leaderboard_update: true,
  event_notifications: true,
  blog_notifications: true,
  forecast_notifications: true,
  tips_notifications: true,
  news_notifications: true,
};

const requestPermissions = async () => {
  if (Platform.OS === 'web') return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  return true;
};

const parseReminderTime = (value: string) => {
  const [hour = '9', minute = '0'] = value.split(':');
  return {
    hour: Number(hour) || 9,
    minute: Number(minute) || 0,
  };
};

const getExpoProjectId = () => {
  const constants = Constants as typeof Constants & {
    easConfig?: { projectId?: string };
    expoConfig?: { extra?: { eas?: { projectId?: string } } };
  };

  return constants.easConfig?.projectId || constants.expoConfig?.extra?.eas?.projectId;
};

export const registerDeviceForPush = async () => {
  if (Platform.OS === 'web') return;

  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  try {
    const projectId = getExpoProjectId();
    let pushToken = '';

    if (Platform.OS === 'android') {
      try {
        const nativeToken = await Notifications.getDevicePushTokenAsync();
        pushToken = nativeToken?.data ? String(nativeToken.data) : '';
      } catch (nativeTokenError) {
        console.log('Native push token unavailable', nativeTokenError);
      }
    }

    if (!pushToken) {
      try {
        const expoToken = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );
        pushToken = expoToken?.data ? String(expoToken.data) : '';
      } catch (expoTokenError) {
        console.log('Expo push token unavailable', expoTokenError);
      }
    }

    if (!pushToken) {
      console.log('Push token registration skipped: no compatible push token available.');
      return;
    }

    await notificationsAPI.registerDevice({
      fcm_token: pushToken,
      device_type: Platform.OS === 'ios' ? 'ios' : 'android',
      device_name: `${Platform.OS} device`,
    });
  } catch (error) {
    console.log('Device push token registration skipped', error);
  }
};

export const syncNotificationPreferences = async (settings?: NotificationSettings) => {
  if (Platform.OS === 'web') return;

  const hasPermission = await requestPermissions();
  if (!hasPermission) return;

  const preferences = settings || await notificationsAPI.getSettings().catch(() => DEFAULT_SETTINGS);

  await Notifications.cancelAllScheduledNotificationsAsync();

  if (preferences.daily_reminder) {
    const { hour, minute } = parseReminderTime(preferences.reminder_time);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to practice',
        body: 'Complete a short IELTS Speaking session and keep your streak moving.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      } as Notifications.NotificationTriggerInput,
    });
  }

  if (preferences.new_words_reminder) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Vocabulary review',
        body: 'Review saved words before they fade from memory.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      } as Notifications.NotificationTriggerInput,
    });
  }

  if (preferences.streak_reminder) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Streak check',
        body: 'A quick answer is enough to keep today active.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 18,
        minute: 30,
      } as Notifications.NotificationTriggerInput,
    });
  }

  await registerDeviceForPush();
  console.log('Notification preferences synced successfully.');
};
