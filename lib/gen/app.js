"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const express_1 = __importDefault(require("express"));
const docs_1 = require("./docs");
require('dotenv').config();
function log(tech, val) {
    console.warn(`[${tech}] ${val}`);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function generateQuestion() {
    var qId = Math.floor(Math.random() * 1148);
    var q = docs_1.questionList.at(qId);
    return q;
}
function answerStrToInt(str) {
    switch (str) {
        case 'A':
            return 0;
        case 'B':
            return 1;
        case 'C':
            return 2;
        case 'AB':
            return 3;
        case 'BC':
            return 4;
        case 'AC':
            return 5;
        case 'ABC':
            return 6;
        default:
            return -1;
    }
}
log('Bot', 'Starting server...');
const app = (0, express_1.default)();
const port = 3000;
app.get('/', (req, res) => res.send("Hello World."));
app.listen(port, () => log('Bot', 'Server started successfully.'));
log('Bot', 'Initializing API.');
const token = process.env.TOKEN;
log('Bot', 'Initializing...');
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
log('Bot', 'Polling started successfully.');
bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    if (text === null || text === void 0 ? void 0 : text.startsWith('/start')) {
        bot.sendMessage(chatId, 'Buna ziua de pe Node.js.');
    }
    if (text === null || text === void 0 ? void 0 : text.startsWith('/i')) {
        const message = await bot.sendMessage(chatId, '5');
        await sleep(1000);
        for (var i = 1; i < 5; i++) {
            bot.editMessageText((5 - i).toString(), { chat_id: chatId, message_id: message.message_id });
            await sleep(1000);
        }
        const question = generateQuestion();
        bot.editMessageText(`Alege varianta corectă în sondajul de mai jos.
    Întrebare: <b>${question === null || question === void 0 ? void 0 : question.question}</b>
        A. ${question === null || question === void 0 ? void 0 : question.answ1}
        B. ${question === null || question === void 0 ? void 0 : question.answ2}
        C. ${question === null || question === void 0 ? void 0 : question.answ3}`, { message_id: message.message_id, chat_id: chatId, parse_mode: 'HTML' });
        bot.sendPoll(chatId, 'Alege varianta corectă.', ['A', 'B', 'C', 'AB', 'BC', 'AC', 'ABC'], { type: 'quiz', correct_option_id: answerStrToInt(question === null || question === void 0 ? void 0 : question.correct) });
    }
});
