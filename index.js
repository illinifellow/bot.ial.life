require('dotenv').config()
const _ = require('lodash')
const { google } = require('googleapis')
const TelegramBot = require('node-telegram-bot-api')
const bot = new TelegramBot(process.env.TELE_TOKEN, { polling: true })
const config = require('./config.json')
const dictionary = require('./dictionary.json')

const userState = {}

const escapeMarkdown = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

const renderOptions = (
  buttons,
  lang = ['uk', 'en'].includes(lang) ? lang : 'uk',
  ...opts
) => ({
  inline_keyboard: _.chunk(
    Object.values(buttons).map(({ id, text }) => ({
      text: text[lang],
      callback_data: id,
    })),
    2,
  ),
  ...opts,
})

const generateChannelMessage = ({
  data: {
    id,
    username,
    first_name,
    last_name,
    language_code,
    scenario,
    icon,
    ...data
  },
}) =>
  `${icon} ${dictionary[scenario]
  } \\([@${username}](tg://user?id=${id})\\)\n${Object.keys(data)
    .map((key) => `${dictionary[key]}: ${escapeMarkdown(data[key])}`)
    .join('\n')}`

const writeGoogleSheets = ({
  id,
  first_name,
  last_name,
  language_code,
  icon,
  ...data
}) => {
  console.log('WRITE_GOOGLE_SHEETS', data)
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY,
    ['https://www.googleapis.com/auth/spreadsheets'],
  )
  const getColumns = async (gsapi) => {
    const response = await gsapi.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_TABLE_ID,
      range: 'A1:Z1',
    })
    return response.data.values ? response.data.values[0] : []
  }
  const addColumn = async (gsapi, column) => {
    const columns = await getColumns(gsapi)
    columns.push(column)
    await gsapi.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_TABLE_ID,
      range: 'A1:Z1',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [columns] },
    })
  }
  const appendData = async (gsapi, data) => {
    const columns = await getColumns(gsapi)
    for (let key in data) {
      if (!columns.includes(dictionary[key]))
        await addColumn(gsapi, dictionary[key])
    }
    const values = columns.map((column) => {
      const k = Object.keys(dictionary).find(
        (key) => dictionary[key] === column,
      )
      if (k === 'scenario') return `${icon} ${dictionary[data[k]]}`
      if (k === 'username') return `https://t.me/${data[k]}`
      return data[k] || '-'
    })
    await gsapi.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_TABLE_ID,
      range: 'A2',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] },
    })
  }
  auth.authorize(() => {
    const gsapi = google.sheets({ version: 'v4', auth })
    appendData(gsapi, data)
  })
}

bot.onText(/\/start/, ({ from }) => {
  console.log('START', from)
  bot.sendMessage(from.id, config.start.question[from.language_code], {
    reply_markup: renderOptions(config.start.buttons, from.language_code),
  })
})

bot.on(
  'callback_query',
  ({
    from: { is_bot, ...from },
    message: {
      message_id,
      chat: { id },
    },
    data,
  }) => {
    console.log('QUERY', { from, message, data })
    userState[from.id] = userState[from.id]
      ? {
        ...userState[from.id],
        scenario: data,
        icon: config[data] && config[data].icon ? config[data].icon : '⚠️',
      }
      : {
        ...from,
        scenario: data,
        icon: config[data] && config[data].icon ? config[data].icon : '⚠️',
        _questionIndex: 0,
      }

    if (data === 'start') {
      bot.deleteMessage(id, message_id)
      bot.sendMessage(id, config.start.question[from.language_code], {
        reply_markup: renderOptions(config[data].buttons, from.language_code),
      })
      return
    }

    if (!!config[data].buttons) {
      bot.editMessageText(config[data].question[from.language_code], {
        chat_id: id,
        message_id,
        reply_markup: renderOptions(config[data].buttons, from.language_code),
      })
      return
    } else if (config[data].isFinalSequence) {
      bot.editMessageText(
        config[data].questionSequence[userState[from.id]._questionIndex]
          .question[from.language_code],
        { chat_id: id, message_id },
      )
      return
    }

    return
  },
)

bot.on('message', ({ from, text, from: { id }, ...rest }) => {
  console.log('MESSAGE', { from, text, ...rest })
  if (!userState[id]) {
    !text.includes('start') && bot.deleteMessage(rest.chat.id, rest.message_id)
    return
  }
  if (
    !userState[id].scenario ||
    !config[userState[id].scenario].questionSequence[
    userState[id]._questionIndex
    ]
  )
    return

  if (!config[userState[id].scenario].questionSequence)
    bot.deleteMessage(rest.chat.id, rest.message_id)

  userState[id][
    config[userState[id].scenario].questionSequence[
      userState[id]._questionIndex
    ].field
  ] = text

  userState[id]._questionIndex++

  if (
    userState[id]._questionIndex >=
    config[userState[id].scenario].questionSequence.length
  ) {
    const { _questionIndex, ...data } = userState[id]
    writeGoogleSheets(data)
    bot.sendMessage(
      process.env.TELE_CHANNEL_ID,
      generateChannelMessage({ data }),
      { parse_mode: 'MarkdownV2' },
    )
    setTimeout(() => {
      bot.sendMessage(from.id, config.success.question[from.language_code], {
        reply_markup: renderOptions(config.success.buttons, from.language_code),
      })
    }, 1000)
    delete userState[id]
    return
  }

  bot.sendMessage(
    id,
    config[userState[id].scenario].questionSequence[
      userState[id]._questionIndex
    ].question[from.language_code],
  )
})
