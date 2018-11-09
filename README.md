#VulfBot
A node bot for Discord that posts updates from the Vulfpeck YouTube channel.

#Installation
This is a bit involved. 
```
npm install 
```
will take care of the dependencies. From there you must:

- install node.js for your platform.
- Register your bot on your Discord server (requires admin access)
- create the file `auth.json` and put it in the bot directory. This will contain your Discord bot token.
- create the Sqlite3 database and populate it with the links from the YouTube RSS feed at [the VulfPeck RSS feed](https://www.youtube.com/feeds/videos.xml?user=DJparadiddle)
run:
```
mkdir logs
touch logs/bot.log
```
- get the ID of the channel you want your bot to post to. This can be found by setting Discord to developer mode, right clicking on the channel, and clicking `Copy ID`. Copy this value to the `musicChannel` value in bot.js.

-run:
```
node bot.js &
```

All done! 

This might all be automated, someday. But for now it's just for fun!
