import Express from 'express';
import { questionList } from './docs';
import { Context, NarrowedContext, Telegraf } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
require('dotenv').config()

function log(tech: String, val: String) {
    console.warn(`[${tech}] ${val}`)
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateQuestion() {
    const qId = Math.floor(Math.random() * 1148);
    const q = questionList.at(qId);
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

type Question = {
    id: number;
    question: string;
    questionImage: null;
    answ1: string;
    answ2: string;
    answ3: string;
    correct: string;
} | {
    id: number;
    question: string;
    questionImage: string;
    answ1: string;
    answ2: string;
    answ3: string;
    correct: string;
} | undefined;

function questionText(question: Question): string {
    return `Întrebare: <b>${question?.question}</b>
        A. ${question?.answ1}
        B. ${question?.answ2}
        C. ${question?.answ3}`
}

async function sendQuestion(ctx: Context, msg: Message, isCountdown: boolean): Promise<(number)[]> {
    const question = generateQuestion()

    const countdown = await ctx.sendMessage(`Întrebarea va fi afișată în <b>5</b> secunde.`, { parse_mode: 'HTML' })
    await sleep(1000)
    for (var i = 4; i > 0; i--) {
        await ctx.telegram.editMessageText(countdown.chat.id, countdown.message_id, undefined, `Întrebarea va fi afișată în <b>${i}</b> secunde.`, { parse_mode: 'HTML' })
        await sleep(1000)
    }
    await ctx.telegram.deleteMessage(countdown.chat.id, countdown.message_id)

    var image: Message.PhotoMessage | undefined;
    if (question?.questionImage != null) {
        image = await ctx.sendPhoto('https://raw.githubusercontent.com/iamcosmin/drpcivbot/main/assets/image/' + question.questionImage)
    }

    if (question?.question.length! <= 300 && question?.answ1.length! <= 100 && question?.answ2.length! <= 100 && question?.answ3.length! <= 100) {
        const quiz = await ctx.sendQuiz(
            question?.question!,
            [question?.answ1!, question?.answ2!, question?.answ3!, 'primele două variante', 'ultimele două variante', 'prima și a treia variantă', 'toate trei variante'],
            {is_anonymous: false, correct_option_id: answerStrToInt(question?.correct), message_thread_id: msg?.message_thread_id, open_period: isCountdown ? 40 : undefined}
        )
        return [quiz.message_id];
    } else {
        const qText = await ctx.sendMessage(questionText(question), { parse_mode: "HTML" })

        const countdown2 = await ctx.sendMessage(`Întrebarea este prea lungă pentru a fi afișată ca sondaj, așa că este afișată separat. Sondajul va fi afișat în <b>20</b> de secunde.`, { parse_mode: 'HTML' })
        await sleep(1000)
        for (var i = 19; i > 0; i--) {
            await ctx.telegram.editMessageText(countdown2.chat.id, countdown2.message_id, undefined, `Întrebarea este prea lungă pentru a fi afișată ca sondaj, așa că este afișată separat. Sondajul va fi afișat în <b>${i}</b> secunde.`, { parse_mode: 'HTML' })
            await sleep(1000)
        }
        await ctx.telegram.deleteMessage(countdown2.chat.id, countdown2.message_id)
        const quiz = await ctx.sendQuiz(
            'Alege varianta corectă.',
            ['prima variantă', 'a doua variantă', 'a treia variantă', 'primele două variante', 'ultimele două variante', 'prima și a treia variantă', 'toate trei variante'],
            { is_anonymous: false, correct_option_id: answerStrToInt(question?.correct), message_thread_id: msg?.message_thread_id, open_period: isCountdown ? 40 : undefined},
        );
        return [qText.message_id, quiz.message_id]
    }
}

async function sendQuiz(ctx: Context) {
    const oldMsg = ctx.message;
    await ctx.deleteMessage(ctx.message?.message_id)

    const advise = await ctx.reply(`în 10 de secunde vei începe un chestionar.
Un chestionar conține 26 de întrebări a câte 40 de secunde fiecare.
După ce trec cele 40 de secunde, întrebarea va fi ștearsă și una nouă va fi afișată, așa că răspunde repede.
Succes!`)
    await sleep(10000)
    await ctx.deleteMessage(advise.message_id)

    const counter = await ctx.sendMessage('0/26')
    for (var i = 1; i <= 26; i++) {
        await ctx.telegram.editMessageText(counter.chat.id, counter.message_id, undefined, `${i}/26`)
        const question: number[] = await sendQuestion(ctx, counter,  true)
        await sleep(40000)
        for (const q in question) {
            await ctx.deleteMessage(Number.parseInt(q))
        }
    }
    await ctx.sendMessage('Ai terminat chestionarul.')
}

bot.command('i', async (ctx) => {
    const msg = ctx.message;
    await ctx.deleteMessage();
    sendQuestion(ctx, msg, false)
})

bot.command('c', async (ctx) => {
    sendQuiz(ctx)
})

bot.launch()
log('Bot', 'Bot launched successfully.')