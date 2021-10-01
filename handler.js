"use strict";

const axios = require("axios");
const TelegramBot = require('node-telegram-bot-api');

const axiosTelegram = axios.create({
    baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
})

const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

module.exports.telegramWebhook = async (event) => {
    if (event['pathParameters'].token !== process.env.TELEGRAM_BOT_TOKEN)
        return { statusCode: 200 }
    const data = JSON.parse(event.body);
    try {
        let response = '';
        if ('message' in data) {
            const botCommands = [];
            if ('entities' in data.message) {
                data.message.entities.forEach((entity) => {
                    if (entity.type === 'bot_command') {
                        botCommands.push(data.message.text.slice(entity.offset, entity.length));
                    }
                })
            }

            let botCommand = botCommands[0] || ''
            switch (botCommand) {
                default:
                    response = await telegramBot.sendMessage(
                        data.message['chat'].id,
                        data.message.text
                    );
                    break;
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    } catch (e) {
        await telegramBot.sendMessage(data.message['chat'].id, e.toString());
        return {
            statusCode: 200,
            body: JSON.stringify({
                status: 500,
                error: e.toString()
            }),
        };
    }
}

module.exports.telegram = async (event) => {
    const response = await axiosTelegram.post(event['method'], {
        ...event
    });

    return {
        statusCode: 200,
        body: JSON.stringify(response.data),
    };
}

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v2.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};
