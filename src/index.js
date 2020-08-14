const Discord = require('discord.js');
const doujin = require('./lib/doujin');

const config = require('./settings/bot_config.json');
const responses = require('./settings/bot_responses.json')
const n_rules = require('./settings/n-hentai_settings.json');
const n_settings = require('./settings/bot_n-hentai_settings.json')

const bot = new Discord.Client({ disableEveryone: true });

const { safe_search } = n_rules;
const { login_token } = config;
const { dm_res } = responses;

bot.on('ready', () => {
    console.log("ready, fight!");
});

bot.on('message', async message => {
    if (message.author.bot)
        return;

    if (message.channel.type === "dm" && !message.author.bot)
        return message.reply(dm_res);

    let message_content = message.content;

    //numberstation code
    if (message.channel.nsfw === true) {
        if (message.channel.name === n_settings.nhentai_channel) {
            if (isNaN(message_content)) {
                if (message_content === "random")
                    return nhentaiLookup(rngnumber(), message, true);
            } else
                return nhentaiLookup(message_content, message, false);
        }
    }
});

async function nhentaiLookup(number, message, random) {
    doujin.exists(number).then(async function () {

        let doujinshi = await doujin.getDoujin(number);
        const { link, title, id, tags, translated, artist, character, parody, language, title_link, page_count } = doujinshi;
        let footerText = `${n_settings.nhentai_embed_fotter_recomendation} ${message.author.username}`;
        let color = n_settings.nhentai_color;

        if (random) {
            if (n_settings.nhentai_safe_random) {
                if (check(tags)) {
                    return nhentaiLookup(rngnumber(), message, true);
                }
            }
            if (n_settings.nhentai_english_random) {
                if (language !== "english") {
                    return nhentaiLookup(rngnumber(), message, true);
                }
            }
            footerText = n_settings.nhentai_embed_fotter_random;
            color = randomColor();
        }

        const nEmbed = new Discord.MessageEmbed()
            .setColor(color)
            .setURL(await link)
            .setTitle(await title)
            .setImage(await title_link)
            .addField("id / pages", number + " / " + await page_count)
            .addField("language", await language)
            .setFooter(footerText, 'https://i.imgur.com/tD1hGhX.png');

        if (tags.length !== 0)
            nEmbed.addField("tags", await tags.join(' , '));

        if (character.length !== 0)
            nEmbed.addField("character", await character.join(' , '));

        if (parody.length !== 0)
            nEmbed.addField("parody", await parody.join(' , '));

        if (artist.length !== 0)
            nEmbed.addField("artist", await artist.join(' , '));

        message.channel.send(nEmbed);

        return;

    }).catch(function (error) {
        message.reply("Couldn't find Doujin " + number + ". Maybe it doesn't exist, maybe we just didn't search hard enough.");
    });
}

function rngnumber() {
    return Math.floor(Math.random() * n_settings.nhentai_arpoxMax).toString();
}

function randomColor() {
    let color = "#";
    for (let i = 0; i < 3; i++) {
        let hex = Math.floor(Math.random() * Math.floor(256));
        hex = hex.toString(16).padStart(2, '0');
        color += hex;
    }
    return color;
}

function check(nTags) {
    let forbidden = false;
    nTags.forEach(element => {
        if (safe_search.includes(element)) {
            forbidden = true;
            return;
        }
    });
    return forbidden;
}

bot.login(login_token);