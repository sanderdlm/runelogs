# Runelogs 2.0


## Install locally (for development)
1. git clone
2. cd into folder
3. run ```composer install``` to load all the dependencies
4. run ```sqlite3 data/runelogs.db < schema.sql``` to generate a local database file
5. run ```composer start``` to launch a CLI web server
6. Load localhost:8080 in your browser

If you want to replicate the live site (on a VPS), you'll have to set up a cron job like this
```
*/15 * * * * php /src/update.php
```
and install a webserver (Apache/nginx) and point it to the /public folder.

## Storage estimates
For each event we store the following things:
* An ID - 4-6 digit integer - ~3 bytes
* A user ID - 2-4 digit integer - ~2 bytes
* The event title - 20-30 character string - ~25 bytes
* The event description - 50-120 character string - ~75 bytes
* A timestamp - 10 digit integer - ~5 bytes

=> total 110 bytes

For each exp record we store the following things:
* An ID - 4-6 digit integer - ~3 bytes
* A user ID - 2-4 digit integer - ~2 bytes
* The skill ID - 2 digit integer - ~2 bytes
* A year+day unique identifier - 7 digit integer - ~4 bytes
* The experience value - 9 digit integer - ~5 bytes

=> total 15 bytes

Each player will have 27 experience records each day, which means the db will grow at least 405 bytes per day per user.