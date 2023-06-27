require("dotenv").config()
const _ = require('lodash');
const { google } = require('googleapis');
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELE_TOKEN, { polling: true });

const scenarios = {
  "start": {
    "id": "start",
    "question": {
      "en": "Who are you?",
      "uk": "Хто ви є?"
    },
    "buttons": {
      "military": {
        "id": "military",
        "text": {
          "en": "Military",
          "uk": "Військовий"
        }
      },
      "volunteer": {
        "id": "volunteer",
        "text": {
          "en": "Volunteer",
          "uk": "Волонтер"
        }
      },
      "public_figure": {
        "id": "public_figure",
        "text": {
          "en": "Public figure",
          "uk": "Громадський діяч"
        }
      },
      "journalist": {
        "id": "journalist",
        "text": {
          "en": "Journalist / blogger",
          "uk": "Журналіст / блогер"
        }
      },
      "anonymous": {
        "id": "anonymous",
        "text": {
          "en": "Anonymous / other",
          "uk": "Анон / інше"
        }
      }
    }
  },
  "success": {
    "id": "success",
    "question": {
      "en": "THANK YOU!\nWe will contact you very soon!",
      "uk": "ДЯКУЄМО!\nМи зв'яжемося з вами дуже скоро!"
    },
    "buttons": {
      "start": {
        "id": "start",
        "text": {
          "en": "Add another request",
          "uk": "Зробити ще запит"
        }
      }
    }
  },
  "military": {
    "id": "military",
    "icon": "⚔️",
    "managers": ['feysk', 'illinifellow'],
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "What's your name?",
          "uk": "Як вас звуть?"
        },
      },
      {
        "field": "rank",
        "question": {
          "en": "What's your rank?",
          "uk": "Яке ваше звання?"
        },
      },
      {
        "field": "location",
        "question": {
          "en": "Where are you located?",
          "uk": "Де ви знаходитесь?"
        },
      },
      {
        "field": "organization",
        "question": {
          "en": "What's your unit?",
          "uk": "З якої ви ВЧ, бат?"
        },
      },
      {
        "field": "deadline",
        "question": {
          "en": "What's the deadline?",
          "uk": "Коли дедлайн?"
        },
      },
      {
        "field": "priority",
        "question": {
          "en": "What's the priority?",
          "uk": "Який пріорітет?"
        },
      },
      {
        "field": "request",
        "question": {
          "en": "What's your request?",
          "uk": "Яка потрібна допомога?"
        },
      },
    ],
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
    "managers": ['feysk', 'illinifellow'],
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "What's your name?",
          "uk": "Як вас звуть?"
        },
      },
      {
        "field": "location",
        "question": {
          "en": "Where are you located?",
          "uk": "Де ви знаходитесь?"
        },
      },
      {
        "field": "request",
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
    "managers": ['feysk', 'illinifellow'],
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "What's your name?",
          "uk": "Як вас звуть?"
        },
      },
      {
        "field": "location",
        "question": {
          "en": "Where are you located?",
          "uk": "Де ви знаходитесь?"
        },
      },
      {
        "field": "request",
        "question": {
          "en": "What's your request?",
          "uk": "Яка потрібна допомога?"
        },
      },
    ],
  },
  "volunteer_requests_civilian_help": {
    "id": "volunteer_requests_civilian_help",
    "icon": "🚚",
    "managers": ['feysk', 'illinifellow'],
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "What's your name?",
          "uk": "Як вас звуть?"
        },
      },
      {
        "field": "location",
        "question": {
          "en": "Where are you located?",
          "uk": "Де ви знаходитесь?"
        },
      },
      {
        "field": "for",
        "question": {
          "en": "Who you are asking for help for?",
          "uk": "Для кого потрібна допомога?"
        },
      },
      {
        "field": "request",
        "question": {
          "en": "What's your request?",
          "uk": "Яка потрібна допомога?"
        },
      },
    ],
  },
  "public_figure": {
    "id": "public_figure",
    "icon": "🕺",
    "managers": ['feysk', 'illinifellow'],
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "What's your name?",
          "uk": "Як вас звуть?"
        },
      },
      {
        "field": "location",
        "question": {
          "en": "Where are you located?",
          "uk": "Де ви знаходитесь?"
        },
      },
      {
        "field": "contact",
        "question": {
          "en": "How can we contact you?",
          "uk": "Як з вами зв'язатись?"
        },
      },
      {
        "field": "request",
        "question": {
          "en": "What you provide/request?",
          "uk": "Що пропонуєте/шукаєте?"
        },
      },
    ],
  },
  "journalist": {
    "id": "journalist",
    "icon": "📝",
    "managers": ['feysk', 'illinifellow'],
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "What's your name?",
          "uk": "Як вас звуть?"
        },
      },
      {
        "field": "organization",
        "question": {
          "en": "What's the name of your organization?",
          "uk": "Як називається ваша організація?"
        },
      },
      {
        "field": "contact",
        "question": {
          "en": "How can we contact you?",
          "uk": "Як з вами зв'язатись?"
        },
      },
      {
        "field": "request",
        "question": {
          "en": "What you provide/request?",
          "uk": "Що пропонуєте/шукаєте?"
        },
      },
    ],
  },
  "anonymous": {
    "id": "anonymous",
    "icon": "🌚",
    "managers": ['feysk', 'illinifellow'],
    "isFinalSequence": true,
    "questionSequence": [
      {
        "field": "name",
        "question": {
          "en": "What's your name?",
          "uk": "Як вас звуть?"
        },
      },
      {
        "field": "location",
        "question": {
          "en": "Where are you located?",
          "uk": "Де ви знаходитесь?"
        },
      },
      {
        "field": "contact",
        "question": {
          "en": "How can we contact you?",
          "uk": "Як з вами зв'язатись?"
        },
      },
      {
        "field": "deadline",
        "question": {
          "en": "What's the deadline?",
          "uk": "Коли дедлайн?"
        },
      },
      {
        "field": "request",
        "question": {
          "en": "What you provide/request?",
          "uk": "Що пропонуєте/шукаєте?"
        },
      },
    ],
  },
}

