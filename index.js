require("dotenv").config();
const fs = require("fs");
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELE_TOKEN, { polling: true });

const scenarios = {
  "start": {
    "id": "start",
    "question": {
      "en": "Who are you?",
      "uk": "Хто ви?"
    },
    "buttons": {
      "volunteer": {
        "id": "volunteer",
        "text": {
          "en": "I'm volunteer",
          "uk": "Я волонтер"
        }
      },
      "journalist": {
        "id": "journalist",
        "text": {
          "en": "I'm journalist",
          "uk": "Я журналіст"
        }
      },
      "military": {
        "id": "military",
        "text": {
          "en": "I'm military",
          "uk": "Я військовий"
        }
      }
    }
  },
  "success": {
    "id": "success",
    "question": {
      "en": "THANK YOU",
      "uk": "ДЯКУЄМО"
    },
    "buttons": {
      "start": {
        "id": "start",
        "text": {
          "en": "Start over",
          "uk": "Почати наново"
        }
      }
    }
  },
  "volunteer": {
    "id": "volunteer",
    "question": {
      "en": "Are you requesting or providing help?",
      "uk": "Ви пропонуєте чи просите про допомогу?"
    },
    "buttons": {
      "volunteer_provides_help": {
        "id": "volunteer_provides_help",
        "text": {
          "en": "Providing help",
          "uk": "Пропоную допомогу"
        }
      },
      "volunteer_requests_help": {
        "id": "volunteer_requests_help",
        "text": {
          "en": "Requesting help",
          "uk": "Прошу про допомогу"
        }
      }
    }
  },
  "volunteer_provides_help": {
    "id": "volunteer_provides_help",
    "icon": "🚨",
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "Enter your name",
          "uk": "Введіть ваше ім'я"
        },
      },
      {
        "field": "location",
        "question": {
          "en": "Enter your location",
          "uk": "Введіть вашу локацію"
        },
      },
      {
        "field": "proposition",
        "question": {
          "en": "What you provide?",
          "uk": "Що пропонуєте?"
        },
      },
    ],
  },
  "volunteer_requests_help": {
    "id": "volunteer_requests_help",
    "question": {
      "en": "For who you are asking for help for?",
      "uk": "Для кого ви просите про допомогу?"
    },
    "buttons": {
      "volunteer_requests_military_help": {
        "id": "volunteer_requests_military_help",
        "text": {
          "en": "For military",
          "uk": "Для військових"
        }
      },
      "volunteer_requests_civilian_help": {
        "id": "volunteer_requests_civilian_help",
        "text": {
          "en": "For civilians",
          "uk": "Для цивільних"
        }
      }
    }
  },
  "volunteer_requests_military_help": {
    "id": "volunteer_requests_military_help",
    "icon": "🚑",
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "Enter your name",
          "uk": "Введіть ваше ім'я"
        },
      },
      {
        "field": "location",
        "question": {
          "en": "Enter your location",
          "uk": "Введіть вашу локацію"
        },
      },
      {
        "field": "request",
        "question": {
          "en": "What you need?",
          "uk": "Яка потрібна допомога?"
        },
      },
    ],
  },
  "volunteer_requests_civilian_help": {
    "id": "volunteer_requests_civilian_help",
    "icon": "🚚",
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "Enter your name",
          "uk": "Введіть ваше ім'я"
        },
      },
      {
        "field": "location",
        "question": {
          "en": "Enter your location",
          "uk": "Введіть вашу локацію"
        },
      },
      {
        "field": "beneficiary",
        "question": {
          "en": "Who you are asking for help for?",
          "uk": "Для кого потрібна допомога?"
        },
      },
      {
        "field": "request",
        "question": {
          "en": "What you need?",
          "uk": "Яка потрібна допомога?"
        },
      },
    ],
  },
  "military": {
    "id": "military",
    "icon": "⚔️",
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "Enter your name",
          "uk": "Введіть ваше ім'я"
        },
      },
      {
        "field": "rank",
        "question": {
          "en": "Enter your rank",
          "uk": "Введіть ваше звання"
        },
      },
      {
        "field": "location",
        "question": {
          "en": "Enter your location",
          "uk": "Введіть вашу локацію"
        },
      },
      {
        "field": "unit",
        "question": {
          "en": "Enter your unit",
          "uk": "ВЧ, Бат"
        },
      },
      {
        "field": "deadline",
        "question": {
          "en": "Enter your deadline",
          "uk": "Дедлайн"
        },
      },
      {
        "field": "priority",
        "question": {
          "en": "Enter request priority",
          "uk": "Пріорітет"
        },
      },
      {
        "field": "request",
        "question": {
          "en": "Enter your request",
          "uk": "Введіть ваш запит"
        },
      },
    ],
  },
}

const userState = {};

const renderOptions = (buttons, lang = ['uk', 'en'].includes(lang) ? lang : 'uk', ...opts) => ({
  inline_keyboard: [Object.values(buttons).map(({ id, text }) => ({
    text: text[lang],
    callback_data: id
  }))], ...opts
})

bot.onText(/\/start/, ({ from }) => {
  bot.sendMessage(from.id, scenarios.start.question[from.language_code], { reply_markup: renderOptions(scenarios.start.buttons, from.language_code) });
});

bot.on('callback_query', ({ from: { is_bot, ...from }, message: { message_id, chat: { id } }, data }) => {

  userState[from.id] = userState[from.id]
    ? { ...userState[from.id], scenario: data, icon: scenarios[data] && scenarios[data].icon ? scenarios[data].icon : "⚠️" }
    : { ...from, _questionIndex: 0 }

  if (data === 'start') {
    bot.deleteMessage(id, message_id);
    bot.sendMessage(id, scenarios.start.question[from.language_code], {
      reply_markup: renderOptions(scenarios[data].buttons, from.language_code)
    });
    return;
  }

  if (!!scenarios[data].buttons) {
    bot.editMessageText(scenarios[data].question[from.language_code], {
      chat_id: id,
      message_id,
      reply_markup: renderOptions(scenarios[data].buttons, from.language_code),
    });
    return;
  } else if (scenarios[data].isFinalSequence) {
    bot.editMessageText(scenarios[data].questionSequence[userState[from.id]._questionIndex].question[from.language_code], { chat_id: id, message_id });
    return;
  }

  return console.log('callback_query nothing happened')
});

bot.on('message', ({ from, text, from: { id } }) => {
  if (!userState[id]) return console.log('no user')

  if (!scenarios[userState[id].scenario].questionSequence[userState[id]._questionIndex]) return console.log('no question')

  userState[id][scenarios[userState[id].scenario].questionSequence[userState[id]._questionIndex].field] = text;
  userState[id]._questionIndex++;

  // If there are no more questions in the sequence, send the final message.
  if (userState[id]._questionIndex >= scenarios[userState[id].scenario].questionSequence.length) {
    const { _questionIndex, ...data } = userState[id]
    bot.sendMessage(id, JSON.stringify(data, null, 2));
    bot.sendMessage(process.env.TELE_CHANNEL_ID, JSON.stringify(data, null, 2));
    delete userState[id]
    return;
  }

  bot.sendMessage(id,
    scenarios[userState[id].scenario].questionSequence[userState[id]._questionIndex].question[from.language_code]
  );
});



