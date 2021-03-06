import * as path from 'path';
import session from 'telegraf/session';
import TelegrafI18n, { match } from 'telegraf-i18n';
import { connect, connection } from 'mongoose';
import { ContextMessageUpdate } from 'telegraf';

import Stage from 'telegraf/stage';

import { bot } from './bot';
import { logger } from './lib/logger';
import { getMainKeyboard } from './lib/keyboards';
import { SCENES, startScene, remindScene, aboutUsScene, statisticsScene } from './scenes';
import { UserModel } from './models';
import { needScene } from './scenes/need';

connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
})
  .then(() => logger.info('Successfull database connection'))
  .catch(err =>
    logger.error(
      'Error occurred during an attempt to establish connection with the database',
      err,
    ),
  );

connection.on('open', () => {
  const stage = new Stage([
    needScene,
    startScene,
    remindScene,
    aboutUsScene,
    statisticsScene,
  ]);

  const i18nTelegraf = new TelegrafI18n({
    defaultLanguage: 'ru',
    directory: path.resolve(__dirname, 'lib/locales'),
    useSession: true,
    allowMissing: false,
    sessionName: 'session',
  });

  bot.use(session());
  bot.use(i18nTelegraf.middleware());
  bot.use(stage.middleware());

  bot.start(async ({ scene }: ContextMessageUpdate) => scene.enter(SCENES.START));
  bot.hears(
    match('keyboards.main.need'),
    async ({ scene }: ContextMessageUpdate) => await scene.enter(SCENES.NEED),
  );
  bot.hears(
    match('keyboards.main.remind'),
    async ({ scene }: ContextMessageUpdate) => await scene.enter(SCENES.REMIND),
  );
  bot.hears(
    match('keyboards.main.about_us'),
    async ({ scene }: ContextMessageUpdate) => await scene.enter(SCENES.ABOUT_US),
  );
  bot.hears(
    match('keyboards.main.statistics'),
    async ({ scene }: ContextMessageUpdate) => await scene.enter(SCENES.STATISTICS),
  );

  bot.hears(
    match('keyboards.back.button'),
    async ({ reply, i18n }: ContextMessageUpdate) => {
      const { mainKeyboard } = getMainKeyboard(i18n);

      await reply(i18n.t('common.middleware_message'), mainKeyboard);
    },
  );

  bot.action(/prayed/, async ({ from, i18n, editMessageText }: ContextMessageUpdate) => {
    const { id } = from;

    await UserModel.findByIdAndUpdate(
      { _id: id.toString() },
      { $inc: { totalPrayers: 1 } },
    );

    await editMessageText(i18n.t('scenes.remind.prayed_success_message'));
  });

  bot.catch((error: Error) => logger.error('Global error has happened', error));
  bot.startPolling();
});
