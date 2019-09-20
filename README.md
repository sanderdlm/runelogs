# Runelogs


## Storage estimates
For each event we store the following things:
* An ID - unsigned int
* A user ID - unsigned int
* The event title - 20-30 character string - ~25 bytes
* The event description - 50-120 character string - ~75 bytes
* A timestamp - int

On average one event record takes up around 85 bytes. A full record (with index) takes up 151 bytes, which makes the index 65 bytes by itself.


For each exp record we store the following things:
* An ID
* A user ID
* The skill ID
* A year+day unique identifier
* The experience value

One average one experience log takes up around 42 bytes. The index on logs actually takes up more than the log itself, 60 bytes. This is required for (reasonable) fast fetching from the database though.


Each player will have 27 experience records each day, and on average 5 events. This means the db will grow at least 2700+755 bytes per day per user, or 3.5kb.

If we wanted to support 50k users we'd have to grow 175mb per day. With a 50GB SSD on a standard VPS that would mean 285 days of consecutive tracking before we'd hit capacity.

A more reasonable approach would be to limit tracking to only site visitors or really active players.