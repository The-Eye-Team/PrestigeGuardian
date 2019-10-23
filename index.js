//
const fetch = require("node-fetch");
const Discord = require("discord.js");
const client = new Discord.Client();

const TIME_SECOND = 1000;
const TIME_MINUTE = TIME_SECOND*60;


//
const SERVER_THEEYE = "302796547656253441";
const USER_PRESTIGEBOT = "613221791208439839";
const USER_501 = "285187201648820224";
const CHANNEL_BOTSPAM = "309583544777179137";
const CHANNEL_LOGSBOTS = "539266437928321024";
const CATEGORY_TESTING = ["360860654573322252","510381250117238795"];
const XP_PER_PRESTIGE = 42000;
const EMOTE_EGGPLANT = "🍆";


//
const config = require("./config.json");
let mostRecentMee6Request = 0;


//
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// prestige xp check request
client.on("message", (msg) => {
    if (msg.channel.id !== CHANNEL_BOTSPAM && !CATEGORY_TESTING.includes(msg.channel.parentID)) {
        return;
    }
    if (!msg.content.startsWith(">prestige")) {
        return;
    }
    if (Date.now() - mostRecentMee6Request < 1000*10) {
        msg.react("❌");
        return;
    }
    mostRecentMee6Request = Date.now();
    fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${SERVER_THEEYE}?limit=500`)
    .then(x => x.json())
    .then(x => {
        const search = x.players.filter(p => p.id === msg.author.id);
        if (search.length === 0) {
            msg.reply("I couldn't find you in the list. Your XP may be too low to check.");
            return;
        }
        const xp = search[0].xp;
        const progress = xp / XP_PER_PRESTIGE;
        const prestiges = parseInt(progress);
        const canPrestige = prestiges > 0;
        msg.delete();
        msg.reply(`You have ${xp} XP and are eligible for ${prestiges} prestiges.`+(canPrestige?` Click the ${EMOTE_EGGPLANT} to activate.`:""))
        .then(m => { if (canPrestige) m.react(EMOTE_EGGPLANT); });
    })
    .catch((reason) => {
        console.log(reason);
        msg.react("⛏");
    });
});

// user approval to send prestige request
client.on("messageReactionAdd", (reaction, user) => {
    if (reaction.message.author.id !== USER_PRESTIGEBOT) {
        return;
    }
    if (reaction.emoji.name !== EMOTE_EGGPLANT) {
        return;
    }
    if (user.id !== reaction.message.mentions.members.array()[0].id) {
        return;
    }
    if (!reaction.users.has(USER_PRESTIGEBOT)) {
        return;
    }
    const reg = /for [\d] prestiges/g;
    const search = reaction.message.content.match(reg);
    if (search.length === 0) {
        return;
    }
    const prestiges = parseInt(search[0].split(" ")[1]);
    if (prestiges === 0) {
        return;
    }
    if (Date.now() - reaction.message.createdAt.getTime() > TIME_MINUTE) {
        reaction.message.clearReactions();
        reaction.message.react("❌");
        return;
    }
    reaction.message.delete();
    reaction.message.channel.send(`Prestige request sent <@!${user.id}>!`);
    reaction.message.guild.channels.find(c => c.id === CHANNEL_LOGSBOTS).send(`<@!${USER_501}>, <@!${user.id}> is eligible for **${prestiges}** prestiges.`);
});


//
client.login(config.bot_token);
