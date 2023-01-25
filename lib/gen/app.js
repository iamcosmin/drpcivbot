"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const docs_1 = require("./docs");
const telegraf_1 = require("telegraf");
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
const bot = new telegraf_1.Telegraf(token);
log('Bot', 'Polling started successfully.');
bot.command('i', async (ctx) => {
    const question = generateQuestion();
    if ((question === null || question === void 0 ? void 0 : question.questionImage) != null) {
        await ctx.sendPhoto('https://raw.githubusercontent.com/iamcosmin/drpcivbot/main/assets/image/' + question.questionImage);
    }
    const message = await ctx.sendMessage('5', { message_thread_id: ctx.message.message_thread_id });
    await sleep(1000);
    for (var i = 1; i < 5; i++) {
        bot.telegram.editMessageText(message.chat.id, message.message_id, undefined, (5 - i).toString());
        await sleep(1000);
    }
    bot.telegram.editMessageText(message.chat.id, message.message_id, undefined, `Alege varianta corectă în sondajul de mai jos.

    Întrebare: <b>${question === null || question === void 0 ? void 0 : question.question}</b>
        A. ${question === null || question === void 0 ? void 0 : question.answ1}
        B. ${question === null || question === void 0 ? void 0 : question.answ2}
        C. ${question === null || question === void 0 ? void 0 : question.answ3}`, { parse_mode: 'HTML' });
    ctx.sendQuiz('Alege varianta corectă.', ['A', 'B', 'C', 'AB', 'BC', 'AC', 'ABC'], { is_anonymous: false, correct_option_id: answerStrToInt(question === null || question === void 0 ? void 0 : question.correct), message_thread_id: ctx.message.message_thread_id, });
});
bot.launch();
log('Bot', 'Bot launched successfully.');
