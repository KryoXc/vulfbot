var Discord = require('discord.io');
var winston  = require('winston');
var auth = require('./auth.json');

const sqlite3 = require('sqlite3').verbose();
const FeedParser = require('feedparser');
const request = require('request');

// setup logger
logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.File({
            filename: './logs/bot.log',
            maxsize: 5242880,
            maxFiles: 5,
            colorize: false
        })
    ]
});

// establish connection to database
var db = new sqlite3.Database('./vulf.db', function(err) {
    if (err) {
        logger.error(err.message);
    }
    logger.info("connected to vulf.db.");
});
let checkSQL = 'SELECT * FROM vids WHERE link=?;';
let createNewRowSQL = 'INSERT INTO vids (link) VALUES (?);'


//Initialize bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});
var musicChannel = '438780342976118794';


bot.on('ready', function(evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');

    //setup polling for new vids
    setInterval(fetch, 10000);
});


bot.on('message', function(user, userID, channelID, message, evt) {
    // Out bot needs to know when to execute a command
    var botMentionID = '<@506932314786365471>';
    if (message.startsWith(botMentionID)) {
        var args = message.substring(botMentionID.length + 1).split(' ');
        var cmd = args[0];
        switch(cmd.toLowerCase()) {
            case 'hello':
            case 'yo':
            case 'hi':
                bot.sendMessage({
                    to: channelID,
                    message: 'Yo What\'s good'
                });
                break;
            case 'plagueis':
                bot.sendMessage({
                    to: channelID,
                    message: '🤔🤔 Did you 🤔🤔 ever hear 👂🖐 the Tragedy 😯 of Darth Plagueis 😌 the W\ise? It\'s a 😱😰Sith legend😨😧. Darth Plagueis👈👈 was a 👤Dark Lord👤 of the 👹Sith👹 so 💪powerful💪 and so 👌wise👌, he could use the 🖐Force🖐 to influence the 👀midi-chlorians👀 to create😮...life😲😲. He had such a knowledge of the 🏴Dark Side🏴, he could even keep the ones he cared😍😍 about❤❤...from ⚰dying⚰. He became so 💪powerful💪, the only thing he was 😰afraid😰 of was losing his 💪power💪...which, eventually of course😮😮, he did😣. Unfortunately😯, he taught😕 his 👨apprentice👨 everything he knew. Then his apprentice 😵killed😵 him in his 😴sleep😴. Ironic. He could save others from 💀death💀...but not😵imself.'
                });
                break;
            default:
                bot.sendMessage({
                    to: channelID,
                    message: 'I have no idea what you\'re talking about. try again.'
                });
                break;
        }
    }
    if (message.substring(0,1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        
        args = args.splice(1);
        switch(cmd) {
            case 'ping':
                bot.sendMessage({
                  to: channelID,
                  message: 'Pong!'
                });
                break;
            case 'test':
                bot.sendMessage({
                    to: musicChannel,
                    message: "this will be a song."
                });
                break;
        }
    }
});

// polling code
function fetch() {
    var req = request('https://www.youtube.com/feeds/videos.xml?user=DJparadiddle');
    // create feed parser
    var feedParser = new FeedParser();

    req.on('error', function (err) {
        logger.info(err);
    });

    req.on('response', function (res) {
        var stream = this;

        if (res.statusCode !== 200) {
            this.emit('error', new Error('Bad status Code: ' + res.statusCode));
        } else {
            stream.pipe(feedParser);
        }
    });

    feedParser.on('error', function(err) {
        logger.error(err);
    });

    feedParser.on('readable', function () {
        var stream = this;
        var meta = this.meta;
        var item;

        while(item = stream.read()) {
            check(item.link);
        }
    });
}

function check(item) {
    db.all(checkSQL, [item], (err, row) => {
        if (err) {
            logger.error(err.message);
        } else {
            if(row.length == 0) {
                db.run(createNewRowSQL, [item], function(err) {
                    if (err) {
                        logger.error(err.message);
                    } 
                    logger.info('inserted new row with id ${this.lastID}');
                });
                bot.sendMessage({
                    to: musicChannel,
                    message: item
                });
            }
        }
    });
}
