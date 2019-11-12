require('dotenv').config();
import Telegraf from 'telegraf';
import { connect, connection } from 'mongoose';

import { logger } from './utils/logger.util';
import { getMainKeyboard } from './utils/keyboard.util';

connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
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
  const bot = new Telegraf(process.env.BOT_TOKEN);
  const { mainKeyboard } = getMainKeyboard();

  bot.start(ctx => ctx.reply('Welcome', mainKeyboard));

  bot.launch();
});
