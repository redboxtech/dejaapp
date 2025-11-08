import * as Notifications from "expo-notifications";
import type { NotificationTriggerInput } from "expo-notifications";

const normalizeTrigger = (
  trigger: Date | NotificationTriggerInput | undefined
): NotificationTriggerInput => {
  if (!trigger) {
    return null;
  }

  if (trigger instanceof Date) {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger
    };
  }

  return trigger;
};

export const notificationService = {
  configure() {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false
      })
    });
  },

  async requestPermissions() {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status !== "granted" && canAskAgain) {
      await Notifications.requestPermissionsAsync();
    }
  },

  async scheduleLocalNotification(
    title: string,
    body: string,
    trigger?: Date | NotificationTriggerInput
  ) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: normalizeTrigger(trigger)
    });
  }
};

