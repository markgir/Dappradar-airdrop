# Dappradar-airdrop-notification
[![Check Airdrop](https://github.com/YogaSakti/Dappradar-airdrop/actions/workflows/airdrop.yml/badge.svg?event=push)](https://github.com/YogaSakti/Dappradar-airdrop/actions/workflows/airdrop.yml)


### How To
Clone this project

```bash
> git clone https://github.com/YogaSakti/Dappradar-airdrop.git
> cd Dappradar-airdrop

```

Install the dependencies:

```bash
> npm i
```

create .env before run the program
```
cp .env.example .env
```

Edit .env file: 

Input telegram bot token and telegram chatid, as well as the authorization token from dappradar.

```
botToken=
channelId=
dappradarAuthorization=
```

Run the bot:

```bash
> npm run start
```
