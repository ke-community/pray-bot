import I18n from 'telegraf-i18n';

import { needsQueue } from '../reminder-queue';

export const setReminder = async (id: string, i18n: I18n, cron: string, tz: string) =>
  await needsQueue.add(
    id,
    {
      id,
      message: i18n.t('scenes.remind.reminder_message'),
    },
    { repeat: { cron, tz } },
  );
