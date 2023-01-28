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
    const qId = Math.floor(Math.random() * 1148);
    const q = docs_1.questionList.at(qId);
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
function questionText(question) {
    return `Întrebare: <b>${question === null || question === void 0 ? void 0 : question.question}</b>
        A. ${question === null || question === void 0 ? void 0 : question.answ1}
        B. ${question === null || question === void 0 ? void 0 : question.answ2}
        C. ${question === null || question === void 0 ? void 0 : question.answ3}`;
}
async function sendQuestion(ctx, msg, isCountdown) {
    const question = generateQuestion();
    const countdown = await ctx.sendMessage(`Întrebarea va fi afișată în <b>5</b> secunde.`, { parse_mode: 'HTML' });
    await sleep(1000);
    for (var i = 4; i > 0; i--) {
        await ctx.telegram.editMessageText(countdown.chat.id, countdown.message_id, undefined, `Întrebarea va fi afișată în <b>${i}</b> secunde.`, { parse_mode: 'HTML' });
        await sleep(1000);
    }
    await ctx.telegram.deleteMessage(countdown.chat.id, countdown.message_id);
    var image;
    if ((question === null || question === void 0 ? void 0 : question.questionImage) != null) {
        image = await ctx.sendPhoto('https://raw.githubusercontent.com/iamcosmin/drpcivbot/main/assets/image/' + question.questionImage);
    }
    if ((question === null || question === void 0 ? void 0 : question.question.length) <= 300 && (question === null || question === void 0 ? void 0 : question.answ1.length) <= 100 && (question === null || question === void 0 ? void 0 : question.answ2.length) <= 100 && (question === null || question === void 0 ? void 0 : question.answ3.length) <= 100) {
        const quiz = await ctx.sendQuiz(question === null || question === void 0 ? void 0 : question.question, [question === null || question === void 0 ? void 0 : question.answ1, question === null || question === void 0 ? void 0 : question.answ2, question === null || question === void 0 ? void 0 : question.answ3, 'primele două variante', 'ultimele două variante', 'prima și a treia variantă', 'toate trei variante'], { is_anonymous: false, correct_option_id: answerStrToInt(question === null || question === void 0 ? void 0 : question.correct), message_thread_id: msg === null || msg === void 0 ? void 0 : msg.message_thread_id, open_period: isCountdown ? 40 : undefined });
        return [quiz.message_id];
    }
    else {
        const qText = await ctx.sendMessage(questionText(question), { parse_mode: "HTML" });
        const countdown2 = await ctx.sendMessage(`Întrebarea este prea lungă pentru a fi afișată ca sondaj, așa că este afișată separat. Sondajul va fi afișat în <b>20</b> de secunde.`, { parse_mode: 'HTML' });
        await sleep(1000);
        for (var i = 19; i > 0; i--) {
            await ctx.telegram.editMessageText(countdown2.chat.id, countdown2.message_id, undefined, `Întrebarea este prea lungă pentru a fi afișată ca sondaj, așa că este afișată separat. Sondajul va fi afișat în <b>${i}</b> secunde.`, { parse_mode: 'HTML' });
            await sleep(1000);
        }
        await ctx.telegram.deleteMessage(countdown2.chat.id, countdown2.message_id);
        const quiz = await ctx.sendQuiz('Alege varianta corectă.', ['prima variantă', 'a doua variantă', 'a treia variantă', 'primele două variante', 'ultimele două variante', 'prima și a treia variantă', 'toate trei variante'], { is_anonymous: false, correct_option_id: answerStrToInt(question === null || question === void 0 ? void 0 : question.correct), message_thread_id: msg === null || msg === void 0 ? void 0 : msg.message_thread_id, open_period: isCountdown ? 40 : undefined });
        return [qText.message_id, quiz.message_id];
    }
}
async function sendQuiz(ctx) {
    var _a;
    const oldMsg = ctx.message;
    await ctx.deleteMessage((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.message_id);
    const advise = await ctx.reply(`în 10 de secunde vei începe un chestionar.
Un chestionar conține 26 de întrebări a câte 40 de secunde fiecare.
După ce trec cele 40 de secunde, întrebarea va fi ștearsă și una nouă va fi afișată, așa că răspunde repede.
Succes!`);
    await sleep(10000);
    await ctx.deleteMessage(advise.message_id);
    const counter = await ctx.sendMessage('0/26');
    for (var i = 1; i <= 26; i++) {
        await ctx.telegram.editMessageText(counter.chat.id, counter.message_id, undefined, `${i}/26`);
        const question = await sendQuestion(ctx, counter, true);
        await sleep(40000);
        for (const q in question) {
            await ctx.deleteMessage(Number.parseInt(q));
        }
    }
    await ctx.sendMessage('Ai terminat chestionarul.');
}
bot.command('i', async (ctx) => {
    const msg = ctx.message;
    await ctx.deleteMessage();
    sendQuestion(ctx, msg, false);
});
bot.command('c', async (ctx) => {
    sendQuiz(ctx);
});
bot.launch();
log('Bot', 'Bot launched successfully.');