const dictionary = {
  "military": "Військовий",
  "volunteer_provides_help": "Волонтер, пропонує допомогу",
  "volunteer_requests_military_help": "Волонтер, запитує про допомогу для військових",
  "volunteer_requests_civilian_help": "Волонтер, запитує про допомогу для цивільних",
  "public_figure": "Громадський діяч",
  "journalist": "Журналіст / блогер",
  "anonymous": "Анон",
  "name": "Ім'я",
  "rank": "Звання",
  "location": "Локація",
  "deadline": "Дедлайн",
  "priority": "Пріорітет",
  "request": "Суть",
  "for": "Для кого",
  "contact": "Контактні дані",
  "organization": "Організація",
  "username": "Юзернейм",
  "scenario": "Тип",
}

const userState = {};

const renderOptions = (buttons, lang = ['uk', 'en'].includes(lang) ? lang : 'uk', ...opts) => ({
  inline_keyboard: _.chunk(Object.values(buttons).map(({ id, text }) => ({
    text: text[lang],
    callback_data: id
  })), 2), ...opts
})

const generateChannelMessage = ({ data: { id, username, first_name, last_name, language_code, scenario, icon, ...data } }) => `${icon} ${dictionary[scenario]} \\([@${username}](tg://user?id=${id})\\)\n${Object.keys(data).map(key => `${dictionary[key]}: ${data[key]}`).join('\n')}`

const writeGoogleSheets = ({ id, first_name, last_name, language_code, icon, ...data }) => {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  const getColumns = async (gsapi) => {
    const response = await gsapi.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_TABLE_ID,
      range: 'A1:Z1'
    });
    return response.data.values ? response.data.values[0] : [];
  }
  const addColumn = async (gsapi, column) => {
    const columns = await getColumns(gsapi);
    columns.push(column);
    await gsapi.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_TABLE_ID,
      range: 'A1:Z1',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [columns] }
    });
  }
  const appendData = async (gsapi, data) => {
    const columns = await getColumns(gsapi);
    for (let key in data) {
      if (!columns.includes(dictionary[key])) await addColumn(gsapi, dictionary[key]);
    }
    const values = columns.map(column => {
      const k = Object.keys(dictionary).find(key => dictionary[key] === column);
      if (k === 'scenario') return `${icon} ${dictionary[data[k]]}`
      if (k === 'username') return `https://t.me/${data[k]}`
      return data[k] || '-'
    });
    await gsapi.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_TABLE_ID,
      range: 'A2',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] }
    });
  }
  auth.authorize(() => {
    const gsapi = google.sheets({ version: 'v4', auth });
    appendData(gsapi, data);
  });
}


bot.onText(/\/start/, ({ from }) => {
  bot.sendMessage(from.id, scenarios.start.question[from.language_code], { reply_markup: renderOptions(scenarios.start.buttons, from.language_code) });
});

bot.on('callback_query', ({ from: { is_bot, ...from }, message: { message_id, chat: { id } }, data }) => {

  userState[from.id] = userState[from.id]
    ? { ...userState[from.id], scenario: data, icon: scenarios[data] && scenarios[data].icon ? scenarios[data].icon : "⚠️" }
    : { ...from, scenario: data, icon: scenarios[data] && scenarios[data].icon ? scenarios[data].icon : "⚠️", _questionIndex: 0 }

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

  return
});

bot.on('message', ({ from, text, from: { id }, ...rest }) => {

  if (!userState[id]) {
    !text.includes('\start') && bot.deleteMessage(rest.chat.id, rest.message_id)
    return
  }
  if (!userState[id].scenario || !scenarios[userState[id].scenario].questionSequence[userState[id]._questionIndex]) return

  if (!scenarios[userState[id].scenario].questionSequence) bot.deleteMessage(rest.chat.id, rest.message_id)

  userState[id][scenarios[userState[id].scenario].questionSequence[userState[id]._questionIndex].field] = text;

  userState[id]._questionIndex++;

  if (userState[id]._questionIndex >= scenarios[userState[id].scenario].questionSequence.length) {
    const { _questionIndex, ...data } = userState[id]
    writeGoogleSheets(data)
    bot.sendMessage(process.env.TELE_CHANNEL_ID, generateChannelMessage({ data }), { parse_mode: 'MarkdownV2' });
    setTimeout(() => {
      bot.sendMessage(from.id, scenarios.success.question[from.language_code], { reply_markup: renderOptions(scenarios.success.buttons, from.language_code) });
    }, 1000)
    delete userState[id]
    return;
  }

  bot.sendMessage(id,
    scenarios[userState[id].scenario].questionSequence[userState[id]._questionIndex].question[from.language_code]
  );
});