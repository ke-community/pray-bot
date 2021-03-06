import I18n from 'telegraf-i18n';
import { Extra, Markup } from 'telegraf';

import { Need } from '../../../models';
import { NEED_STATUS } from '../../lib/constants';

export const getNeedControlMenu = (i18n: I18n, need: Need, id: string) =>
  Extra.HTML().markup((m: Markup) => {
    return m.inlineKeyboard(
      [
        m.callbackButton(
          i18n.t('common.delete_button'),
          JSON.stringify({ action: 'delete', payload: id }),
          need.status === NEED_STATUS.ANSWERED,
        ),
        m.callbackButton(
          i18n.t('scenes.need.edit_status_button'),
          JSON.stringify({ action: 'edit_status', payload: id }),
          need.status === NEED_STATUS.ANSWERED,
        ),
        m.callbackButton(
          i18n.t('keyboards.back.button'),
          JSON.stringify({ action: 'back', payload: undefined }),
          need.status === NEED_STATUS.ANSWERED,
        ),
      ],
      {},
    );
  });
