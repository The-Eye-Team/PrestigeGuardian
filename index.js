//
const fetch = require("node-fetch");
const Discord = require("discord.js");
const client = new Discord.Client();


//
const SERVER_THEEYE = "302796547656253441";
const USER_PRESTIGEBOT = "613221791208439839";
const USER_501 = "285187201648820224";
const CHANNEL_BOTSPAM = "309583544777179137";
const CHANNEL_LOGSBOTS = "522448912217407511";
const CATEGORY_TESTING = ["360860654573322252","360860654573322252"];
const XP_PER_PRESTIGE = 42000;


//
const config = require("./config.json");


//
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
    if (msg.channel.id === CHANNEL_BOTSPAM || CATEGORY_TESTING.includes(msg.channel.parentID)) {
        if (msg.content.startsWith(">prestige")) {
            fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${SERVER_THEEYE}?limit=900`)
            .then(x => x.json())
            .then(x => {
                const xp = x.players.filter(p => p.id === msg.author.id)[0].xp;
                const progress = xp / XP_PER_PRESTIGE;
                const prestiges = parseInt(progress);
                const canPrestige = prestiges > 0;
                msg.reply(`You have ${xp} XP and are eligible for ${prestiges} prestiges. You are ${(progress*100).toFixed(1)}% of the way there!`+(canPrestige?" Click the 🍆 to activate.":""))
                .then(m => { if (canPrestige) m.react("🍆"); });
            });
        }
    }
});

client.on("messageReactionAdd", (reaction, user) => {
    if (reaction.message.author.id === USER_PRESTIGEBOT) {
        if (reaction.emoji.name === "🍆") {
            if (user.id === reaction.message.mentions.members.array()[0].id) {
                if (reaction.users.has(USER_PRESTIGEBOT)) {
                    const reg = /for [\d] prestiges/g;
                    const search = reaction.message.content.match(reg);
                    if (search.length === 0) {
                        return
                    }
                    const prestiges = parseInt(search[0].split(" ")[1]);
                    if (prestiges > 0) {
                        if (Date.now() - reaction.message.createdAt.getTime() < 1000*60) {
                            reaction.message.delete();
                            reaction.message.channel.send("Prestige request sent!");
                            reaction.message.guild.channels.find(c => c.id === CHANNEL_LOGSBOTS).send(`<@!${USER_501}>, <@!${user.id}> is eligible for **${prestiges}** prestiges.`);
                        }
                        else {
                            reaction.message.clearReactions();
                            reaction.message.react("❌");
                        }
                    }
                }
            }
        }
    }
});


//
client.login(config.bot_token);
