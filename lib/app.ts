import Express from 'express';
import { questionList } from './docs';
import { Telegraf } from 'telegraf';
require('dotenv').config()

function log(tech: String, val: String) {
    console.warn(`[${tech}] ${val}`)
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateQuestion() {
    var qId = Math.floor(Math.random() * 1148);
    var q = questionList.at(qId);
    return q;
}

function answerStrToInt(str: String | undefined): number {
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

log('Bot', 'Starting server...')
const app = Express()
const port = 3000
app.get('/', (req, res) => res.send("Hello World."))
app.listen(port, () => log('Bot', 'Server started successfully.'))


log('Bot', 'Initializing API.')
const token = process.env.TOKEN;

log('Bot', 'Initializing...')
const bot = new Telegraf(token!)

log('Bot', 'Polling started successfully.')

bot.command('i', async (ctx) => {
    const question = generateQuestion()
    if (question?.questionImage != null) {
        await ctx.sendPhoto('https://raw.githubusercontent.com/iamcosmin/drpcivbot/main/assets/image/' + question.questionImage)
    }
    const message = await ctx.sendMessage('5', {message_thread_id: ctx.message.message_thread_id})
    await sleep(1000)
    for (var i = 1; i < 5; i++) {
        bot.telegram.editMessageText(message.chat.id, message.message_id, undefined, (5 - i).toString())
        await sleep(1000)
    }
    bot.telegram.editMessageText(message.chat.id, message.message_id, undefined,
`Alege varianta corectă în sondajul de mai jos.

    Întrebare: <b>${question?.question}</b>
        A. ${question?.answ1}
        B. ${question?.answ2}
        C. ${question?.answ3}`, { parse_mode: 'HTML' })
    ctx.sendQuiz('Alege varianta corectă.', ['A', 'B', 'C', 'AB', 'BC', 'AC', 'ABC'], {is_anonymous: false, correct_option_id: answerStrToInt(question?.correct), message_thread_id: ctx.message.message_thread_id, });
})

bot.launch()
log('Bot', 'Bot launched successfully.')