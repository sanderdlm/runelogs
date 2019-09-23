# Runelogs

## Overview

This is the GitHub repository for the Runelogs project.

* This website is a Symfony 4 application.
* It's currently hosted on 2 $5 DigitalOcean droplets under my personal account.

## What

Runelogs runs on an hourly, recurring task that fetches Runemetrics data for all its users and stores it.

It keeps a single experience record per skill, per player, per day. Daily gains are calculated by subtracting two experience log from each other during runtime (but cached in Redis).

There's also a very rudimentary name change detection in place based on Adventure Log history.

## Spread the Word!

Runelogs needs users to fill it's database! If you like the project you can help spread the word by telling your friends about it in-game, on Discord, Twitter or Reddit.

## How to Contribute

1. Fork and clone
2. Create a branch for the feature you'd like to add. E.g. 'add-clan-template'
3. Once finished, submit pull request to staging branch for consideration

### Contributor Style Guide

2. Please use four (4) spaces to indent text; do not use tabs.
3. Wrap all text to 120 characters.
4. Code samples should adhere to PSR-2 or higher.

## Where

<https://runelo.gs>

## Why

Most, if not all, of the other tracker websites are closed-source and I believe we as a community can build a better product.

This leads in to the project goals, which are:
* Open-source
* Reliable (no downtime, even during DXP)
* Responsive, mobile view
* Automatic tracking (don't need to visit)
* Detect name changes
* No fixed ownership (transfer ownership to whoever is contributing the most at that time)

### Collaborators

* [Sander](https://twitter.com/dreadnip)

## License

MIT