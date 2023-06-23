require("dotenv").config();
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELE_TOKEN, { polling: true });

const messages = {
  hello: {
    ua: "Привіт, я чат бот благодійного фонду «Інтернаціональний легіон допомоги»!",
    en: `Hello! I am International Aid Legion's telegram bot`,
  },
  military: { ua: "Я Військовий", en: "I'm Military" },
  volunteer: { ua: "Я Волонтер", en: "I'm a Volunteer" },
  public_figure: { ua: "Я Громадський Діяч", en: "I'm a Public Figure" },
  media: { ua: "Я ЗМІ / Блогер", en: "I'm Media / Blogger" },
  volunteerHello: {
    ua: "Ви пропонуєте допомогу чи просите про допомогу?",
    en: "Are you offering help or asking for help?",
  },
  volunteerOfferingHelp: {
    ua: "Пропоную допомогу",
    en: "Offering help",
  },
  volunteerAskingHelp: {
    ua: "Прошу про допомогу",
    en: "Asking for help",
  },
};

const save = async (msg) => {
  const {
    message_id,
    text,
    from: { username, first_name, last_name },
  } = msg;

  try {
    let data = [];
    if (fs.existsSync("data.json")) {
      const dataContent = await fs.promises.readFile("data.json", "utf-8");
      data = dataContent ? JSON.parse(dataContent) : [];
    }
    data.push(msg);
    await fs.promises.writeFile("data.json", JSON.stringify(data));
  } catch (error) {
    console.error("Error writing message into data.json", msg, error);
  }

  try {
    await bot.sendMessage(
      process.env.TELE_CHANNEL_ID,
      `@${username} ${first_name} ${last_name} [${message_id}]\n\n${text}`
    );
  } catch (error) {
    console.error("Error sending message to channel", msg, error);
  }
};

bot.onText(/\/start/, (msg) => {
  const {
    chat: { id },
    from: { language_code },
  } = msg;

  const lang = ["en", "ua"].includes(language_code) ? language_code : "ua";

  const config = {
    home: {
      message: messages.hello[lang],
      options: {
        reply_markup: {
          keyboard: [
            [messages.military[lang], messages.volunteer[lang]],
            [messages.public_figure[lang], messages.media[lang]],
          ],
          one_time_keyboard: true,
        },
      },
    },
    volunteer: {
      message: messages.volunteerHello[lang],
      options: {
        reply_markup: {
          keyboard: [
            messages.volunteerOfferingHelp[lang],
            messages.volunteerAskingHelp[lang],
          ],
          one_time_keyboard: true,
        },
      },
    },
  };

  bot.sendMessage(id, config.home.message, config.home.options);

  bot.on("message", async (msg) => {
    console.log(msg.text);
    // await save(msg);
  });
});
